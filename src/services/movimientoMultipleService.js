import pool from "../config/db.js";
import { usuarioPuedeDarEntrada } from "./botEntradaService.js";
import { usuarioPuedeDarSalida } from "./botSalidaService.js";

export class MovimientoMultipleError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "MovimientoMultipleError";
    this.status = status;
  }
}

function fechaArgentinaISO() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function normalizarExpedientesMultiples(expedientes) {
  if (!Array.isArray(expedientes) || expedientes.length < 2) {
    throw new MovimientoMultipleError("Selecciona al menos dos expedientes");
  }
  if (expedientes.length > 100) {
    throw new MovimientoMultipleError("No se pueden procesar mas de 100 expedientes por vez");
  }

  const unicos = new Map();
  for (const item of expedientes) {
    const normalizado = {
      codigo: String(item?.codigo || "").trim(),
      numero: Number(item?.numero),
      anio: Number(item?.anio),
    };
    if (
      !/^[a-zA-Z0-9]+$/.test(normalizado.codigo) ||
      !Number.isInteger(normalizado.numero) ||
      normalizado.numero <= 0 ||
      !Number.isInteger(normalizado.anio) ||
      normalizado.anio < 0 ||
      normalizado.anio > 9999
    ) {
      throw new MovimientoMultipleError("Hay expedientes con datos invalidos");
    }
    unicos.set(
      `${normalizado.codigo}-${normalizado.numero}-${normalizado.anio}`,
      normalizado
    );
  }
  if (unicos.size !== expedientes.length) {
    throw new MovimientoMultipleError("La seleccion contiene expedientes repetidos");
  }
  return [...unicos.values()].sort((a, b) =>
    `${a.codigo}-${a.numero}-${a.anio}`.localeCompare(
      `${b.codigo}-${b.numero}-${b.anio}`
    )
  );
}

function validarFecha(valor, etiqueta) {
  const fecha = valor || fechaArgentinaISO();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new MovimientoMultipleError(`${etiqueta} invalida`);
  }
  return fecha;
}

async function obtenerUsuarioYSector(client, usuarioSesion) {
  const id = Number(usuarioSesion?.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new MovimientoMultipleError("Sesion de usuario invalida", 401);
  }
  const result = await client.query(
    `SELECT u.id, u.usuario, COALESCE(u.nombreusuario, u.nombre) AS nombre,
            u.nivel, u.codigosector, s.sector
     FROM usuarios u
     LEFT JOIN sector s
       ON s.codigosector::text = u.codigosector::text
      AND s.habilitado IS NOT FALSE
     WHERE u.id = $1 AND u.habilitado IS NOT FALSE
     LIMIT 1`,
    [id]
  );
  const usuario = result.rows[0];
  if (!usuario) throw new MovimientoMultipleError("Usuario no autorizado", 403);
  if (!usuario.codigosector || !usuario.sector) {
    throw new MovimientoMultipleError("No se pudo determinar el sector del usuario");
  }
  return usuario;
}

async function obtenerEstadoBloqueado(client, clave) {
  const expedienteResult = await client.query(
    `SELECT codinum, TRIM(codigo::text) AS codigo, numero, anio, asunto, fojas,
            tipo, beneficiario, partida
     FROM expedientes
     WHERE TRIM(codigo::text) = $1
       AND numero::bigint = $2
       AND anio::integer = $3
       AND habilitado IS NOT FALSE
     ORDER BY codinum DESC
     LIMIT 1
     FOR UPDATE`,
    [clave.codigo, clave.numero, clave.anio]
  );
  const expediente = expedienteResult.rows[0];
  if (!expediente) {
    throw new MovimientoMultipleError(
      `Expediente ${clave.codigo}-${clave.numero}/${clave.anio} no encontrado`,
      404
    );
  }

  const movimientoResult = await client.query(
    `SELECT id, movimiento, estado, origen, destino, codigosector, codigoren, coddestino
     FROM movimiento
     WHERE TRIM(codigo::text) = $1
       AND numero::bigint = $2
       AND anio::integer = $3
       AND habilitado IS NOT FALSE
     ORDER BY movimiento DESC NULLS LAST, id DESC
     LIMIT 1
     FOR UPDATE`,
    [clave.codigo, clave.numero, clave.anio]
  );
  return { expediente, movimiento: movimientoResult.rows[0] };
}

