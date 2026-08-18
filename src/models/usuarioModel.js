import pool from "../config/db.js";
import { normalizeArgentinePhone } from "../utils/phone.js";

export async function obtenerUsuarios() {
  const result = await pool.query(
    `SELECT id,
            usuario,
            COALESCE(nombreusuario, nombre) AS nombre,
            email,
            telefono,
            nivel,
            codigo,
            codigosector,
            habilitado,
            created_at
     FROM usuarios
     ORDER BY id DESC`
  );
  return result.rows;
}

export async function guardarUsuario(data) {
  const usuario = data.usuario ?? data.email;
  const result = await pool.query(
    `INSERT INTO usuarios (
       usuario,
       nombreusuario,
       nombre,
       email,
       telefono,
       password_hash,
       nivel,
       codigo,
       codigosector,
       habilitado
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id,
               usuario,
               COALESCE(nombreusuario, nombre) AS nombre,
               email,
               telefono,
               nivel,
               codigo,
               codigosector,
               habilitado,
               created_at`,
    [
      usuario,
      data.nombre,
      data.nombre,
      data.email,
      data.telefono ? normalizeArgentinePhone(data.telefono) : null,
      data.password_hash ?? null,
      data.nivel ?? null,
      data.codigo ?? null,
      data.codigosector ?? null,
      data.habilitado ?? true,
    ]
  );
  return result.rows[0];
}

export async function obtenerUsuarioPorId(id) {
  const result = await pool.query(
    `SELECT id,
            usuario,
            COALESCE(nombreusuario, nombre) AS nombre,
            email,
            telefono,
            nivel,
            codigo,
            codigosector,
            habilitado,
            created_at
     FROM usuarios
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

export async function obtenerUsuarioPorIdConPassword(id) {
  const result = await pool.query(
    `SELECT id,
            usuario,
            COALESCE(nombreusuario, nombre) AS nombre,
            email,
            telefono,
            password_hash,
            nivel,
            codigo,
            codigosector,
            habilitado,
            created_at
     FROM usuarios
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

export async function actualizarPasswordUsuario(id, passwordHash) {
  const result = await pool.query(
    `UPDATE usuarios
     SET password_hash = $1
     WHERE id = $2
     RETURNING id`,
    [passwordHash, id]
  );
  return result.rowCount > 0;
}

export async function obtenerUsuarioPorEmail(email) {
  const result = await pool.query(
    `SELECT id,
            usuario,
            COALESCE(nombreusuario, nombre) AS nombre,
            email,
            telefono,
            password_hash,
            nivel,
            codigo,
            codigosector,
            habilitado,
            created_at
     FROM usuarios
     WHERE email = $1`,
    [email]
  );
  return result.rows[0];
}

export async function obtenerUsuarioPorUsuario(usuario) {
  const result = await pool.query(
    `SELECT id,
            usuario,
            COALESCE(nombreusuario, nombre) AS nombre,
            email,
            telefono,
            password_hash,
            nivel,
            codigo,
            codigosector,
            habilitado,
            created_at
     FROM usuarios
     WHERE usuario = $1`,
    [usuario]
  );
  return result.rows[0];
}

export async function actualizarUsuario(id, data) {
  const usuario = data.usuario ?? data.email;
  const result = await pool.query(
    `UPDATE usuarios
     SET usuario = $1,
         nombreusuario = $2,
         nombre = $3,
         email = $4,
         telefono = $5,
         nivel = $6,
         codigo = $7,
         codigosector = $8,
         habilitado = $9
     WHERE id = $10
     RETURNING id,
               usuario,
               COALESCE(nombreusuario, nombre) AS nombre,
               email,
               telefono,
               nivel,
               codigo,
               codigosector,
               habilitado,
               created_at`,
    [
      usuario,
      data.nombre,
      data.nombre,
      data.email,
      data.telefono ? normalizeArgentinePhone(data.telefono) : null,
      data.nivel ?? null,
      data.codigo ?? null,
      data.codigosector ?? null,
      data.habilitado ?? true,
      id,
    ]
  );
  return result.rows[0];
}

export async function eliminarUsuario(id) {
  const result = await pool.query(
    "DELETE FROM usuarios WHERE id = $1 RETURNING id",
    [id]
  );
  return result.rowCount > 0;
}
