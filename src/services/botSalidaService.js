import pool from "../config/db.js";
import { normalizeArgentinePhone } from "../utils/phone.js";

export class BotSalidaError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "BotSalidaError";
    this.status = status;
  }
}

export function usuarioPuedeDarSalida(usuario, movimiento) {
  if (!usuario?.codigosector || !movimiento || movimiento.estado !== "E") return false;
  const sectorUsuario = String(usuario.codigosector);
  return usuario.nivel === "S" || sectorUsuario === "1" ||
    String(movimiento.coddestino || "") === sectorUsuario;
}

function validarClave({ codigo, numero, anio }) {
  const clave = {
    codigo: String(codigo || "").trim(),
    numero: Number(numero),
    anio: Number(anio),
  };
  if (!/^[a-zA-Z0-9]+$/.test(clave.codigo) ||
      !Number.isInteger(clave.numero) || clave.numero <= 0 ||
      !Number.isInteger(clave.anio) || clave.anio < 0 || clave.anio > 9999) {
    throw new BotSalidaError("Codigo, numero o anio invalidos", 400);
  }
  return clave;
}

async function buscarUsuario(telefono, db) {
  const normalizado = normalizeArgentinePhone(telefono);
  if (!normalizado) throw new BotSalidaError("Numero de telefono invalido", 400);

  const result = await db.query(
    `SELECT id, usuario, COALESCE(nombreusuario, nombre) AS nombre,
            nivel, codigosector
     FROM usuarios
     WHERE telefono = $1 AND habilitado IS NOT FALSE
     LIMIT 1`,
    [normalizado]
  );
  if (!result.rows[0]) throw new BotSalidaError("Usuario no autorizado", 403);
  return result.rows[0];
}

async function preparar({ telefono, codigo, numero, anio }, db, { lockExpediente = false } = {}) {
  const clave = validarClave({ codigo, numero, anio });
  const usuario = await buscarUsuario(telefono, db);

  const expedienteResult = await db.query(
    `SELECT codinum, TRIM(codigo::text) AS codigo, numero, anio, tipo,
            asunto, iniciador, beneficiario, fojas, caja, cajainterna
     FROM expedientes
     WHERE TRIM(codigo::text) = $1 AND numero::bigint = $2 AND anio = $3
       AND habilitado IS NOT FALSE
     ORDER BY codinum DESC
     LIMIT 1
     ${lockExpediente ? "FOR UPDATE" : ""}`,
    [clave.codigo, clave.numero, clave.anio]
  );
  const expediente = expedienteResult.rows[0];
  if (!expediente) throw new BotSalidaError("Expediente no encontrado", 404);

  const movimientoResult = await db.query(
    `SELECT id, movimiento, estado, origen, destino, codigosector, codigoren, coddestino
     FROM movimiento
     WHERE TRIM(codigo::text) = $1 AND numero::bigint = $2 AND anio = $3
       AND habilitado IS NOT FALSE
     ORDER BY movimiento DESC NULLS LAST, id DESC
     LIMIT 1`,
    [clave.codigo, clave.numero, clave.anio]
  );
  const movimientoActual = movimientoResult.rows[0];
  if (!movimientoActual || movimientoActual.estado !== "E") {
    throw new BotSalidaError("El expediente no esta disponible para dar salida", 409);
  }
  if (!usuarioPuedeDarSalida(usuario, movimientoActual)) {
    throw new BotSalidaError("El expediente no se encuentra en tu sector", 403);
  }

  const origenResult = await db.query(
    `SELECT codigosector, sector
     FROM sector
     WHERE codigosector::text = $1::text AND habilitado IS NOT FALSE
     LIMIT 1`,
    [String(usuario.codigosector)]
  );
  const origen = origenResult.rows[0];
  if (!origen) throw new BotSalidaError("No se pudo determinar el sector de origen", 400);

  const destinosResult = await db.query(
    `SELECT codigosector, sector
     FROM sector
     WHERE habilitado IS NOT FALSE AND codigosector::text <> $1::text
     ORDER BY codigosector ASC`,
    [String(usuario.codigosector)]
  );

  return {
    usuario,
    expediente,
    movimientoActual,
    origen,
    destinos: destinosResult.rows,
  };
}

export async function prepararSalidaParaBot(data) {
  return preparar(data, pool);
}

export async function registrarSalidaParaBot(data) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const preparada = await preparar(data, client, { lockExpediente: true });
    const destinoCodigo = String(data.destino || "").trim();
    const destino = preparada.destinos.find(
      (sector) => String(sector.codigosector) === destinoCodigo
    );
    if (!destino) throw new BotSalidaError("Destino invalido", 400);

    const fechaMovimiento = data.fechasalida || new Date().toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaMovimiento)) {
      throw new BotSalidaError("Fecha de salida invalida", 400);
    }
    const motivo = String(data.motivo || "").trim();
    const fojas = data.fojas !== undefined && data.fojas !== "" && data.fojas !== null
      ? Number(data.fojas)
      : null;
    if (fojas !== null && (!Number.isFinite(fojas) || fojas < 0)) {
      throw new BotSalidaError("Cantidad de fojas invalida", 400);
    }

    await client.query(
      `UPDATE expedientes
       SET fojas = COALESCE($1, fojas),
           caja = COALESCE($2, caja),
           cajainterna = COALESCE($3, cajainterna)
       WHERE TRIM(codigo::text) = $4 AND numero::bigint = $5 AND anio = $6`,
      [
        fojas,
        data.caja ?? null,
        data.cajainterna ?? null,
        preparada.expediente.codigo,
        Number(preparada.expediente.numero),
        Number(preparada.expediente.anio),
      ]
    );

    const movimientoResult = await client.query(
      `INSERT INTO movimiento (
         codigo, numero, anio, fechamov, origen, destino, motivo, estado,
         usuario, codigosector, codigoren, coddestino, habilitado
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'S', $8, $9, $10, $11, TRUE)
       RETURNING id, movimiento, fechamov`,
      [
        preparada.expediente.codigo,
        Number(preparada.expediente.numero),
        Number(preparada.expediente.anio),
        fechaMovimiento,
        preparada.origen.sector,
        destino.sector,
        motivo ? motivo.toUpperCase() : null,
        preparada.usuario.nombre || preparada.usuario.usuario || null,
        destino.codigosector,
        preparada.origen.codigosector,
        destino.codigosector,
      ]
    );

    await client.query("COMMIT");
    return {
      ok: true,
      expediente: preparada.expediente,
      origen: preparada.origen,
      destino,
      movimiento: movimientoResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
