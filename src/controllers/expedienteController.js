import pool from "../config/db.js";
import {
  obtenerExpedientes,
  guardarExpediente,
  obtenerExpedientePorClave,
  obtenerExpedientesFiltrados,
  actualizarExpedientePorClave,
  deshabilitarExpedientePorClave,
  obtenerExpedientesPorClaveLista,
} from "../models/expedienteModel.js";
import { deshabilitarMovimientosPorExpediente } from "../models/movimientoModel.js";

export async function listarExpedientes(_req, res, next) {
  try {
    const { fecha_inicio, fecha_fin, caja, beneficiario, asunto, tipo, codigo } =
      _req.query || {};
    const hayFiltro =
      fecha_inicio ||
      fecha_fin ||
      caja ||
      beneficiario ||
      asunto ||
      tipo ||
      codigo;
    const expedientes = hayFiltro
      ? await obtenerExpedientesFiltrados({
          fechaInicio: fecha_inicio,
          fechaFin: fecha_fin,
          caja,
          beneficiario,
          asunto,
          tipo,
          codigo,
        })
      : await obtenerExpedientes();
    res.json(expedientes);
  } catch (err) {
    next(err);
  }
}

export async function crearExpediente(req, res, next) {
  const nuevoExpediente = req.body;

  if (!nuevoExpediente?.numero) {
    return res.status(400).json({ error: "Falta el número de expediente" });
  }

  try {
    const expedienteCreado = await guardarExpediente(nuevoExpediente);
    res.status(201).json(expedienteCreado);
  } catch (err) {
    next(err);
  }
}

export async function obtenerExpedientePorClaveController(req, res, next) {
  const { codigo, numero, anio } = req.params;
  const incluirDeshabilitados =
    String(req.query?.incluir_deshabilitados || "") === "1";
  const numeroInt = Number(numero);
  const anioInt = Number(anio);

  if (!codigo || !Number.isInteger(numeroInt) || !Number.isInteger(anioInt)) {
    return res
      .status(400)
      .json({ error: "Parametros invalidos: codigo, numero, anio" });
  }

  try {
    const expediente = await obtenerExpedientePorClave(
      codigo,
      numeroInt,
      anioInt,
      incluirDeshabilitados
    );
    if (!expediente) {
      return res.status(404).json({ error: "Expediente no encontrado" });
    }
    res.json(expediente);
  } catch (err) {
    next(err);
  }
}

export async function actualizarExpedientePorClaveController(req, res, next) {
  const { codigo, numero, anio } = req.params;
  const numeroInt = Number(numero);
  const anioInt = Number(anio);

  if (!codigo || !Number.isInteger(numeroInt) || !Number.isInteger(anioInt)) {
    return res
      .status(400)
      .json({ error: "Parametros invalidos: codigo, numero, anio" });
  }

  const data = req.body || {};
  if (typeof data.asunto === "string") {
    data.asunto = data.asunto.toUpperCase();
  }
  if (typeof data.beneficiario === "string") {
    data.beneficiario = data.beneficiario.toUpperCase();
  }
  try {
    const actualizado = await actualizarExpedientePorClave(
      codigo,
      numeroInt,
      anioInt,
      data
    );
    if (!actualizado) {
      return res.status(404).json({ error: "Expediente no encontrado" });
    }
    res.json(actualizado);
  } catch (err) {
    next(err);
  }
}

export async function deshabilitarExpedienteController(req, res, next) {
  const { codigo, numero, anio } = req.params;
  const numeroInt = Number(numero);
  const anioInt = Number(anio);

  if (!codigo || !Number.isInteger(numeroInt) || !Number.isInteger(anioInt)) {
    return res
      .status(400)
      .json({ error: "Parametros invalidos: codigo, numero, anio" });
  }

  const esInformatica =
    req.user?.nivel === "S" ||
    String(req.user?.codigosector || "") === "1";
  if (!esInformatica) {
    return res.status(403).json({ error: "No autorizado" });
  }

  try {
    await pool.query("BEGIN");
    const expediente = await deshabilitarExpedientePorClave(
      codigo,
      numeroInt,
      anioInt
    );
    if (!expediente) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ error: "Expediente no encontrado" });
    }
    await deshabilitarMovimientosPorExpediente(codigo, numeroInt, anioInt);
    await pool.query("COMMIT");
    res.json(expediente);
  } catch (err) {
    await pool.query("ROLLBACK");
    next(err);
  }
}

