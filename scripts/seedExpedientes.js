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

function normalizeText(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function classifyTipo(asunto) {
  const texto = normalizeText(asunto);
  if (!texto) return "Otro";

  const rules = [
    {
      tipo: "Subsidios",
      keywords: ["subsidio", "acogimiento", "sustituta"],
    },
    {
      tipo: "Compras/Contrataciones",
      keywords: [
        "compra",
        "compras",
        "contratacion",
        "contrataciones",
        "previsiones",
        "utiles",
        "utiles escolares",
        "indumentaria",
        "limpieza",
        "arreglo",
        "refaccion",
      ],
    },
    {
      tipo: "Anticipos",
      keywords: ["anticipo", "anticipos", "rendir cuentas"],
    },
    {
      tipo: "Recursos Humanos",
      keywords: [
        "recursos humanos",
        "solicitud de articulos",
        "articulos",
        "accidente de trabajo",
        "renuncia",
        "adicional ley",
        "sancion",
        "sanciones",
        "novedades",
        "pedido de informe",
        "pedidos de informe",
      ],
    },
    {
      tipo: "Cajas Chicas",
      keywords: ["caja chica", "cajas chicas"],
    },
    {
      tipo: "Aprobacion de Proyectos",
      keywords: ["aprobacion de proyectos", "jornada", "capacitacion", "evento"],
    },
    {
      tipo: "Pagos/Servicios/Alquiler",
      keywords: [
        "pago",
        "factura",
        "alquiler",
        "servicio publico",
        "servicios publicos",
        "fireserver",
        "fire server",
      ],
    },
    {
      tipo: "Viaticos",
      keywords: ["viatico", "viaticos"],
    },
    {
      tipo: "Fondos/Partidas/Refuerzos",
      keywords: [
        "habilitacion de fondos",
        "transferencia",
        "creacion de partidas",
        "partidas",
        "refuerzo",
        "refuerzos",
        "compromiso definitivo",
        "reemplazos",
      ],
    },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((keyword) => texto.includes(keyword))) {
      return rule.tipo;
    }
  }

  return "Otro";
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

  await pool.query("TRUNCATE expedientes RESTART IDENTITY CASCADE");

  const expedientesMap = new Map();
  for (const row of rows) {
    const codinum = toInt(row.CODIGONUM);
    const numero = toInt(row.NUMERO);
    if (!codinum || !numero) {
      continue;
    }
    const habilitado = !(row._deleted || false);
    const fechaInicio = toDate(row.FECHAINICI);
    const anioRaw = getField(row, ["AO", "AÑO", "ANIO", "ANO"]);
    const asunto = toString(row.ASUNTO) || null;
    expedientesMap.set(codinum, {
      codinum,
      codigo: toString(row.CODIGO) || null,
      numero,
      anio: toInt(anioRaw),
      fechainicio: fechaInicio,
      asunto,
      tipo: classifyTipo(asunto),
      iniciador: toString(row.INICIADOPO) || null,
      fojas: toInt(row.FOJAS),
      fechacarga: toDate(row.FECHACARGA),
      usuario: toString(row.USUARIO) || null,
      caja: toString(row.CAJA) || null,
      beneficiario: toString(row.BENEFICIAR) || null,
      fechaentrada: toDate(row.FECHAENTRA),
      partida: toString(row.PARTIDA) || null,
      reposicion: toString(row.REPOSICION) || null,
      nacion: toBooleanText(row.NACION),
      cajainterna: toString(row.CAJAINTERN) || null,
      habilitado,
    });
  }

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
        const base = idx * 19;
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13}, $${base + 14}, $${base + 15}, $${base + 16}, $${base + 17}, $${base + 18}, $${base + 19})`;
      })
      .join(", ");
    const values = chunk.flatMap((e) => [
      e.codinum,
      e.codigo,
      e.numero,
      e.anio,
      e.tipo,
      e.fechainicio,
      e.asunto,
      e.iniciador,
      e.fojas,
      e.fechacarga,
      e.usuario,
      e.caja,
      e.beneficiario,
      e.fechaentrada,
      e.partida,
      e.reposicion,
      e.nacion,
      e.cajainterna,
      e.habilitado,
    ]);
    const sql = `
      INSERT INTO expedientes (
        codinum,
        codigo,
        numero,
        anio,
        tipo,
        fechainicio,
        asunto,
        iniciador,
        fojas,
        fechacarga,
        usuario,
        caja,
        beneficiario,
        fechaentrada,
        partida,
        reposicion,
        nacion,
        cajainterna,
        habilitado
      )
      VALUES ${placeholders}
      ON CONFLICT (codinum)
      DO UPDATE SET
        codigo = EXCLUDED.codigo,
        numero = EXCLUDED.numero,
        anio = EXCLUDED.anio,
        tipo = EXCLUDED.tipo,
        fechainicio = EXCLUDED.fechainicio,
        asunto = EXCLUDED.asunto,
        iniciador = EXCLUDED.iniciador,
        fojas = EXCLUDED.fojas,
        fechacarga = EXCLUDED.fechacarga,
        usuario = EXCLUDED.usuario,
        caja = EXCLUDED.caja,
        beneficiario = EXCLUDED.beneficiario,
        fechaentrada = EXCLUDED.fechaentrada,
        partida = EXCLUDED.partida,
        reposicion = EXCLUDED.reposicion,
        nacion = EXCLUDED.nacion,
        cajainterna = EXCLUDED.cajainterna,
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

