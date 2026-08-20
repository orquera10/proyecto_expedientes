import pool from "../config/db.js";
import {
  BotEntradaError,
  prepararEntradaParaUsuario,
  registrarEntradaParaUsuario,
} from "../services/botEntradaService.js";
import {
  BotSalidaError,
  prepararSalidaParaUsuario,
  registrarSalidaParaUsuario,
} from "../services/botSalidaService.js";

function claveDesdeParametros(params) {
  const clave = {
    codigo: String(params.codigo || "").trim(),
    numero: Number(params.numero),
    anio: Number(params.anio),
  };
  if (
    !/^[a-zA-Z0-9]+$/.test(clave.codigo) ||
    !Number.isInteger(clave.numero) ||
    clave.numero <= 0 ||
    !Number.isInteger(clave.anio) ||
    clave.anio < 0 ||
    clave.anio > 9999
  ) {
    const error = new Error("Codigo, numero o anio invalidos");
    error.status = 400;
    throw error;
  }
  return clave;
}

function responderError(error, res, next) {
  if (
    error instanceof BotEntradaError ||
    error instanceof BotSalidaError ||
    error?.status === 400
  ) {
    return res.status(error.status || 400).json({ error: error.message });
  }
  return next(error);
}

export async function consultarExpedienteAsistente(req, res, next) {
  try {
    const clave = claveDesdeParametros(req.params);
    const expedienteResult = await pool.query(
      `SELECT codinum, TRIM(codigo::text) AS codigo, numero, anio, tipo,
              fechainicio, asunto, iniciador, beneficiario, fojas, caja,
              cajainterna, partida
       FROM expedientes
       WHERE TRIM(codigo::text) = $1
         AND numero::bigint = $2
         AND anio::integer = $3
         AND habilitado IS NOT FALSE
       ORDER BY codinum DESC
       LIMIT 1`,
      [clave.codigo, clave.numero, clave.anio]
    );
    const expediente = expedienteResult.rows[0];
    if (!expediente) {
      return res.status(404).json({ error: "Expediente no encontrado" });
    }

    const movimientosResult = await pool.query(
      `SELECT id, movimiento, fechamov, origen, destino, motivo, estado, usuario
       FROM movimiento
       WHERE TRIM(codigo::text) = $1
         AND numero::bigint = $2
         AND anio::integer = $3
         AND habilitado IS NOT FALSE
       ORDER BY movimiento DESC NULLS LAST, id DESC
       LIMIT 5`,
      [clave.codigo, clave.numero, clave.anio]
    );
    return res.json({
      expediente,
      movimientos: movimientosResult.rows,
    });
  } catch (error) {
    return responderError(error, res, next);
  }
}

export async function prepararEntradaAsistente(req, res, next) {
  try {
    const result = await prepararEntradaParaUsuario(req.params, req.user);
    return res.json(result);
  } catch (error) {
    return responderError(error, res, next);
  }
}

export async function registrarEntradaAsistente(req, res, next) {
  try {
    const result = await registrarEntradaParaUsuario(
      { ...req.body, ...req.params },
      req.user
    );
    return res.status(201).json(result);
  } catch (error) {
    return responderError(error, res, next);
  }
}

export async function prepararSalidaAsistente(req, res, next) {
  try {
    const result = await prepararSalidaParaUsuario(req.params, req.user);
    return res.json(result);
  } catch (error) {
    return responderError(error, res, next);
  }
}

export async function registrarSalidaAsistente(req, res, next) {
  try {
    const result = await registrarSalidaParaUsuario(
      { ...req.body, ...req.params },
      req.user
    );
    return res.status(201).json(result);
  } catch (error) {
    return responderError(error, res, next);
  }
}
