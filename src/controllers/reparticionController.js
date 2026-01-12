import {
  obtenerReparticiones,
  guardarReparticion,
} from "../models/reparticionModel.js";

export async function listarReparticiones(_req, res, next) {
  try {
    const reparticiones = await obtenerReparticiones();
    res.json(reparticiones);
  } catch (err) {
    next(err);
  }
}

export async function crearReparticion(req, res, next) {
  const nuevaReparticion = req.body;

  if (!nuevaReparticion?.codigoreparticion || !nuevaReparticion?.reparticion) {
    return res.status(400).json({
      error: "Faltan campos obligatorios: codigoreparticion y reparticion",
    });
  }

  try {
    const reparticionCreada = await guardarReparticion(nuevaReparticion);
    res.status(201).json(reparticionCreada);
  } catch (err) {
    next(err);
  }
}
