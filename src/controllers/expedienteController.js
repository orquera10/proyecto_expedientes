import {
  obtenerExpedientes,
  guardarExpediente,
  obtenerExpedientePorClave,
  obtenerExpedientesFiltrados,
  actualizarExpedientePorClave,
} from "../models/expedienteModel.js";

export async function listarExpedientes(_req, res, next) {
  try {
    const { fecha_inicio, fecha_fin, caja, beneficiario, asunto } =
      _req.query || {};
    const hayFiltro = fecha_inicio || fecha_fin || caja || beneficiario || asunto;
    const expedientes = hayFiltro
      ? await obtenerExpedientesFiltrados({
          fechaInicio: fecha_inicio,
          fechaFin: fecha_fin,
          caja,
          beneficiario,
          asunto,
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
      anioInt
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