export async function registrarEntradaMultiple(data, usuarioSesion) {
  const expedientes = normalizarExpedientesMultiples(data.expedientes);
  const fecha = validarFecha(data.fechaentrada, "Fecha de entrada");
  const motivo = String(data.motivo || "").trim();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const usuario = await obtenerUsuarioYSector(client, usuarioSesion);
    const preparados = [];
    for (const clave of expedientes) {
      const actual = await obtenerEstadoBloqueado(client, clave);
      if (!usuarioPuedeDarEntrada(usuario, actual.movimiento)) {
        throw new MovimientoMultipleError(
          `El expediente ${clave.codigo}-${clave.numero}/${clave.anio} no esta disponible para entrada en tu sector`,
          409
        );
      }
      preparados.push(actual);
    }

    const sectorEntradaCodigo = String(
      preparados[0].movimiento.coddestino || ""
    );
    if (
      !sectorEntradaCodigo ||
      preparados.some(
        (actual) =>
          String(actual.movimiento.coddestino || "") !== sectorEntradaCodigo
      )
    ) {
      throw new MovimientoMultipleError(
        "Todos los expedientes deben estar dirigidos al mismo sector",
        409
      );
    }
    const sectorResult = await client.query(
      `SELECT codigosector, sector
       FROM sector
       WHERE codigosector::text = $1::text
         AND habilitado IS NOT FALSE
       LIMIT 1`,
      [sectorEntradaCodigo]
    );
    const sectorEntrada = sectorResult.rows[0];
    if (!sectorEntrada) {
      throw new MovimientoMultipleError("Sector de entrada invalido");
    }

    const movimientos = [];
    for (const actual of preparados) {
      const expediente = actual.expediente;
      await client.query(
        `UPDATE expedientes
         SET fechaentrada = $1
         WHERE TRIM(codigo::text) = $2
           AND numero::bigint = $3
           AND anio::integer = $4`,
        [
          fecha,
          expediente.codigo,
          Number(expediente.numero),
          Number(expediente.anio),
        ]
      );
      const result = await client.query(
        `INSERT INTO movimiento (
           codigo, numero, anio, fechamov, origen, destino, motivo, estado,
           usuario, codigosector, codigoren, coddestino, habilitado
         )
         VALUES ($1, $2, $3, $4, $5, $5, $6, 'E', $7, $8, $8, $8, TRUE)
         RETURNING id, movimiento, codigo, numero, anio, fechamov`,
        [
          expediente.codigo,
          Number(expediente.numero),
          Number(expediente.anio),
          fecha,
          sectorEntrada.sector,
          motivo ? motivo.toUpperCase() : null,
          usuario.nombre || usuario.usuario || null,
          sectorEntrada.codigosector,
        ]
      );
      movimientos.push(result.rows[0]);
    }

    await client.query("COMMIT");
    return {
      ok: true,
      cantidad: movimientos.length,
      movimientos,
      sector: sectorEntrada,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function registrarSalidaMultiple(data, usuarioSesion) {
  const expedientes = normalizarExpedientesMultiples(data.expedientes);
  const fecha = validarFecha(data.fechasalida, "Fecha de salida");
  const motivo = String(data.motivo || "").trim();
  const destinoCodigo = String(data.destino || "").trim();
  if (!destinoCodigo) throw new MovimientoMultipleError("Falta el sector de destino");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const usuario = await obtenerUsuarioYSector(client, usuarioSesion);
    const preparados = [];
    for (const clave of expedientes) {
      const actual = await obtenerEstadoBloqueado(client, clave);
      if (!usuarioPuedeDarSalida(usuario, actual.movimiento)) {
        throw new MovimientoMultipleError(
          `El expediente ${clave.codigo}-${clave.numero}/${clave.anio} no esta disponible para salida desde tu sector`,
          409
        );
      }
      preparados.push(actual);
    }

    const origenCodigo = String(preparados[0].movimiento.coddestino || "");
    if (
      !origenCodigo ||
      preparados.some(
        (actual) => String(actual.movimiento.coddestino || "") !== origenCodigo
      )
    ) {
      throw new MovimientoMultipleError(
        "Todos los expedientes deben encontrarse en el mismo sector de origen",
        409
      );
    }
    const sectoresResult = await client.query(
      `SELECT codigosector, sector
       FROM sector
       WHERE codigosector::text IN ($1::text, $2::text)
         AND habilitado IS NOT FALSE`,
      [origenCodigo, destinoCodigo]
    );
    const origen = sectoresResult.rows.find(
      (sector) => String(sector.codigosector) === origenCodigo
    );
    const destino = sectoresResult.rows.find(
      (sector) => String(sector.codigosector) === destinoCodigo
    );
    if (!origen) throw new MovimientoMultipleError("Sector de origen invalido");
    if (!destino || destinoCodigo === origenCodigo) {
      throw new MovimientoMultipleError("Destino invalido");
    }

    const movimientos = [];
    for (const actual of preparados) {
      const expediente = actual.expediente;
      const result = await client.query(
        `INSERT INTO movimiento (
           codigo, numero, anio, fechamov, origen, destino, motivo, estado,
           usuario, codigosector, codigoren, coddestino, habilitado
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'S', $8, $9, $10, $11, TRUE)
         RETURNING id, movimiento, codigo, numero, anio, fechamov`,
        [
          expediente.codigo,
          Number(expediente.numero),
          Number(expediente.anio),
          fecha,
          origen.sector,
          destino.sector,
          motivo ? motivo.toUpperCase() : null,
          usuario.nombre || usuario.usuario || null,
          destino.codigosector,
          origen.codigosector,
          destino.codigosector,
        ]
      );
      movimientos.push(result.rows[0]);
    }

    const remitoResult = await client.query(
      `INSERT INTO remito_lote (
         fechamov, codigoren, coddestino, origen, destino, usuario_id, usuario
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, fechamov, fechahora`,
      [
        fecha,
        origen.codigosector,
        destino.codigosector,
        origen.sector,
        destino.sector,
        usuario.id,
        usuario.nombre || usuario.usuario || null,
      ]
    );
    const remito = remitoResult.rows[0];
    for (const movimiento of movimientos) {
      await client.query(
        `INSERT INTO remito_lote_movimiento (remito_lote_id, movimiento_id)
         VALUES ($1, $2)`,
        [remito.id, movimiento.id]
      );
    }

    await client.query("COMMIT");
    return {
      ok: true,
      cantidad: movimientos.length,
      movimientos,
      remito: {
        ...remito,
        origen: origen.sector,
        destino: destino.sector,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
