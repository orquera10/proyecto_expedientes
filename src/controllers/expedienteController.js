import {
  obtenerExpedientes,
  guardarExpediente,
} from "../models/expedienteModel.js";

export async function listarExpedientes(_req, res, next) {
  try {
    const expedientes = await obtenerExpedientes();
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
