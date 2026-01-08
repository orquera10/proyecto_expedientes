import pool from "../config/db.js";

export async function obtenerExpedientes() {
  const result = await pool.query(
    "SELECT id, numero, estado, created_at FROM expedientes ORDER BY id DESC"
  );
  return result.rows;
}

export async function guardarExpediente(data) {
  const estado = data.estado || "pendiente";
  const result = await pool.query(
    "INSERT INTO expedientes (numero, estado) VALUES ($1, $2) RETURNING id, numero, estado, created_at",
    [data.numero, estado]
  );
  return result.rows[0];
}
