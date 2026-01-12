import fs from "fs";
import path from "path";
import pool from "../src/config/db.js";

function leerPartidasDesdeDbf(rutaDbf) {
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

  const partidas = [];
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
      if (field.type === "C") {
        row[field.name] = raw.toString("latin1").trim();
      } else {
        row[field.name] = raw.toString("latin1").trim();
      }
    }
    row._deleted = deleted;
    partidas.push(row);
  }

  return partidas;
}

async function seed() {
  const rutaDbf = path.join(process.cwd(), "db_vieja", "partida.dbf");
  const raw = leerPartidasDesdeDbf(rutaDbf);

  const map = new Map();
  for (const row of raw) {
    const numero = row.NUMERO?.trim();
    const nombre = row.NOMBRE?.trim();
    if (!numero || !nombre) {
      continue;
    }
    const existente = map.get(numero);
    const habilitado = !row._deleted;
    if (!existente) {
      map.set(numero, { nombre, habilitado });
      continue;
    }
    if (habilitado) {
      map.set(numero, { nombre, habilitado: true });
    }
  }

  const partidas = Array.from(map.entries()).map(([numero, data]) => ({
    numero,
    nombre: data.nombre,
    habilitado: data.habilitado,
  }));

  if (partidas.length === 0) {
    console.log("No hay partidas validas para cargar.");
    return;
  }

  const placeholders = partidas
    .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`)
    .join(", ");
  const values = partidas.flatMap((p) => [p.numero, p.nombre, p.habilitado]);
  const sql = `
    INSERT INTO partida (numero, nombre, habilitado)
    VALUES ${placeholders}
    ON CONFLICT (numero)
    DO UPDATE SET nombre = EXCLUDED.nombre, habilitado = EXCLUDED.habilitado
  `;

  try {
    await pool.query(sql, values);
    console.log(`Partidas cargadas: ${partidas.length}.`);
  } catch (err) {
    console.error("Error cargando partidas:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
