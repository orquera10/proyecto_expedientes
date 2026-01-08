import pool from "../config/db.js";

export async function obtenerUsuarios() {
  const result = await pool.query(
    "SELECT id, nombre, email, created_at FROM usuarios ORDER BY id DESC"
  );
  return result.rows;
}

export async function guardarUsuario(data) {
  const result = await pool.query(
    `INSERT INTO usuarios (nombre, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, nombre, email, created_at`,
    [data.nombre, data.email, data.password_hash ?? null]
  );
  return result.rows[0];
}

export async function obtenerUsuarioPorId(id) {
  const result = await pool.query(
    "SELECT id, nombre, email, created_at FROM usuarios WHERE id = $1",
    [id]
  );
  return result.rows[0];
}

export async function obtenerUsuarioPorEmail(email) {
  const result = await pool.query(
    "SELECT id, nombre, email, password_hash, created_at FROM usuarios WHERE email = $1",
    [email]
  );
  return result.rows[0];
}

export async function actualizarUsuario(id, data) {
  const result = await pool.query(
    `UPDATE usuarios
     SET nombre = $1,
         email = $2
     WHERE id = $3
     RETURNING id, nombre, email, created_at`,
    [data.nombre, data.email, id]
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
