import pool from "../config/db.js";
import {
  BotSalidaError,
  prepararSalidaParaBot,
  registrarSalidaParaBot,
} from "../services/botSalidaService.js";

export async function consultarExpedienteParaBot(req, res, next) {
  const codigo = String(req.params.codigo || "").trim();
  const numero = Number(req.params.numero);
  const anio = Number(req.params.anio);
  const limiteSolicitado = Number(req.query.limite || 5);
  const limite = Number.isInteger(limiteSolicitado)
    ? Math.min(Math.max(limiteSolicitado, 1), 10)
    : 5;

  if (
    !/^[a-zA-Z0-9]+$/.test(codigo) ||
    !Number.isInteger(numero) || numero <= 0 ||
    !Number.isInteger(anio) || anio < 0 || anio > 9999
  ) {
    return res.status(400).json({ error: "Codigo, numero o anio invalidos" });
  }

  try {
    const expedienteResult = await pool.query(
      `SELECT codinum, TRIM(codigo) AS codigo, numero, anio, tipo,
              fechainicio, asunto, iniciador, fojas, caja, beneficiario,
              fechaentrada, partida, reposicion, nacion, cajainterna, habilitado
       FROM expedientes
       WHERE TRIM(codigo) = $1 AND numero::bigint = $2 AND anio = $3
         AND habilitado IS NOT FALSE
       ORDER BY codinum DESC
       LIMIT 1`,
      [codigo, numero, anio]
    );

    const expediente = expedienteResult.rows[0];
    if (!expediente) {
      return res.status(404).json({ error: "Expediente no encontrado" });
    }

    const movimientosResult = await pool.query(
      `SELECT movimiento, fechamov, origen, destino, motivo, estado,
              usuario, observaciones
       FROM movimiento
       WHERE TRIM(codigo) = $1 AND numero = $2 AND anio = $3
         AND habilitado IS NOT FALSE
       ORDER BY movimiento DESC NULLS LAST, id DESC
       LIMIT $4`,
      [codigo, numero, anio, limite]
    );

    return res.json({
      expediente,
      movimientos: movimientosResult.rows,
      cantidadMovimientosDevueltos: movimientosResult.rowCount,
    });
  } catch (err) {
    next(err);
  }
}

function responderErrorSalida(error, res, next) {
  if (error instanceof BotSalidaError) {
    return res.status(error.status).json({ error: error.message });
  }
  return next(error);
}

export async function prepararSalidaExpedienteParaBot(req, res, next) {
  try {
    const result = await prepararSalidaParaBot({
      telefono: req.query.telefono,
      codigo: req.params.codigo,
      numero: req.params.numero,
      anio: req.params.anio,
    });
    return res.json(result);
  } catch (error) {
    return responderErrorSalida(error, res, next);
  }
}

export async function registrarSalidaExpedienteParaBot(req, res, next) {
  try {
    const result = await registrarSalidaParaBot({
      ...req.body,
      codigo: req.params.codigo,
      numero: req.params.numero,
      anio: req.params.anio,
    });
    return res.status(201).json(result);
  } catch (error) {
    return responderErrorSalida(error, res, next);
  }
}
