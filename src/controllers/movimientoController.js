import {
  obtenerMovimientos,
  guardarMovimiento,
} from "../models/movimientoModel.js";

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