export async function listarExpedientesPorClave(req, res, next) {
  const { codigo, numero, anio } = req.params;
  const incluirDeshabilitados =
    String(req.query?.incluir_deshabilitados || "") === "1";
  const numeroInt = Number(numero);
  const anioInt = Number(anio);

  if (!codigo || !Number.isInteger(numeroInt) || !Number.isInteger(anioInt)) {
    return res
      .status(400)
      .json({ error: "Parametros invalidos: codigo, numero, anio" });
  }

  try {
    const expedientes = await obtenerExpedientesPorClaveLista(
      codigo,
      numeroInt,
      anioInt,
      incluirDeshabilitados
    );
    res.json(expedientes);
  } catch (err) {
    next(err);
  }
}

export async function cargarExpediente(req, res, next) {
  const data = req.body || {};
  const {
    codigo,
    numero,
    anio,
    tipo,
    fechainicio,
    fechaentrada,
    fechacarga,
    asunto,
    iniciador,
    beneficiario,
    fojas,
    cajainterna,
    caja,
    partida,
    reposicion,
    nacion,
    motivo,
    origen,
    destino,
  } = data;

  const numeroInt = Number(numero);
  const anioInt = Number(anio);
  const asuntoUpper =
    typeof asunto === "string" ? asunto.toUpperCase() : asunto;
  const beneficiarioUpper =
    typeof beneficiario === "string"
      ? beneficiario.toUpperCase()
      : beneficiario;
  const motivoUpper =
    typeof motivo === "string" ? motivo.toUpperCase() : motivo;

  if (!codigo || !Number.isInteger(numeroInt) || !Number.isInteger(anioInt)) {
    return res
      .status(400)
      .json({ error: "Faltan codigo, numero o anio validos" });
  }
  if (!origen || !destino) {
    return res.status(400).json({ error: "Faltan origen y destino" });
  }

  const usuario = req.user?.nombre || req.user?.email || null;
  const estado = origen === destino ? "E" : "S";
  const fechaMovimiento = fechaentrada || fechacarga || fechainicio || null;

  try {
    const existente = await obtenerExpedientePorClave(
      codigo,
      numeroInt,
      anioInt
    );
    if (existente && existente.habilitado !== false) {
      return res.status(409).json({
        error: "Ya existe un expediente con el mismo codigo, numero y anio",
      });
    }

    await pool.query("BEGIN");

    const sectorOrigen = await pool.query(
      "SELECT codigosector, sector FROM sector WHERE codigosector = $1",
      [origen]
    );
    const sectorDestino = await pool.query(
      "SELECT codigosector, sector FROM sector WHERE codigosector = $1",
      [destino]
    );
    const origenNombre = sectorOrigen.rows[0]?.sector || null;
    const destinoNombre = sectorDestino.rows[0]?.sector || null;
    const codigoren = origen;
    const coddestino = destino;
    const codigosector = destino;

    const expedienteResult = await pool.query(
      `INSERT INTO expedientes (
         codigo,
         numero,
         anio,
         tipo,
         fechainicio,
         asunto,
         iniciador,
         fojas,
         fechacarga,
         usuario,
         caja,
         beneficiario,
         fechaentrada,
         partida,
         reposicion,
         nacion,
         cajainterna,
         habilitado
       )
       VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9,
         $10, $11, $12, $13, $14, $15, $16, $17, $18
       )
       RETURNING codinum, codigo, numero, anio`,
      [
        codigo,
        numeroInt,
        anioInt,
        tipo ?? null,
        fechainicio ?? null,
        asuntoUpper ?? null,
        iniciador ?? null,
        fojas ?? null,
        fechacarga ?? null,
        usuario,
        caja ?? null,
        beneficiarioUpper ?? null,
        fechaentrada ?? null,
        partida ?? null,
        reposicion ? "S" : null,
        nacion ? "S" : null,
        cajainterna ?? null,
        true,
      ]
    );

    await pool.query(
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
         usuariodestino,
         codigoren,
         coddestino,
         habilitado
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        codigo,
        numeroInt,
        anioInt,
        fechaMovimiento,
        origenNombre,
        destinoNombre,
        motivoUpper ?? null,
        estado,
        usuario,
        codigosector,
        null,
        codigoren,
        coddestino,
        true,
      ]
    );

    await pool.query("COMMIT");

    res.status(201).json(expedienteResult.rows[0]);
  } catch (err) {
    await pool.query("ROLLBACK");
    next(err);
  }
}
