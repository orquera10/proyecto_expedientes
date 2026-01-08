import {
  obtenerUsuarios,
  guardarUsuario,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
} from "../models/usuarioModel.js";

export async function listarUsuarios(_req, res, next) {
  try {
    const usuarios = await obtenerUsuarios();
    res.json(usuarios);
  } catch (err) {
    next(err);
  }
}

export async function crearUsuario(req, res, next) {
  const nuevoUsuario = req.body;

  if (!nuevoUsuario?.nombre || !nuevoUsuario?.email) {
    return res
      .status(400)
      .json({ error: "Faltan campos obligatorios: nombre y email" });
  }

  try {
    const usuarioCreado = await guardarUsuario(nuevoUsuario);
    res.status(201).json(usuarioCreado);
  } catch (err) {
    // Si es duplicado de email, retornar 409
    if (err.code === "23505") {
      return res.status(409).json({ error: "El email ya existe" });
    }
    next(err);
  }
}

export async function obtenerUsuario(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const usuario = await obtenerUsuarioPorId(id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (err) {
    next(err);
  }
}

export async function actualizarUsuarioController(req, res, next) {
  const id = Number(req.params.id);
  const data = req.body;

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }
  if (!data?.nombre || !data?.email) {
    return res
      .status(400)
      .json({ error: "Faltan campos obligatorios: nombre y email" });
  }

  try {
    const actualizado = await actualizarUsuario(id, data);
    if (!actualizado) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(actualizado);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "El email ya existe" });
    }
    next(err);
  }
}

export async function borrarUsuario(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const eliminado = await eliminarUsuario(id);
    if (!eliminado) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
