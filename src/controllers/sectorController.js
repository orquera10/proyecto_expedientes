import { obtenerSectores, guardarSector } from "../models/sectorModel.js";

export async function listarSectores(_req, res, next) {
  try {
    const sectores = await obtenerSectores();
    res.json(sectores);
  } catch (err) {
    next(err);
  }
}

export async function crearSector(req, res, next) {
  const nuevoSector = req.body;

  if (!nuevoSector?.codigosector || !nuevoSector?.sector) {
    return res
      .status(400)
      .json({ error: "Faltan campos obligatorios: codigosector y sector" });
  }

  try {
    const sectorCreado = await guardarSector(nuevoSector);
    res.status(201).json(sectorCreado);
  } catch (err) {
    next(err);
  }
}
