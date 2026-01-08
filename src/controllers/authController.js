import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import {
  guardarUsuario,
  obtenerUsuarioPorEmail,
} from "../models/usuarioModel.js";
import { revokeToken } from "../utils/tokenStore.js";

const SALT_ROUNDS = 10;

export async function registrar(req, res, next) {
  const { nombre, email, password } = req.body || {};

  if (!nombre || !email || !password) {
    return res
      .status(400)
      .json({ error: "Faltan campos obligatorios: nombre, email, password" });
  }

  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const usuarioCreado = await guardarUsuario({
      nombre,
      email,
      password_hash: hash,
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
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Faltan email y password" });
  }

  try {
    const usuario = await obtenerUsuarioPorEmail(email);
    if (!usuario) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const coincide = await bcrypt.compare(password, usuario.password_hash);
    if (!coincide) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // No exponer hash en respuesta
    delete usuario.password_hash;

    const token = generarToken(usuario);
    res.json({ token, usuario });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  // verificarToken ya validó el token y adjuntó req.auth
  const { jti, exp } = req.auth || {};
  if (jti) {
    revokeToken(jti, exp);
  }
  res.status(204).send();
}

function generarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, nombre: usuario.nombre, jti: randomUUID() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
}
