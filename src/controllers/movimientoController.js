import {
  obtenerMovimientos,
  guardarMovimiento,
  obtenerMovimientosPorExpediente,
  obtenerDatosRemitoPorMovimiento,
  obtenerUltimasSalidas,
  obtenerUltimasEntradas,
  deshabilitarMovimientoPorId,
  habilitarMovimientoPorId,
} from "../models/movimientoModel.js";
import pool from "../config/db.js";
import {
  crearDocumentoRemito,
  nombreArchivoRemito,
  usuarioPuedeVerRemito,
} from "../services/remitoPdfService.js";

export async function listarMovimientos(_req, res, next) {
  try {
    const movimientos = await obtenerMovimientos();
    res.json(movimientos);
  } catch (err) {
    next(err);
  }
}

export async function crearMovimiento(req, res, next) {
  const nuevoMovimiento = req.body;

  if (!nuevoMovimiento?.codigo || !nuevoMovimiento?.numero) {
    return res
      .status(400)
      .json({ error: "Faltan campos obligatorios: codigo y numero" });
  }

  try {
    const movimientoCreado = await guardarMovimiento(nuevoMovimiento);
    res.status(201).json(movimientoCreado);
  } catch (err) {
    next(err);
  }
}

export async function listarMovimientosPorExpediente(req, res, next) {
  const { codigo, numero, anio } = req.params;
  const numeroInt = Number(numero);
  const anioInt = Number(anio);

  if (!codigo || !Number.isInteger(numeroInt) || !Number.isInteger(anioInt)) {
    return res
      .status(400)
      .json({ error: "Parametros invalidos: codigo, numero, anio" });
  }

  try {
    const movimientos = await obtenerMovimientosPorExpediente(
      codigo,
      numeroInt,
      anioInt
    );
    res.json(movimientos);
  } catch (err) {
    next(err);
  }
}

export async function descargarRemito(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Id de movimiento invalido" });
  }

  try {
    const datos = await obtenerDatosRemitoPorMovimiento(id);
    if (!datos || datos.habilitado === false) {
      return res.status(404).json({ error: "Movimiento no encontrado" });
    }
    if (datos.estado !== "S") {
      return res
        .status(400)
        .json({ error: "El remito solo esta disponible para movimientos de salida" });
    }
    if (!usuarioPuedeVerRemito(req.user, datos)) {
      return res.status(403).json({ error: "No autorizado para ver este remito" });
    }

    const nombreArchivo = nombreArchivoRemito(datos);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${nombreArchivo}"`
    );
    res.setHeader("Cache-Control", "private, no-store");

    const documento = crearDocumentoRemito(datos);
    documento.on("error", next);
    documento.pipe(res);
    documento.end();
  } catch (err) {
    next(err);
  }
}

export async function deshabilitarMovimiento(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Id de movimiento invalido" });
  }

  const esInformatica =
    req.user?.nivel === "S" ||
    String(req.user?.codigosector || "") === "1";
  if (!esInformatica) {
    return res.status(403).json({ error: "No autorizado" });
  }

  try {
    const actualizado = await deshabilitarMovimientoPorId(id);
    if (!actualizado) {
      return res.status(404).json({ error: "Movimiento no encontrado" });
    }
    res.json(actualizado);
  } catch (err) {
    next(err);
  }
}

export async function habilitarMovimiento(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Id de movimiento invalido" });
  }

  const esInformatica =
    req.user?.nivel === "S" ||
    String(req.user?.codigosector || "") === "1";
  if (!esInformatica) {
    return res.status(403).json({ error: "No autorizado" });
  }

  try {
    const movimiento = await pool.query(
      "SELECT codigo, numero, anio FROM movimiento WHERE id = $1",
      [id]
    );
    if (movimiento.rowCount === 0) {
      return res.status(404).json({ error: "Movimiento no encontrado" });
    }
    const { codigo, numero, anio } = movimiento.rows[0];
    const expediente = await pool.query(
      `SELECT 1
       FROM expedientes
       WHERE codigo = $1 AND numero = $2 AND anio = $3
         AND habilitado IS NOT FALSE
       LIMIT 1`,
      [codigo, numero, anio]
    );
    if (expediente.rowCount === 0) {
      return res
        .status(409)
        .json({ error: "Expediente deshabilitado" });
    }

    const actualizado = await habilitarMovimientoPorId(id);
    if (!actualizado) {
      return res.status(404).json({ error: "Movimiento no encontrado" });
    }
    res.json(actualizado);
  } catch (err) {
    next(err);
  }
}

