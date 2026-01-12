import fs from "fs";
import path from "path";
import pool from "../src/config/db.js";

function leerSectoresDesdeDbf(rutaDbf) {
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

  const sectores = [];
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
    sectores.push(row);
  }

  return sectores;
}

async function seed() {
  try {
    const rutaDbf = path.join(process.cwd(), "db_vieja", "sector.dbf");
    const raw = leerSectoresDesdeDbf(rutaDbf);
    const map = new Map();
    for (const row of raw) {
      const codigosector = row.CODIGOSECT?.trim();
      const sector = row.SECTOR?.trim();
      if (!codigosector || !sector) {
        continue;
      }
      const existente = map.get(codigosector);
      const habilitado = !row._deleted;
      if (!existente) {
        map.set(codigosector, { sector, habilitado });
        continue;
      }
      if (habilitado) {
        map.set(codigosector, { sector, habilitado: true });
      }
    }

    const sectores = Array.from(map.entries()).map(([codigosector, data]) => ({
      codigosector,
      sector: data.sector,
      habilitado: data.habilitado,
    }));
    if (sectores.length === 0) {
      console.log("No hay sectores validos para cargar.");
      return;
    }

    const valuesWithState = sectores.flatMap((s) => [
      s.codigosector,
      s.sector,
      s.habilitado,
    ]);
    const placeholdersWithState = sectores
      .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`)
      .join(", ");
    const sqlWithState = `
      INSERT INTO sector (codigosector, sector, habilitado)
      VALUES ${placeholdersWithState}
      ON CONFLICT (codigosector)
      DO UPDATE SET sector = EXCLUDED.sector, habilitado = EXCLUDED.habilitado
    `;
    await pool.query(sqlWithState, valuesWithState);
    console.log("Sectores cargados.");
  } catch (err) {
    console.error("Error cargando sectores:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
