import pool from "../config/db.js";

export async function obtenerReparticiones() {
  const result = await pool.query(
    "SELECT codigoreparticion, reparticion, habilitado FROM reparticion ORDER BY codigoreparticion ASC"
  );
  return result.rows;
}

export async function guardarReparticion(data) {
  const result = await pool.query(
    "INSERT INTO reparticion (codigoreparticion, reparticion, habilitado) VALUES ($1, $2, $3) RETURNING codigoreparticion, reparticion, habilitado",
    [data.codigoreparticion, data.reparticion, data.habilitado ?? true]
  );
  return result.rows[0];
}
