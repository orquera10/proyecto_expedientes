import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import {
  guardarUsuario,
  obtenerUsuarioPorEmail,
  obtenerUsuarioPorUsuario,
  obtenerUsuarioPorIdConPassword,
  actualizarPasswordUsuario,
} from "../models/usuarioModel.js";
import { revokeToken } from "../utils/tokenStore.js";

const SALT_ROUNDS = 10;

export async function registrar(req, res, next) {
  const { nombre, email, password, usuario, nivel, codigo, codigosector } =
    req.body || {};

  if (!nombre || !email || !password) {
    return res
      .status(400)
      .json({ error: "Faltan campos obligatorios: nombre, email, password" });
  }

  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const usuarioCreado = await guardarUsuario({
      usuario,
      nombre,
      email,
      password_hash: hash,
      nivel,
      codigo,
      codigosector,
    });
    const token = generarToken(usuarioCreado);
    res.status(201).json({ token, usuario: usuarioCreado });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "El email ya existe" });
    }
    next(err);
  }
}

export async function login(req, res, next) {
  const { usuario, password } = req.body || {};

  if (!usuario || !password) {
    return res.status(400).json({ error: "Faltan usuario y password" });
  }

  try {
    const usuarioDb = await obtenerUsuarioPorUsuario(usuario);
    if (!usuarioDb) {
      return res.status(401).json({ error: "Credenciales invalidas" });
    }

    const coincide = await bcrypt.compare(password, usuarioDb.password_hash);
    if (!coincide) {
      return res.status(401).json({ error: "Credenciales invalidas" });
    }

    // No exponer hash en respuesta
    delete usuarioDb.password_hash;

    const token = generarToken(usuarioDb);
    res.json({ token, usuario: usuarioDb });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  // verificarToken ya valido el token y adjunto req.auth
  const { jti, exp } = req.auth || {};
  if (jti) {
    revokeToken(jti, exp);
  }
  res.status(204).send();
}

export async function cambiarPassword(req, res, next) {
  const { password_actual, password_nueva } = req.body || {};
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Token invalido" });
  }
  if (!password_actual || !password_nueva) {
    return res.status(400).json({
      error: "Faltan campos obligatorios: password_actual, password_nueva",
    });
  }

  try {
    const usuario = await obtenerUsuarioPorIdConPassword(userId);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const coincide = await bcrypt.compare(
      password_actual,
      usuario.password_hash
    );
    if (!coincide) {
      return res.status(401).json({ error: "Password actual incorrecto" });
    }

    const hash = await bcrypt.hash(password_nueva, SALT_ROUNDS);
    await actualizarPasswordUsuario(userId, hash);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

function generarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      usuario: usuario.usuario,
      nivel: usuario.nivel,
      codigosector: usuario.codigosector,
      jti: randomUUID(),
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
}
