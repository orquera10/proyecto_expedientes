import {
  obtenerUsuarios,
  guardarUsuario,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
  actualizarPasswordUsuario,
} from "../models/usuarioModel.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

function esInformatica(req) {
  return (
    req.user?.nivel === "S" || String(req.user?.codigosector || "") === "1"
  );
}

export async function listarUsuarios(_req, res, next) {
  try {
    const usuarios = await obtenerUsuarios();
    res.json(usuarios);
  } catch (err) {
    next(err);
  }
}

export async function crearUsuario(req, res, next) {
  if (!esInformatica(req)) {
    return res.status(403).json({ error: "No autorizado" });
  }
  const nuevoUsuario = req.body;

  if (!nuevoUsuario?.nombre) {
    return res
      .status(400)
      .json({ error: "Falta el campo obligatorio: nombre" });
  }
  if (!nuevoUsuario?.usuario && !nuevoUsuario?.email) {
    return res
      .status(400)
      .json({ error: "Falta usuario o email para identificar el login" });
  }

  try {
    const usuarioCreado = await guardarUsuario(nuevoUsuario);
    res.status(201).json(usuarioCreado);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "El email ya existe" });
    }
    next(err);
  }
}

export async function obtenerUsuario(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID invalido" });
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
  if (!esInformatica(req)) {
    return res.status(403).json({ error: "No autorizado" });
  }
  const id = Number(req.params.id);
  const data = req.body;

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID invalido" });
  }
  if (!data?.nombre) {
    return res
      .status(400)
      .json({ error: "Falta el campo obligatorio: nombre" });
  }
  if (!data?.usuario && !data?.email) {
    return res
      .status(400)
      .json({ error: "Falta usuario o email para identificar el login" });
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
  if (!esInformatica(req)) {
    return res.status(403).json({ error: "No autorizado" });
  }
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID invalido" });
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

export async function resetPasswordUsuario(req, res, next) {
  if (!esInformatica(req)) {
    return res.status(403).json({ error: "No autorizado" });
  }
  const id = Number(req.params.id);
  const { password_nueva } = req.body || {};

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID invalido" });
  }
  if (!password_nueva) {
    return res.status(400).json({ error: "Falta password_nueva" });
  }

  try {
    const hash = await bcrypt.hash(password_nueva, SALT_ROUNDS);
    const actualizado = await actualizarPasswordUsuario(id, hash);
    if (!actualizado) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
