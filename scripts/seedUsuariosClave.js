import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import pool from "../src/config/db.js";

const DEFAULT_PASSWORD = "1234";
const SALT_ROUNDS = 10;

function leerClaveDesdeDbf(rutaDbf) {
  const buffer = fs.readFileSync(rutaDbf);
  const numRecords = buffer.readUInt32LE(4);
  const headerLen = buffer.readUInt16LE(8);
  const recordLen = buffer.readUInt16LE(10);

  const fields = [];
  let offset = 32;
  while (offset < headerLen) {
    if (buffer[offset] === 0x0d) {
      break;
    }
    const name = buffer
      .slice(offset, offset + 11)
      .toString("ascii")
      .replace(/\u0000/g, "")
      .trim();
    const type = String.fromCharCode(buffer[offset + 11]);
    const length = buffer[offset + 16];
    fields.push({ name, type, length });
    offset += 32;
  }

  const rows = [];
  let recordOffset = headerLen;
  for (let i = 0; i < numRecords; i += 1) {
    const record = buffer.slice(recordOffset, recordOffset + recordLen);
    recordOffset += recordLen;
    if (record.length === 0) {
      break;
    }
    const deleted = record[0] === 0x2a;
    let fieldOffset = 1;
    const row = {};
    for (const field of fields) {
      const raw = record.slice(fieldOffset, fieldOffset + field.length);
      fieldOffset += field.length;
      row[field.name] = raw.toString("latin1").trim();
    }
    row._deleted = deleted;
    rows.push(row);
  }

  return rows;
}

function toNullable(value) {
  const trimmed = (value || "").trim();
  return trimmed.length ? trimmed : null;
}

async function seed() {
  const rutaDbf = path.join(process.cwd(), "db_vieja", "clave.dbf");
  const raw = leerClaveDesdeDbf(rutaDbf);

  const sectores = await pool.query("SELECT codigosector FROM sector");
  const sectoresSet = new Set(
    sectores.rows.map((row) => String(row.codigosector))
  );

  const usuariosMap = new Map();
  for (const row of raw) {
    const login = toNullable(row.NOMBREUSUA);
    const nombre = toNullable(row.USUARIO);
    if (!login || !nombre) {
      continue;
    }
    if (!usuariosMap.has(login)) {
      usuariosMap.set(login, {
        usuario: login,
        nombreusuario: nombre,
        nombre,
        email: null,
        nivel: toNullable(row.NIVEL),
        codigo: toNullable(row.CODIGO),
        codigosector: toNullable(row.CODIGOSECT),
        habilitado: !row._deleted,
      });
    }
  }

  for (const usuario of usuariosMap.values()) {
    if (usuario.codigosector && !sectoresSet.has(String(usuario.codigosector))) {
      usuario.codigosector = null;
    }
  }

  const usuarios = Array.from(usuariosMap.values());
  if (usuarios.length === 0) {
    console.log("No hay usuarios validos para cargar.");
    return;
  }

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  const placeholders = usuarios
    .map(
      (_, i) =>
        `($${i * 9 + 1}, $${i * 9 + 2}, $${i * 9 + 3}, $${i * 9 + 4}, $${i * 9 + 5}, $${i * 9 + 6}, $${i * 9 + 7}, $${i * 9 + 8}, $${i * 9 + 9})`
    )
    .join(", ");
  const values = usuarios.flatMap((u) => [
    u.usuario,
    u.nombreusuario,
    u.nombre,
    u.email,
    passwordHash,
    u.nivel,
    u.codigo,
    u.codigosector,
    u.habilitado,
  ]);
  const sql = `
    INSERT INTO usuarios (
      usuario,
      nombreusuario,
      nombre,
      email,
      password_hash,
      nivel,
      codigo,
      codigosector,
      habilitado
    )
    VALUES ${placeholders}
    ON CONFLICT (usuario)
    DO UPDATE SET
      nombreusuario = EXCLUDED.nombreusuario,
      nombre = EXCLUDED.nombre,
      email = COALESCE(EXCLUDED.email, usuarios.email),
      password_hash = EXCLUDED.password_hash,
      nivel = EXCLUDED.nivel,
      codigo = EXCLUDED.codigo,
      codigosector = EXCLUDED.codigosector,
      habilitado = EXCLUDED.habilitado
  `;

  try {
    await pool.query(sql, values);
    console.log(`Usuarios cargados: ${usuarios.length}.`);
  } catch (err) {
    console.error("Error cargando usuarios:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
