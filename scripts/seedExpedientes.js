import fs from "fs";
import path from "path";
import pool from "../src/config/db.js";

function leerDbf(rutaDbf) {
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
      row[field.name] = raw;
    }
    row._deleted = deleted;
    rows.push(row);
  }

  return { rows, fields };
}

function toString(raw) {
  if (!raw) return "";
  return raw
    .toString("latin1")
    .replace(/\u0000/g, "")
    .trim();
}

function toNumber(raw) {
  const text = toString(raw);
  if (!text) return null;
  const num = Number(text.replace(",", "."));
  return Number.isNaN(num) ? null : num;
}

function toInt(raw) {
  const num = toNumber(raw);
  return num === null ? null : Math.trunc(num);
}

function toDate(raw) {
  const text = toString(raw);
  if (!text || text.length !== 8) return null;
  const year = text.slice(0, 4);
  const month = text.slice(4, 6);
  const day = text.slice(6, 8);
  return `${year}-${month}-${day}`;
}

function normalizarAnio(rawAnio, fechaInicio) {
  const anio = toInt(rawAnio);
  if (!anio) {
    return fechaInicio ? Number(fechaInicio.slice(0, 4)) : null;
  }
  if (anio < 100) {
    return 2000 + anio;
  }
  if (anio > 2100 && fechaInicio) {
    return Number(fechaInicio.slice(0, 4));
  }
  return anio;
}

function toBooleanText(raw) {
  const text = toString(raw).toUpperCase();
  if (!text) return null;
  if (text === "T" || text === "Y") return "true";
  if (text === "F" || text === "N") return "false";
  return null;
}

async function seed() {
  const rutaDbf = path.join(process.cwd(), "db_vieja", "expte.dbf");
  const { rows } = leerDbf(rutaDbf);

  const usuarios = await pool.query("SELECT id, nombre FROM usuarios");
  const usuariosByNombre = new Map(
    usuarios.rows.map((row) => [String(row.nombre), row.id])
  );

  const expedientesMap = new Map();
  for (const row of rows) {
    const codinum = toInt(row.CODIGONUM);
    const numero = toInt(row.NUMERO);
    if (!codinum || !numero) {
      continue;
    }
    const habilitado = !(row._deleted || false);
    const usuarioNombre = toString(row.USUARIO) || null;
    const usuarioId = usuarioNombre
      ? usuariosByNombre.get(usuarioNombre) ?? null
      : null;

    const fechaInicio = toDate(row.FECHAINICI);
    expedientesMap.set(codinum, {
      codinum,
      codigo: toString(row.CODIGO) || null,
      numero,
      anio: normalizarAnio(row.AO, fechaInicio),
      fechainicio: fechaInicio,
      asunto: toString(row.ASUNTO) || null,
      iniciador: toString(row.INICIADOPO) || null,
      fojas: toInt(row.FOJAS),
      fechacarga: toDate(row.FECHACARGA),
      usuario: usuarioNombre,
      usuario_id: usuarioId,
      caja: toString(row.CAJA) || null,
      beneficiario: toString(row.BENEFICIAR) || null,
      fechaentrada: toDate(row.FECHAENTRA),
      partida: toString(row.PARTIDA) || null,
      reposicion: toString(row.REPOSICION) || null,
      nacion: toBooleanText(row.NACION),
      cajainterna: toString(row.CAJAINTERN) || null,
      estado: toString(row.ESTADO) || "E",
      habilitado,
    });
  }

  // usuario_id queda null si no hay match por nombre

  const expedientes = Array.from(expedientesMap.values());
  if (expedientes.length === 0) {
    console.log("No hay expedientes validos para cargar.");
    return;
  }

  const chunkSize = 200;
  for (let i = 0; i < expedientes.length; i += chunkSize) {
    const chunk = expedientes.slice(i, i + chunkSize);
    const placeholders = chunk
      .map((_, idx) => {
        const base = idx * 20;
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13}, $${base + 14}, $${base + 15}, $${base + 16}, $${base + 17}, $${base + 18}, $${base + 19}, $${base + 20})`;
      })
      .join(", ");
    const values = chunk.flatMap((e) => [
      e.codinum,
      e.codigo,
      e.numero,
      e.anio,
      e.fechainicio,
      e.asunto,
      e.iniciador,
      e.fojas,
      e.fechacarga,
      e.usuario,
      e.usuario_id,
      e.caja,
      e.beneficiario,
      e.fechaentrada,
      e.partida,
      e.reposicion,
      e.nacion,
      e.cajainterna,
      e.estado,
      e.habilitado,
    ]);
    const sql = `
      INSERT INTO expedientes (
        codinum,
        codigo,
        numero,
        anio,
        fechainicio,
        asunto,
        iniciador,
        fojas,
        fechacarga,
        usuario,
        usuario_id,
        caja,
        beneficiario,
        fechaentrada,
        partida,
        reposicion,
        nacion,
        cajainterna,
        estado,
        habilitado
      )
      VALUES ${placeholders}
      ON CONFLICT (codinum)
      DO UPDATE SET
        codigo = EXCLUDED.codigo,
        numero = EXCLUDED.numero,
        anio = EXCLUDED.anio,
        fechainicio = EXCLUDED.fechainicio,
        asunto = EXCLUDED.asunto,
        iniciador = EXCLUDED.iniciador,
        fojas = EXCLUDED.fojas,
        fechacarga = EXCLUDED.fechacarga,
        usuario = EXCLUDED.usuario,
        usuario_id = EXCLUDED.usuario_id,
        caja = EXCLUDED.caja,
        beneficiario = EXCLUDED.beneficiario,
        fechaentrada = EXCLUDED.fechaentrada,
        partida = EXCLUDED.partida,
        reposicion = EXCLUDED.reposicion,
        nacion = EXCLUDED.nacion,
        cajainterna = EXCLUDED.cajainterna,
        estado = EXCLUDED.estado,
        habilitado = EXCLUDED.habilitado
    `;
    await pool.query(sql, values);
  }

  console.log(`Expedientes cargados: ${expedientes.length}.`);
  await pool.end();
}

seed().catch((err) => {
  console.error("Error cargando expedientes:", err);
  process.exitCode = 1;
});
