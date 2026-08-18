import fs from "fs";
import path from "path";
import pool from "../src/config/db.js";

function leerDbf(rutaDbf) {
  const buffer = fs.readFileSync(rutaDbf);
  const numRecords = buffer.readUInt32LE(4);
  const headerLen = buffer.readUInt16LE(8);
  const recordLen = buffer.readUInt16LE(10);
  const fields = [];

  for (let offset = 32; offset < headerLen && buffer[offset] !== 0x0d; offset += 32) {
    fields.push({
      name: buffer.slice(offset, offset + 11).toString("latin1").replace(/\u0000/g, "").trim(),
      length: buffer[offset + 16],
    });
  }

  const rows = [];
  for (let i = 0, recordOffset = headerLen; i < numRecords; i += 1, recordOffset += recordLen) {
    const record = buffer.slice(recordOffset, recordOffset + recordLen);
    if (record.length < recordLen) break;
    let fieldOffset = 1;
    const row = { _deleted: record[0] === 0x2a };
    for (const field of fields) {
      row[field.name] = record
        .slice(fieldOffset, fieldOffset + field.length)
        .toString("latin1")
        .replace(/\u0000/g, "")
        .trim();
      fieldOffset += field.length;
    }
    rows.push(row);
  }
  return rows;
}

async function seed() {
  const rutaDbf = path.join(process.cwd(), "db_vieja", "reparticion.dbf");
  const map = new Map();
  for (const row of leerDbf(rutaDbf)) {
    const codigo = row.CODIGOREPA?.trim();
    const nombre = row.REPARTICIO?.trim();
    if (!codigo || !nombre) continue;
    map.set(codigo, { codigo, nombre, habilitado: !row._deleted });
  }

  const reparticiones = [...map.values()];
  if (!reparticiones.length) throw new Error("No hay reparticiones validas para cargar.");
  const placeholders = reparticiones
    .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`)
    .join(", ");
  const values = reparticiones.flatMap((r) => [r.codigo, r.nombre, r.habilitado]);

  await pool.query(
    `INSERT INTO reparticion (codigoreparticion, reparticion, habilitado)
     VALUES ${placeholders}
     ON CONFLICT (codigoreparticion) DO UPDATE SET
       reparticion = EXCLUDED.reparticion,
       habilitado = EXCLUDED.habilitado`,
    values
  );
  console.log(`Reparticiones cargadas: ${reparticiones.length}.`);
}

seed()
  .catch((err) => {
    console.error("Error cargando reparticiones:", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
