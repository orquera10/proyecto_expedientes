import { obtenerPartidas, guardarPartida } from "../models/partidaModel.js";

export async function listarPartidas(_req, res, next) {
  try {
    const partidas = await obtenerPartidas();
    res.json(partidas);
  } catch (err) {
    next(err);
  }
}

export async function crearPartida(req, res, next) {
  const nuevaPartida = req.body;

  if (!nuevaPartida?.numero || !nuevaPartida?.nombre) {
    return res
      .status(400)
      .json({ error: "Faltan campos obligatorios: numero y nombre" });
  }

  try {
    const partidaCreada = await guardarPartida(nuevaPartida);
    res.status(201).json(partidaCreada);
  } catch (err) {
    next(err);
  }
}
