import pool from "../src/config/db.js";

const createTableSQL = `
CREATE TABLE IF NOT EXISTS expedientes (
  id BIGSERIAL PRIMARY KEY,
  numero TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agregar columna de contraseña hasheada si no existe
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS password_hash TEXT;
`;

async function migrate() {
  try {
    await pool.query(createTableSQL);
    console.log("Migración completada: tabla expedientes lista.");
  } catch (err) {
    console.error("Error en migración:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
