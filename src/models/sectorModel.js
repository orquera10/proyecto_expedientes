import pool from "../config/db.js";

export async function obtenerSectores() {
  const result = await pool.query(
    "SELECT codigosector, sector, habilitado FROM sector ORDER BY codigosector ASC"
  );
  return result.rows;
}

export async function guardarSector(data) {
  const result = await pool.query(
    "INSERT INTO sector (codigosector, sector, habilitado) VALUES ($1, $2, $3) RETURNING codigosector, sector, habilitado",
    [data.codigosector, data.sector, data.habilitado ?? true]
  );
  return result.rows[0];
}
