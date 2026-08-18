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
      .toString("latin1")
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

function getField(row, names) {
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(row, name)) {
      return row[name];
    }
  }
  return undefined;
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


function toBooleanText(raw) {
  const text = toString(raw).toUpperCase();
  if (!text) return null;
  if (text === "T" || text === "Y") return "true";
  if (text === "F" || text === "N") return "false";
  return null;
}

function getBlockSize(fpt) {
  const be = fpt.readUInt16BE(6);
  const le = fpt.readUInt16LE(6);
  const isValid = (val) => val >= 64 && val <= 65535;
  if (isValid(be) && !isValid(le)) return be;
  if (isValid(le) && !isValid(be)) return le;
  if (isValid(be) && isValid(le)) {
    if (be === 512 || le !== 512) return be;
    return le;
  }
  return 512;
}

function leerMemo(fpt, blockSize, pointer) {
  if (!pointer) return null;
  const start = pointer * blockSize;
  if (start >= fpt.length) return null;

  const lenFrom4 = fpt.readUInt32LE(start + 4);
  const lenFrom0 = fpt.readUInt32LE(start);
  const maxLen = fpt.length - start - 8;

  let length = null;
  let dataOffset = start + 8;
  if (lenFrom4 > 0 && lenFrom4 <= maxLen) {
    length = lenFrom4;
  } else if (lenFrom0 > 0 && lenFrom0 <= maxLen) {
    length = lenFrom0;
    dataOffset = start + 4;
  } else {
    return null;
  }

  const data = fpt.slice(dataOffset, dataOffset + length);
  return data.toString("latin1").trim();
}

async function seed() {
  await pool.query("TRUNCATE movimiento RESTART IDENTITY CASCADE");
  const rutaDbf = path.join(process.cwd(), "db_vieja", "movimiento.dbf");
  const rutaFpt = path.join(process.cwd(), "db_vieja", "movimiento.FPT");
  const fpt = fs.readFileSync(rutaFpt);
  const blockSize = getBlockSize(fpt);

  const { rows } = leerDbf(rutaDbf);
  const usuarios = await pool.query(
    "SELECT id, nombre, codigo, codigosector FROM usuarios"
  );
  const usuariosByNombre = new Map(
    usuarios.rows.map((row) => [String(row.nombre), row])
  );
  const sectores = await pool.query("SELECT codigosector FROM sector");
  const sectoresSet = new Set(
    sectores.rows.map((row) => String(row.codigosector))
  );
  const movimientos = [];
  for (const row of rows) {
    const numero = toInt(row.NUMERO);
    const movimiento = toInt(row.MOVIMIENTO);
    if (!numero || !movimiento) {
      continue;
    }
    const memoPointer = row.OBSERVACIO.readUInt32LE(0);
    const fechaMov = toDate(row.FECHAMOV);
    const usuarioNombre = toString(row.USUARIO) || null;
    const usuarioDestinoNombre = toString(row.USUARIODES) || null;
    const usuarioRow = usuarioNombre
      ? usuariosByNombre.get(usuarioNombre) ?? null
      : null;
    const usuarioDestinoRow = usuarioDestinoNombre
      ? usuariosByNombre.get(usuarioDestinoNombre) ?? null
      : null;

    const anioRaw = getField(row, ["AO", "AÑO", "ANIO", "ANO"]);

    movimientos.push({
      codigo: toString(row.CODIGO) || null,
      numero,
      anio: toInt(anioRaw),
      fechamov: fechaMov,
      origen: toString(row.ORIGEN) || null,
      destino: toString(row.DESTINO) || null,
      motivo: toString(row.MOTIVO) || null,
      estado: toString(row.ESTADO) || null,
      movimiento,
      usuario: usuarioNombre,
      codigounm: toString(row.CODIGONUM) || null,
      codigosector: usuarioRow?.codigosector ?? (toString(row.CODIGOSECT) || null),
      usuariodestino: usuarioDestinoNombre,
      observaciones: leerMemo(fpt, blockSize, memoPointer),
      codigoren: toString(row.CODORIGEN) || null,
      coddestino: toString(row.CODDESTINO) || null,
      habilitado: !row._deleted,
    });
  }

  for (const mov of movimientos) {
    if (mov.codigosector && !sectoresSet.has(mov.codigosector)) {
      mov.codigosector = null;
    }
    if (mov.codigoren && !sectoresSet.has(mov.codigoren)) {
      mov.codigoren = null;
    }
    if (mov.coddestino && !sectoresSet.has(mov.coddestino)) {
      mov.coddestino = null;
    }
  }

  if (movimientos.length === 0) {
    console.log("No hay movimientos validos para cargar.");
    return;
  }

  const chunkSize = 200;
  for (let i = 0; i < movimientos.length; i += chunkSize) {
    const chunk = movimientos.slice(i, i + chunkSize);
    const placeholders = chunk
      .map((_, idx) => {
        const base = idx * 17;
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13}, $${base + 14}, $${base + 15}, $${base + 16}, $${base + 17})`;
      })
      .join(", ");
    const values = chunk.flatMap((m) => [
      m.codigo,
      m.numero,
      m.anio,
      m.fechamov,
      m.origen,
      m.destino,
      m.motivo,
      m.estado,
      m.movimiento,
      m.usuario,
      m.codigounm,
      m.codigosector,
      m.usuariodestino,
      m.observaciones,
      m.codigoren,
      m.coddestino,
      m.habilitado,
    ]);
    const sql = `
      INSERT INTO movimiento (
        codigo,
        numero,
        anio,
        fechamov,
        origen,
        destino,
        motivo,
        estado,
        movimiento,
        usuario,
        codigounm,
        codigosector,
        usuariodestino,
        observaciones,
        codigoren,
        coddestino,
        habilitado
      )
      VALUES ${placeholders}
    `;
    await pool.query(sql, values);
  }

  console.log(`Movimientos cargados: ${movimientos.length}.`);
  await pool.end();
}

seed().catch((err) => {
  console.error("Error cargando movimientos:", err);
  process.exitCode = 1;
});
