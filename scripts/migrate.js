import pool from "../src/config/db.js";

const createTableSQL = `
CREATE TABLE IF NOT EXISTS expedientes (
  codinum BIGSERIAL PRIMARY KEY,
  codigo TEXT,
  numero INTEGER NOT NULL,
  anio INTEGER,
  tipo TEXT,
  fechainicio DATE,
  asunto TEXT,
  iniciador TEXT,
  fojas INTEGER,
  fechacarga DATE,
  usuario TEXT,
  caja TEXT,
  beneficiario TEXT,
  fechaentrada DATE,
  partida TEXT,
  reposicion TEXT,
  nacion TEXT,
  cajainterna TEXT,
  habilitado BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  usuario TEXT NOT NULL,
  nombreusuario TEXT NOT NULL,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT,
  nivel TEXT,
  codigo TEXT,
  codigosector TEXT,
  habilitado BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sector (
  codigosector TEXT PRIMARY KEY,
  sector TEXT NOT NULL,
  habilitado BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS reparticion (
  codigoreparticion TEXT PRIMARY KEY,
  reparticion TEXT NOT NULL,
  habilitado BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS partida (
  numero TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  habilitado BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS movimiento (
  id BIGSERIAL PRIMARY KEY,
  codigo TEXT,
  numero INTEGER,
  anio INTEGER,
  fechamov DATE,
  fechahora TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  origen TEXT,
  destino TEXT,
  motivo TEXT,
  estado TEXT,
  movimiento BIGINT,
  usuario TEXT,
  codigounm TEXT,
  codigosector TEXT,
  usuariodestino TEXT,
  observaciones TEXT,
  codigoren TEXT,
  coddestino TEXT,
  habilitado BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE expedientes
  ADD COLUMN IF NOT EXISTS codinum BIGSERIAL,
  ADD COLUMN IF NOT EXISTS codigo TEXT,
  ADD COLUMN IF NOT EXISTS numero INTEGER,
  ADD COLUMN IF NOT EXISTS anio INTEGER,
  ADD COLUMN IF NOT EXISTS tipo TEXT,
  ADD COLUMN IF NOT EXISTS fechainicio DATE,
  ADD COLUMN IF NOT EXISTS asunto TEXT,
  ADD COLUMN IF NOT EXISTS iniciador TEXT,
  ADD COLUMN IF NOT EXISTS fojas INTEGER,
  ADD COLUMN IF NOT EXISTS fechacarga DATE,
  ADD COLUMN IF NOT EXISTS usuario TEXT,
  ADD COLUMN IF NOT EXISTS caja TEXT,
  ADD COLUMN IF NOT EXISTS beneficiario TEXT,
  ADD COLUMN IF NOT EXISTS fechaentrada DATE,
  ADD COLUMN IF NOT EXISTS partida TEXT,
  ADD COLUMN IF NOT EXISTS reposicion TEXT,
  ADD COLUMN IF NOT EXISTS nacion TEXT,
  ADD COLUMN IF NOT EXISTS cajainterna TEXT,
  ADD COLUMN IF NOT EXISTS habilitado BOOLEAN,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;

ALTER TABLE expedientes
  DROP COLUMN IF EXISTS estado;

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS usuario TEXT,
  ADD COLUMN IF NOT EXISTS nombreusuario TEXT,
  ADD COLUMN IF NOT EXISTS nombre TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS telefono TEXT,
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS nivel TEXT,
  ADD COLUMN IF NOT EXISTS codigo TEXT,
  ADD COLUMN IF NOT EXISTS codigosector TEXT,
  ADD COLUMN IF NOT EXISTS habilitado BOOLEAN,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;

UPDATE usuarios SET habilitado = TRUE WHERE habilitado IS NULL;

ALTER TABLE usuarios
  ALTER COLUMN habilitado SET DEFAULT TRUE,
  ALTER COLUMN habilitado SET NOT NULL;

ALTER TABLE usuarios
  ALTER COLUMN email DROP NOT NULL;

ALTER TABLE sector
  ADD COLUMN IF NOT EXISTS codigosector TEXT,
  ADD COLUMN IF NOT EXISTS sector TEXT,
  ADD COLUMN IF NOT EXISTS habilitado BOOLEAN;

ALTER TABLE reparticion
  ADD COLUMN IF NOT EXISTS codigoreparticion TEXT,
  ADD COLUMN IF NOT EXISTS reparticion TEXT,
  ADD COLUMN IF NOT EXISTS habilitado BOOLEAN;

ALTER TABLE partida
  ADD COLUMN IF NOT EXISTS numero TEXT,
  ADD COLUMN IF NOT EXISTS nombre TEXT,
  ADD COLUMN IF NOT EXISTS habilitado BOOLEAN;

UPDATE sector SET habilitado = TRUE WHERE habilitado IS NULL;
UPDATE reparticion SET habilitado = TRUE WHERE habilitado IS NULL;
UPDATE partida SET habilitado = TRUE WHERE habilitado IS NULL;

ALTER TABLE sector
  ALTER COLUMN habilitado SET DEFAULT TRUE,
  ALTER COLUMN habilitado SET NOT NULL;

ALTER TABLE reparticion
  ALTER COLUMN habilitado SET DEFAULT TRUE,
  ALTER COLUMN habilitado SET NOT NULL;

ALTER TABLE partida
  ALTER COLUMN habilitado SET DEFAULT TRUE,
  ALTER COLUMN habilitado SET NOT NULL;

ALTER TABLE movimiento
  ADD COLUMN IF NOT EXISTS id BIGSERIAL,
  ADD COLUMN IF NOT EXISTS codigo TEXT,
  ADD COLUMN IF NOT EXISTS numero INTEGER,
  ADD COLUMN IF NOT EXISTS anio INTEGER,
  ADD COLUMN IF NOT EXISTS fechamov DATE,
  ADD COLUMN IF NOT EXISTS fechahora TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS origen TEXT,
  ADD COLUMN IF NOT EXISTS destino TEXT,
  ADD COLUMN IF NOT EXISTS motivo TEXT,
  ADD COLUMN IF NOT EXISTS estado TEXT,
  ADD COLUMN IF NOT EXISTS movimiento BIGINT,
  ADD COLUMN IF NOT EXISTS usuario TEXT,
  ADD COLUMN IF NOT EXISTS codigounm TEXT,
  ADD COLUMN IF NOT EXISTS codigosector TEXT,
  ADD COLUMN IF NOT EXISTS usuariodestino TEXT,
  ADD COLUMN IF NOT EXISTS observaciones TEXT,
  ADD COLUMN IF NOT EXISTS codigoren TEXT,
  ADD COLUMN IF NOT EXISTS coddestino TEXT,
  ADD COLUMN IF NOT EXISTS habilitado BOOLEAN;

UPDATE expedientes SET habilitado = TRUE WHERE habilitado IS NULL;
UPDATE movimiento SET habilitado = TRUE WHERE habilitado IS NULL;

ALTER TABLE expedientes
  ALTER COLUMN habilitado SET DEFAULT TRUE,
  ALTER COLUMN habilitado SET NOT NULL;

ALTER TABLE movimiento
  ALTER COLUMN habilitado SET DEFAULT TRUE,
  ALTER COLUMN habilitado SET NOT NULL;

ALTER TABLE movimiento
  ALTER COLUMN fechahora SET DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS remito_lote (
  id BIGSERIAL PRIMARY KEY,
  fechamov DATE NOT NULL,
  fechahora TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  codigoren TEXT NOT NULL,
  coddestino TEXT NOT NULL,
  origen TEXT,
  destino TEXT,
  usuario_id BIGINT,
  usuario TEXT,
  habilitado BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS remito_lote_movimiento (
  remito_lote_id BIGINT NOT NULL REFERENCES remito_lote(id) ON DELETE CASCADE,
  movimiento_id BIGINT NOT NULL REFERENCES movimiento(id),
  PRIMARY KEY (remito_lote_id, movimiento_id)
);

CREATE INDEX IF NOT EXISTS remito_lote_movimiento_movimiento_idx
  ON remito_lote_movimiento (movimiento_id);

ALTER TABLE movimiento
  ALTER COLUMN movimiento TYPE BIGINT
  USING NULLIF(movimiento::text, '')::BIGINT;

DO $$
BEGIN
  IF pg_get_serial_sequence('movimiento', 'movimiento') IS NULL THEN
    CREATE SEQUENCE IF NOT EXISTS movimiento_movimiento_seq;
    ALTER TABLE movimiento
      ALTER COLUMN movimiento SET DEFAULT nextval('movimiento_movimiento_seq');
  END IF;
END $$;

SELECT setval(
  COALESCE(pg_get_serial_sequence('movimiento', 'movimiento'), 'movimiento_movimiento_seq'),
  COALESCE((SELECT MAX(movimiento) FROM movimiento), 0) + 1,
  false
);

CREATE INDEX IF NOT EXISTS expedientes_codigo_numero_anio_idx
  ON expedientes (codigo, numero, anio);
CREATE UNIQUE INDEX IF NOT EXISTS expedientes_codinum_unq
  ON expedientes (codinum);

DO $$
BEGIN
  IF pg_get_serial_sequence('expedientes', 'codinum') IS NULL THEN
    CREATE SEQUENCE IF NOT EXISTS expedientes_codinum_seq;
    ALTER TABLE expedientes
      ALTER COLUMN codinum SET DEFAULT nextval('expedientes_codinum_seq');
  END IF;
END $$;

SELECT setval(
  COALESCE(pg_get_serial_sequence('expedientes', 'codinum'), 'expedientes_codinum_seq'),
  COALESCE((SELECT MAX(codinum) FROM expedientes), 0) + 1,
  false
);

CREATE INDEX IF NOT EXISTS usuarios_codigo_idx ON usuarios (codigo);
CREATE INDEX IF NOT EXISTS usuarios_usuario_idx ON usuarios (usuario);
CREATE INDEX IF NOT EXISTS usuarios_nombreusuario_idx ON usuarios (nombreusuario);
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_usuario_unq ON usuarios (usuario);
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_telefono_unq
  ON usuarios (telefono) WHERE telefono IS NOT NULL;

CREATE INDEX IF NOT EXISTS sector_sector_idx ON sector (sector);

CREATE INDEX IF NOT EXISTS reparticion_reparticion_idx ON reparticion (reparticion);

CREATE INDEX IF NOT EXISTS partida_nombre_idx ON partida (nombre);

CREATE INDEX IF NOT EXISTS movimiento_movimiento_idx ON movimiento (movimiento);
CREATE INDEX IF NOT EXISTS movimiento_anio_idx ON movimiento (anio);
CREATE INDEX IF NOT EXISTS movimiento_numero_idx ON movimiento (numero);
CREATE INDEX IF NOT EXISTS movimiento_codigo_idx ON movimiento (codigo);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_codigosector_fk'
  ) THEN
    ALTER TABLE usuarios
      ADD CONSTRAINT usuarios_codigosector_fk
      FOREIGN KEY (codigosector)
      REFERENCES sector (codigosector)
      ON DELETE SET NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_codigo_fk'
  ) THEN
    ALTER TABLE usuarios
      DROP CONSTRAINT usuarios_codigo_fk;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'expedientes_partida_fk'
  ) THEN
    ALTER TABLE expedientes
      ADD CONSTRAINT expedientes_partida_fk
      FOREIGN KEY (partida)
      REFERENCES partida (numero)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'movimiento_codigosector_fk'
  ) THEN
    ALTER TABLE movimiento
      ADD CONSTRAINT movimiento_codigosector_fk
      FOREIGN KEY (codigosector)
      REFERENCES sector (codigosector)
      ON DELETE SET NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'movimiento_codigoren_fk'
  ) THEN
    ALTER TABLE movimiento
      DROP CONSTRAINT movimiento_codigoren_fk;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'movimiento_coddestino_fk'
  ) THEN
    ALTER TABLE movimiento
      DROP CONSTRAINT movimiento_coddestino_fk;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'movimiento_codigoren_fk'
  ) THEN
    ALTER TABLE movimiento
      ADD CONSTRAINT movimiento_codigoren_fk
      FOREIGN KEY (codigoren)
      REFERENCES sector (codigosector)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'movimiento_coddestino_fk'
  ) THEN
    ALTER TABLE movimiento
      ADD CONSTRAINT movimiento_coddestino_fk
      FOREIGN KEY (coddestino)
      REFERENCES sector (codigosector)
      ON DELETE SET NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'expedientes_usuario_fk'
  ) THEN
    ALTER TABLE expedientes
      DROP CONSTRAINT expedientes_usuario_fk;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'expedientes_usuario_id_fk'
  ) THEN
    ALTER TABLE expedientes
      DROP CONSTRAINT expedientes_usuario_id_fk;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'movimiento_usuario_fk'
  ) THEN
    ALTER TABLE movimiento
      DROP CONSTRAINT movimiento_usuario_fk;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'movimiento_usuariodestino_fk'
  ) THEN
    ALTER TABLE movimiento
      DROP CONSTRAINT movimiento_usuariodestino_fk;
  END IF;
END $$;
`;

async function migrate() {
  try {
    await pool.query(createTableSQL);
    console.log("Migracion completada: tablas listas.");
  } catch (err) {
    console.error("Error en migracion:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
