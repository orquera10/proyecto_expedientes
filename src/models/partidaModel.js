import pool from "../config/db.js";

export async function obtenerPartidas() {
  const result = await pool.query(
    "SELECT numero, nombre, habilitado FROM partida ORDER BY numero ASC"
  );
  return result.rows;
}

export async function guardarPartida(data) {
  const result = await pool.query(
    "INSERT INTO partida (numero, nombre, habilitado) VALUES ($1, $2, $3) RETURNING numero, nombre, habilitado",
    [data.numero, data.nombre, data.habilitado ?? true]
  );
  return result.rows[0];
}