export async function listarSalidasParaEntrada(req, res, next) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limitRaw = Number(req.query.limit) || 20;
  const limit = Math.min(Math.max(limitRaw, 1), 100);
  const offset = (page - 1) * limit;
  const {
    codigo,
    numero,
    anio,
    asunto,
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
  } = req.query || {};

  const codigosector = req.user?.codigosector
    ? String(req.user.codigosector)
    : null;
  const incluirTodos =
    req.user?.nivel === "S" || codigosector === "1";

  if (!incluirTodos && !codigosector) {
    return res.status(400).json({
      error: "No se pudo determinar el sector del usuario",
    });
  }

  try {
    const result = await obtenerUltimasSalidas({
      codigosector,
      incluirTodos,
      limit,
      offset,
      filtrosBusqueda: {
        codigo,
        numero,
        anio,
        asunto,
        fechaInicio,
        fechaFin,
      },
    });
    res.json({
      page,
      limit,
      total: result.total,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
}

export async function listarEntradasParaSalida(req, res, next) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limitRaw = Number(req.query.limit) || 20;
  const limit = Math.min(Math.max(limitRaw, 1), 100);
  const offset = (page - 1) * limit;
  const {
    codigo,
    numero,
    anio,
    asunto,
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
  } = req.query || {};

  const codigosector = req.user?.codigosector
    ? String(req.user.codigosector)
    : null;
  const incluirTodos = req.user?.nivel === "S";

  if (!incluirTodos && !codigosector) {
    return res.status(400).json({
      error: "No se pudo determinar el sector del usuario",
    });
  }

  try {
    const result = await obtenerUltimasEntradas({
      codigosector,
      incluirTodos,
      limit,
      offset,
      filtrosBusqueda: {
        codigo,
        numero,
        anio,
        asunto,
        fechaInicio,
        fechaFin,
      },
    });
    res.json({
      page,
      limit,
      total: result.total,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
}

export async function registrarEntrada(req, res, next) {
  const data = req.body || {};
  const { codigo, numero, anio, motivo, fojas, caja, cajainterna, fechaentrada } =
    data;
  const numeroInt = Number(numero);
  const anioInt = Number(anio);

  if (!codigo || !Number.isInteger(numeroInt) || !Number.isInteger(anioInt)) {
    return res
      .status(400)
      .json({ error: "Faltan codigo, numero o anio validos" });
  }

  const codigosector = req.user?.codigosector;
  if (!codigosector) {
    return res
      .status(400)
      .json({ error: "No se pudo determinar el sector del usuario" });
  }

  const usuario = req.user?.nombre || req.user?.email || null;
  const motivoUpper =
    typeof motivo === "string" ? motivo.toUpperCase() : motivo;
  const fechaMovimiento = fechaentrada || new Date().toISOString().slice(0, 10);

  try {
    await pool.query("BEGIN");

    const expediente = await pool.query(
      `SELECT codigo, numero, anio
       FROM expedientes
       WHERE codigo = $1 AND numero = $2 AND anio = $3
         AND habilitado IS NOT FALSE`,
      [codigo, numeroInt, anioInt]
    );
    if (expediente.rowCount === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ error: "Expediente no encontrado" });
    }

    const sector = await pool.query(
      "SELECT codigosector, sector FROM sector WHERE codigosector = $1",
      [codigosector]
    );
    const sectorNombre = sector.rows[0]?.sector || null;

    await pool.query(
      `UPDATE expedientes
       SET fojas = COALESCE($1, fojas),
           caja = COALESCE($2, caja),
           cajainterna = COALESCE($3, cajainterna),
           fechaentrada = COALESCE($4, fechaentrada)
       WHERE codigo = $5 AND numero = $6 AND anio = $7`,
      [
        fojas !== undefined && fojas !== "" ? Number(fojas) : null,
        caja ?? null,
        cajainterna ?? null,
        fechaMovimiento,
        codigo,
        numeroInt,
        anioInt,
      ]
    );

    const movimientoResult = await pool.query(
      `INSERT INTO movimiento (
         codigo,
         numero,
         anio,
         fechamov,
         origen,
         destino,
         motivo,
         estado,
         usuario,
         codigosector,
         codigoren,
         coddestino,
         habilitado
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, movimiento`,
      [
        codigo,
        numeroInt,
        anioInt,
        fechaMovimiento,
        sectorNombre,
        sectorNombre,
        motivoUpper ?? null,
        "E",
        usuario,
        codigosector,
        codigosector,
        codigosector,
        true,
      ]
    );

    await pool.query("COMMIT");

    res.status(201).json({
      ok: true,
      movimiento: movimientoResult.rows[0],
    });
  } catch (err) {
    await pool.query("ROLLBACK");
    next(err);
  }
}

export async function registrarSalida(req, res, next) {
  const data = req.body || {};
  const {
    codigo,
    numero,
    anio,
    motivo,
    fojas,
    caja,
    cajainterna,
    fechasalida,
    destino,
  } = data;
  const numeroInt = Number(numero);
  const anioInt = Number(anio);

  if (!codigo || !Number.isInteger(numeroInt) || !Number.isInteger(anioInt)) {
    return res
      .status(400)
      .json({ error: "Faltan codigo, numero o anio validos" });
  }

  const origen = req.user?.codigosector;
  if (!origen) {
    return res
      .status(400)
      .json({ error: "No se pudo determinar el sector del usuario" });
  }
  if (!destino) {
    return res.status(400).json({ error: "Falta destino" });
  }

  const usuario = req.user?.nombre || req.user?.email || null;
  const motivoUpper =
    typeof motivo === "string" ? motivo.toUpperCase() : motivo;
  const fechaMovimiento = fechasalida || new Date().toISOString().slice(0, 10);

  try {
    await pool.query("BEGIN");

    const expediente = await pool.query(
      `SELECT codigo, numero, anio
       FROM expedientes
       WHERE codigo = $1 AND numero = $2 AND anio = $3
         AND habilitado IS NOT FALSE`,
      [codigo, numeroInt, anioInt]
    );
    if (expediente.rowCount === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ error: "Expediente no encontrado" });
    }

    const sectorOrigen = await pool.query(
      "SELECT codigosector, sector FROM sector WHERE codigosector = $1",
      [origen]
    );
    const sectorDestino = await pool.query(
      "SELECT codigosector, sector FROM sector WHERE codigosector = $1",
      [destino]
    );
    if (sectorDestino.rowCount === 0) {
      await pool.query("ROLLBACK");
      return res.status(400).json({ error: "Destino invalido" });
    }
    const origenNombre = sectorOrigen.rows[0]?.sector || null;
    const destinoNombre = sectorDestino.rows[0]?.sector || null;

    await pool.query(
      `UPDATE expedientes
       SET fojas = COALESCE($1, fojas),
           caja = COALESCE($2, caja),
           cajainterna = COALESCE($3, cajainterna)
       WHERE codigo = $4 AND numero = $5 AND anio = $6`,
      [
        fojas !== undefined && fojas !== "" ? Number(fojas) : null,
        caja ?? null,
        cajainterna ?? null,
        codigo,
        numeroInt,
        anioInt,
      ]
    );

    const movimientoResult = await pool.query(
      `INSERT INTO movimiento (
         codigo,
         numero,
         anio,
         fechamov,
         origen,
         destino,
         motivo,
         estado,
         usuario,
         codigosector,
         codigoren,
         coddestino,
         habilitado
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, movimiento`,
      [
        codigo,
        numeroInt,
        anioInt,
        fechaMovimiento,
        origenNombre,
        destinoNombre,
        motivoUpper ?? null,
        "S",
        usuario,
        destino,
        origen,
        destino,
        true,
      ]
    );

    await pool.query("COMMIT");

    res.status(201).json({
      ok: true,
      movimiento: movimientoResult.rows[0],
    });
  } catch (err) {
    await pool.query("ROLLBACK");
    next(err);
  }
}
