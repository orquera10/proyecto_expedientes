import pool from "../config/db.js";
import {
  obtenerUltimasSalidas,
  obtenerUltimasEntradas,
} from "../models/movimientoModel.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const conversationStore = new Map();
const preferenceStore = new Map();
const lastResultStore = new Map();

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fallbackParse(question) {
  const lower = normalizeText(question);
  const greetings = [
    "hola",
    "buenas",
    "buen dia",
    "buenos dias",
    "buenas tardes",
    "buenas noches",
  ];
  const hasGreeting = greetings.some((greet) => lower.includes(greet));
  const cleanedLower = greetings.reduce(
    (acc, greet) => acc.replace(greet, " "),
    lower
  );
  const match =
    question.match(/(\d+)\s*[-/]\s*(\d+)\s*[-/]\s*(\d{4})/) ||
    question.match(/(\d+)\s+(\d+)\s+(\d{4})/);
  const codigo = match ? match[1] : null;
  const numero = match ? match[2] : null;
  const anio = match ? match[3] : null;

  if (
    (cleanedLower.includes("donde") ||
      cleanedLower.includes("info") ||
      cleanedLower.includes("informacion") ||
      cleanedLower.includes("detalle") ||
      cleanedLower.includes("expediente")) &&
    codigo &&
    numero &&
    anio
  ) {
    return { intent: "ubicacion_expediente", codigo, numero, anio };
  }
  if (codigo && numero && anio) {
    return { intent: "ubicacion_expediente", codigo, numero, anio };
  }
  if (
    cleanedLower.includes("expediente") &&
    (cleanedLower.includes("info") ||
      cleanedLower.includes("informacion") ||
      cleanedLower.includes("detalle"))
  ) {
    return { intent: "pedir_expediente" };
  }
  if (
    (cleanedLower.includes("informacion") || cleanedLower.includes("info")) &&
    cleanedLower.includes("expediente")
  ) {
    return { intent: "pedir_expediente" };
  }
  if (
    cleanedLower.includes("registrar") ||
    cleanedLower.includes("cargar") ||
    cleanedLower.includes("alta")
  ) {
    if (cleanedLower.includes("expediente")) {
      return { intent: "como_registrar_expediente" };
    }
  }
  if (
    (cleanedLower.includes("ultimos") || cleanedLower.includes("ultimas")) &&
    (cleanedLower.includes("entrada") ||
      cleanedLower.includes("para entrada") ||
      cleanedLower.includes("enviados") ||
      cleanedLower.includes("enviaron") ||
      cleanedLower.includes("mandaron") ||
      cleanedLower.includes("dirigidos") ||
      cleanedLower.includes("llegaron") ||
      cleanedLower.includes("recibidos")) &&
    cleanedLower.includes("sector")
  ) {
    return { intent: "ultimos_dirigidos_a_mi_sector" };
  }
  if (
    (cleanedLower.includes("ultimos") || cleanedLower.includes("ultimas")) &&
    (cleanedLower.includes("salida") ||
      cleanedLower.includes("para salida") ||
      cleanedLower.includes("salieron") ||
      cleanedLower.includes("en mi sector")) &&
    cleanedLower.includes("sector")
  ) {
    return { intent: "ultimos_en_mi_sector" };
  }
  const temaMatch = cleanedLower.match(
    /(contienen|contenga|contengan|referido a|referidos a|referida a|referidas a|sobre|asunto|tema|relacionad[oa]s?\s+con)\s+(.+)$/
  );
  if (temaMatch) {
    const rawTema = limpiarTema(temaMatch[2]);
    if (rawTema) {
      if (
        cleanedLower.includes("sector") &&
        (cleanedLower.includes("va a mi sector") ||
          cleanedLower.includes("dirigido a mi sector") ||
          cleanedLower.includes("dirigidos a mi sector") ||
          cleanedLower.includes("llega a mi sector") ||
          cleanedLower.includes("llegan a mi sector"))
      ) {
        return { intent: "buscar_por_asunto_dirigidos", tema: rawTema };
      }
      return { intent: "buscar_por_asunto", tema: rawTema };
    }
  }
  if (cleanedLower.includes("expediente") && !codigo && !numero && !anio) {
    const tema = limpiarTema(cleanedLower);
    if (tema) {
      return { intent: "buscar_por_asunto", tema };
    }
  }
  return hasGreeting ? { intent: "saludo" } : { intent: "desconocido" };
}

function addToConversation(userId, role, content) {
  if (!conversationStore.has(userId)) {
    conversationStore.set(userId, []);
  }
  const history = conversationStore.get(userId);
  history.push({ role, content });
  if (history.length > 12) {
    history.splice(0, history.length - 12);
  }
}

function getConversation(userId) {
  return conversationStore.get(userId) || [];
}

function setPreferSoloClave(userId, value) {
  preferenceStore.set(userId, value);
}

function getPreferSoloClave(userId) {
  return preferenceStore.get(userId) || false;
}

function setLastResults(userId, rows) {
  if (!Array.isArray(rows)) return;
  lastResultStore.set(userId, rows);
}

function getLastResults(userId) {
  return lastResultStore.get(userId) || null;
}

function limpiarTema(rawTema) {
  let tema = normalizeText(rawTema || "")
    .replace(/["'`]/g, "")
    .replace(/[.,;:!?]+$/g, "")
    .trim();
  if (!tema) return "";
  const matchRelacionado = tema.match(/relacionad[oa]s?\s+con\s+(.+)$/);
  if (matchRelacionado) {
    tema = matchRelacionado[1].trim();
  }
  tema = tema
    .replace(/^que\s+contenga\s+/g, "")
    .replace(/^que\s+tenga\s+/g, "")
    .replace(/^(algo\s+)?(relacionad[oa]s?\s+)?/g, "")
    .replace(/^(con|sobre|referid[oa]s?\s+a)\s+/g, "")
    .trim();
  return tema;
}

function parseLimitFromQuestion(question, fallback = 10) {
  const match = normalizeText(question).match(/ultim(?:os|as)\s+(\d+)/);
  if (!match) return fallback;
  const value = Number(match[1]);
  if (!Number.isInteger(value) || value <= 0) return fallback;
  return Math.min(value, 50);
}

function expandTema(tema) {
  const base = tema.trim();
  if (!base) return [];
  const catalog = {
    informatica: [
      "informatica",
      "computacion",
      "computadora",
      "notebook",
      "servidor",
      "mouse",
      "teclado",
      "impresora",
      "scanner",
      "wifi",
    ],
    vehiculos: [
      "vehiculo",
      "vehiculos",
      "auto",
      "automotor",
      "camion",
      "camioneta",
      "moto",
      "motocicleta",
      "utilitario",
      "patente",
      "transporte",
    ],
  };
  const terms = catalog[base] ? catalog[base] : [base];
  return terms.filter((term) => term.length >= 4);
}

async function callGroq(messages, tools) {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.2,
      max_tokens: 350,
      tools,
      tool_choice: "auto",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(text || "Error consultando Groq");
    error.status = response.status;
    throw error;
  }
  return response.json();
}

async function obtenerUltimosPorDestino(codigosector, incluirTodos) {
  const result = await obtenerUltimasSalidas({
    codigosector,
    incluirTodos,
    limit: 10,
    offset: 0,
    filtrosBusqueda: {},
  });
  return result.rows;
}

async function obtenerUltimosPorOrigen(codigosector) {
  const result = await pool.query(
    `SELECT m.codigo,
            m.numero,
            m.anio,
            m.fechamov,
            m.origen,
            m.destino,
            m.movimiento,
            e.asunto
     FROM movimiento m
     JOIN expedientes e
       ON e.codigo::text = m.codigo::text
      AND e.numero::text = m.numero::text
      AND e.anio::text = m.anio::text
     WHERE m.estado = 'S' AND m.codigoren::text = $1::text
     ORDER BY m.movimiento DESC NULLS LAST, m.id DESC
     LIMIT 10`,
    [String(codigosector)]
  );
  return result.rows;
}

async function obtenerUltimosEnMiSector(codigosector, incluirTodos) {
  const result = await obtenerUltimasEntradas({
    codigosector,
    incluirTodos,
    limit: 10,
    offset: 0,
    filtrosBusqueda: {},
  });
  return result.rows;
}

async function obtenerUltimosPorDestinoConAsunto(
  codigosector,
  incluirTodos,
  asunto,
  limit
) {
  const result = await obtenerUltimasSalidas({
    codigosector,
    incluirTodos,
    limit,
    offset: 0,
    filtrosBusqueda: {
      asunto,
    },
  });
  return result.rows;
}

async function buscarPorAsunto(tema, limit) {
  const terms = expandTema(tema);
  const patterns = terms.map((term) => `%${term}%`);
  const result = await pool.query(
    `SELECT codigo,
            numero,
            anio,
            asunto
     FROM expedientes
     WHERE asunto ILIKE ANY($1)
       AND (habilitado IS DISTINCT FROM false)
     ORDER BY fechainicio DESC NULLS LAST, codinum DESC
     LIMIT $2`,
    [patterns, Number(limit)]
  );
  return result.rows;
}

async function buscarPorAsuntoDirigidos(
  codigosector,
  incluirTodos,
  tema,
  limit
) {
  const terms = expandTema(tema);
  const patterns = terms.map((term) => `%${term}%`);
  const values = [];
  let filtroDestino = "";
  if (!incluirTodos) {
    values.push(String(codigosector));
    filtroDestino = `AND l.coddestino::text = $${values.length}::text`;
  }
  values.push(patterns);
  const patternsIndex = values.length;
  values.push(Number(limit));
  const limitIndex = values.length;

  const result = await pool.query(
    `WITH latest AS (
       SELECT DISTINCT ON (TRIM(codigo::text), numero, anio)
              id,
              TRIM(codigo::text) AS codigo,
              numero,
              anio,
              fechamov,
              origen,
              destino,
              motivo,
              estado,
              movimiento,
              usuario,
              codigosector,
              codigoren,
              coddestino
       FROM movimiento
       ORDER BY TRIM(codigo::text), numero, anio, movimiento DESC NULLS LAST, id DESC
     )
     SELECT l.codigo,
            l.numero,
            l.anio,
            l.fechamov,
            l.origen,
            l.destino,
            l.movimiento,
            e.asunto
     FROM latest l
     JOIN expedientes e
       ON TRIM(e.codigo::text) = l.codigo
      AND e.numero::text = l.numero::text
      AND e.anio::text = l.anio::text
     WHERE l.estado = 'S'
     ${filtroDestino}
       AND e.asunto ILIKE ANY($${patternsIndex})
     ORDER BY l.movimiento DESC NULLS LAST, l.id DESC
     LIMIT $${limitIndex}`,
    values
  );
  return result.rows;
}

async function obtenerUltimaUbicacion(codigo, numero, anio) {
  const result = await pool.query(
    `SELECT codigo,
            numero,
            anio,
            fechamov,
            origen,
            destino,
            estado,
            movimiento,
            codigosector,
            coddestino,
            codigoren
     FROM movimiento
     WHERE codigo::text = $1::text AND numero = $2 AND anio = $3
     ORDER BY movimiento DESC NULLS LAST, id DESC
     LIMIT 1`,
    [String(codigo), Number(numero), Number(anio)]
  );
  return result.rows[0] || null;
}

function formatearLista(rows) {
  if (rows.length === 0) return "No hay resultados.";
  return rows
    .map(
      (row, idx) =>
        `${idx + 1}. ${row.codigo}-${row.numero}-${row.anio} - ${row.asunto || "Sin asunto"} - ${row.destino || row.origen || "N/D"}`
    )
    .join("\n");
}

function formatearListaClave(rows) {
  if (rows.length === 0) return "No hay resultados.";
  return rows
    .map((row, idx) => `${idx + 1}. ${row.codigo}-${row.numero}-${row.anio}`)
    .join("\n");
}

function limpiarSalidaModelo(texto) {
  if (!texto) return "";
  return texto
    .replace(/<function=[^>]+>[\s\S]*?<\/function>/gi, "")
    .replace(/<\/?function>/gi, "")
    .trim();
}

export async function responderConsulta(req, res, next) {
  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: "Falta el mensaje" });
  }

  try {
    const userId = req.user?.id || req.user?.email || "anon";
    const codigosector = req.user?.codigosector;
    const incluirTodosEntrada =
      req.user?.nivel === "S" || String(codigosector) === "1";
    const incluirTodosSalida = req.user?.nivel === "S";
    const normalized = normalizeText(message);
    if (normalized.includes("solo numero") || normalized.includes("solo numeros")) {
      setPreferSoloClave(userId, true);
    }
    if (normalized.includes("con detalle") || normalized.includes("detallado") || normalized.includes("con asunto")) {
      setPreferSoloClave(userId, false);
    }
    if (!codigosector) {
      return res
        .status(400)
        .json({ error: "No se pudo determinar el sector del usuario" });
    }

    if (
      normalized === "solo numeros" ||
      normalized === "solo numero" ||
      normalized === "solo numeros por favor" ||
      normalized === "solo numero por favor"
    ) {
      const lastRows = getLastResults(userId);
      if (lastRows && lastRows.length > 0) {
        const listado = formatearListaClave(lastRows);
        return res.json({
          answer: `Solo numeros:\n${listado}`,
          data: lastRows,
        });
      }
      return res.json({
        answer: "No tengo un listado previo. Hace una consulta primero.",
      });
    }

    const sectorQuery = normalizeText(message);
    const quiereEntrada =
      sectorQuery.includes("dirigido a mi sector") ||
      sectorQuery.includes("dirigidos a mi sector") ||
      sectorQuery.includes("va a mi sector") ||
      sectorQuery.includes("llega a mi sector") ||
      sectorQuery.includes("entrada");
    const quiereSalida =
      sectorQuery.includes("en mi sector") ||
      sectorQuery.includes("en mi area") ||
      sectorQuery.includes("en mi sector");

    if (sectorQuery.includes("expediente") && quiereEntrada) {
      const rows = await obtenerUltimosPorDestino(
        codigosector,
        incluirTodosEntrada
      );
      const listado = getPreferSoloClave(userId)
        ? formatearListaClave(rows)
        : formatearLista(rows);
      setLastResults(userId, rows);
      return res.json({
        answer: `Ultimos expedientes dirigidos a tu sector (para entrada):\n${listado}`,
        data: rows,
      });
    }
    if (sectorQuery.includes("expediente") && quiereSalida) {
      const rows = await obtenerUltimosEnMiSector(
        codigosector,
        incluirTodosSalida
      );
      const listado = getPreferSoloClave(userId)
        ? formatearListaClave(rows)
        : formatearLista(rows);
      setLastResults(userId, rows);
      return res.json({
        answer: `Ultimos expedientes en tu sector (para salida):\n${listado}`,
        data: rows,
      });
    }

    if (!process.env.GROQ_API_KEY) {
      const fallback = fallbackParse(message);
      if (fallback.intent === "saludo") {
        return res.json({
          answer:
            "Hola. Podes preguntarme por ultimos expedientes enviados a tu sector, recibidos o la ubicacion de un expediente.",
        });
      }
      if (fallback.intent === "ultimos_dirigidos_a_mi_sector") {
        const rows = await obtenerUltimosPorDestino(
          codigosector,
          incluirTodosEntrada
        );
        const listado = getPreferSoloClave(userId)
          ? formatearListaClave(rows)
          : formatearLista(rows);
        return res.json({
          answer: `Ultimos expedientes dirigidos a tu sector (para entrada):\n${listado}`,
          data: rows,
        });
      }
      if (fallback.intent === "ultimos_en_mi_sector") {
        const rows = await obtenerUltimosEnMiSector(
          codigosector,
          incluirTodosSalida
        );
        const listado = getPreferSoloClave(userId)
          ? formatearListaClave(rows)
          : formatearLista(rows);
        return res.json({
          answer: `Ultimos expedientes en tu sector (para salida):\n${listado}`,
          data: rows,
        });
      }
      if (fallback.intent === "ubicacion_expediente") {
        const { codigo, numero, anio } = fallback;
        const row = await obtenerUltimaUbicacion(codigo, numero, anio);
        if (!row) {
          return res.json({ answer: "No encontre ese expediente." });
        }
        const estadoTexto = row.estado === "E" ? "Entrada" : "Salida";
        return res.json({
          answer: `Ultimo movimiento: ${estadoTexto}. Origen: ${
            row.origen || "N/D"
          }. Destino: ${row.destino || "N/D"}.`,
          data: row,
        });
      }
    if (fallback.intent === "pedir_expediente") {
      return res.json({
        answer:
          "Dale. Pasame el expediente como codigo numero anio (ej: 769 83 2024).",
      });
    }
    if (fallback.intent === "como_registrar_expediente") {
      return res.json({
        answer:
          "Para registrar un expediente: entra en 'Registrar Expedientes x 1 vez', completa Codigo, Numero y Anio (4 digitos), fechas, asunto, iniciador, beneficiario, partida, origen/destino y guarda.",
      });
    }
      if (fallback.intent === "buscar_por_asunto") {
        const limit = parseLimitFromQuestion(message, 10);
        const tema = limpiarTema(fallback.tema);
        if (!tema) {
          return res.json({
            answer:
              "Decime una palabra clave concreta del asunto (ej: teclados).",
          });
        }
        const rows = await buscarPorAsunto(tema, limit);
        const listado = getPreferSoloClave(userId)
          ? formatearListaClave(rows)
          : rows
              .map(
                (row, idx) =>
                  `${idx + 1}. ${row.codigo}-${row.numero}-${row.anio} - ${
                    row.asunto || "Sin asunto"
                  }`
              )
              .join("\n");
        setLastResults(userId, rows);
        return res.json({
          answer: `Ultimos ${rows.length} expedientes con asunto relacionado a "${tema}":\n${listado}`,
          data: rows,
        });
      }
      if (fallback.intent === "buscar_por_asunto_dirigidos") {
        const limit = parseLimitFromQuestion(message, 10);
        const tema = limpiarTema(fallback.tema);
        if (!tema) {
          return res.json({
            answer:
              "Decime una palabra clave concreta del asunto (ej: teclados).",
          });
        }
        const rows = await buscarPorAsuntoDirigidos(
          codigosector,
          incluirTodosEntrada,
          tema,
          limit
        );
        const listado = getPreferSoloClave(userId)
          ? formatearListaClave(rows)
          : formatearLista(rows);
        setLastResults(userId, rows);
        return res.json({
          answer: `Ultimos ${rows.length} expedientes con asunto relacionado a "${tema}" dirigidos a tu sector:\n${listado}`,
          data: rows,
        });
      }
      return res.json({
        answer:
          "No pude interpretar la consulta. Puedo: 1) ultimos expedientes dirigidos a tu sector (entrada), 2) ultimos expedientes en tu sector (salida), 3) ubicacion de un expediente con codigo numero anio, 4) buscar por asunto (ej: 'expedientes sobre teclados'), 5) buscar por asunto dirigidos a tu sector (ej: 'expedientes sobre teclados que van a mi sector'), 6) responder con solo numeros del ultimo listado ('solo numeros').",
      });
    }

    addToConversation(userId, "user", message);

    const tools = [
      {
        type: "function",
        function: {
          name: "ultimos_dirigidos_a_mi_sector",
          description:
            "Devuelve los ultimos expedientes dirigidos al sector del usuario (para entrada).",
          parameters: { type: "object", properties: {} },
        },
      },
      {
        type: "function",
        function: {
          name: "ultimos_en_mi_sector",
          description:
            "Devuelve los ultimos expedientes que estan en el sector del usuario (para salida).",
          parameters: { type: "object", properties: {} },
        },
      },
      {
        type: "function",
        function: {
          name: "ubicacion_expediente",
          description:
            "Devuelve la ubicacion del expediente en base a codigo, numero y anio.",
          parameters: {
            type: "object",
            properties: {
              codigo: { type: "string" },
              numero: { type: "string" },
              anio: { type: "string" },
            },
            required: ["codigo", "numero", "anio"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "buscar_por_asunto",
          description:
            "Busca expedientes por palabras del asunto y devuelve los ultimos resultados.",
          parameters: {
            type: "object",
            properties: {
              tema: { type: "string" },
              limit: { type: "number" },
            },
            required: ["tema"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "buscar_por_asunto_dirigidos",
          description:
            "Busca expedientes con asunto relacionado y dirigidos al sector del usuario (para entrada).",
          parameters: {
            type: "object",
            properties: {
              tema: { type: "string" },
              limit: { type: "number" },
            },
            required: ["tema"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "pedir_aclaracion",
          description:
            "Pide una aclaracion cuando falta informacion (por ejemplo enviados o recibidos).",
          parameters: {
            type: "object",
            properties: {
              pregunta: { type: "string" },
            },
            required: ["pregunta"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "pedir_expediente",
          description:
            "Pide codigo, numero y anio cuando el usuario quiere info de un expediente pero no los proporciona.",
          parameters: {
            type: "object",
            properties: {
              pregunta: { type: "string" },
            },
            required: ["pregunta"],
          },
        },
      },
    ];

    const systemPrompt = `Sos un asistente para expedientes.
Interpreta lenguaje natural y usa las funciones para obtener datos reales.
No muestres etiquetas de funciones ni bloques JSON en la respuesta final.
Si faltan codigo/numero/anio para un expediente, pedi esos datos.
Si el usuario pide "ultimos expedientes" sin especificar, preguntale si son enviados a su sector (para entrada) o en su sector (para salida).
Guia al usuario sobre las funciones del sistema:
- Registrar Expedientes x 1 vez: carga inicial + movimiento de entrada.
- Entrada de Expedientes: registra movimiento E para expedientes dirigidos al sector.
- Salida de Expedientes: registra movimiento S para expedientes en el sector.
- Consulta: ver expediente y movimientos.
- Listado: filtra por fecha, caja, beneficiario o asunto.
- Modificacion: buscar y actualizar campos.
Si el usuario pregunta como cargar un expediente, explica el flujo y los campos clave (codigo, numero, anio 4 digitos, fechas, asunto, iniciador, beneficiario, partida, origen/destino, guardar).
No inventes datos. Responde siempre en espanol.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...getConversation(userId),
    ];

    let result;
    try {
      result = await callGroq(messages, tools);
    } catch (err) {
      const rawMessage = err?.message || "";
      if (err?.status === 429 || rawMessage.includes("rate_limit_exceeded")) {
        return res.status(429).json({
          answer:
            "El asistente esta recibiendo muchas consultas. Espera unos segundos y volve a intentar.",
        });
      }
      throw err;
    }
    const choice = result.choices?.[0];
    const toolCall = choice?.message?.tool_calls?.[0];

    if (!toolCall) {
      const raw = choice?.message?.content || "";
      const tagMatch = raw.match(/<pedir_aclaracion>\s*([\s\S]*?)\s*<\/pedir_aclaracion>/i);
      if (tagMatch) {
        try {
          const parsed = JSON.parse(tagMatch[1]);
          const answer = parsed.pregunta || "Podrias aclarar la consulta?";
          addToConversation(userId, "assistant", answer);
          return res.json({ answer });
        } catch {
          // fall through
        }
      }
      const answer = limpiarSalidaModelo(raw) || "No pude responder.";
      addToConversation(userId, "assistant", answer);
      return res.json({ answer });
    }

    const toolName = toolCall.function.name;
    const toolArgs = JSON.parse(toolCall.function.arguments || "{}");

    if (toolName === "pedir_aclaracion") {
      const answer = toolArgs.pregunta || "Podrias aclarar la consulta?";
      addToConversation(userId, "assistant", answer);
      return res.json({ answer });
    }

    if (toolName === "ultimos_dirigidos_a_mi_sector") {
      const rows = await obtenerUltimosPorDestino(
        codigosector,
        incluirTodosEntrada
      );
      const listado = getPreferSoloClave(userId)
        ? formatearListaClave(rows)
        : formatearLista(rows);
      const answer = `Ultimos expedientes dirigidos a tu sector (para entrada):\n${listado}`;
      addToConversation(userId, "assistant", answer);
      setLastResults(userId, rows);
      return res.json({ answer, data: rows });
    }

    if (toolName === "ultimos_en_mi_sector") {
      const rows = await obtenerUltimosEnMiSector(
        codigosector,
        incluirTodosSalida
      );
      const listado = getPreferSoloClave(userId)
        ? formatearListaClave(rows)
        : formatearLista(rows);
      const answer = `Ultimos expedientes en tu sector (para salida):\n${listado}`;
      addToConversation(userId, "assistant", answer);
      setLastResults(userId, rows);
      return res.json({ answer, data: rows });
    }

    if (toolName === "ubicacion_expediente") {
      const { codigo, numero, anio } = toolArgs;
      const row = await obtenerUltimaUbicacion(codigo, numero, anio);
      if (!row) {
        const answer = "No encontre ese expediente.";
        addToConversation(userId, "assistant", answer);
        return res.json({ answer });
      }
      const estadoTexto = row.estado === "E" ? "Entrada" : "Salida";
      const answer = `Ultimo movimiento: ${estadoTexto}. Origen: ${
        row.origen || "N/D"
      }. Destino: ${row.destino || "N/D"}.`;
      addToConversation(userId, "assistant", answer);
      return res.json({ answer, data: row });
    }
    if (toolName === "pedir_expediente") {
      const answer =
        "Dale. Pasame el expediente como codigo numero anio (ej: 769 83 2024).";
      addToConversation(userId, "assistant", answer);
      return res.json({ answer });
    }
    if (toolName === "buscar_por_asunto") {
      const tema = limpiarTema(toolArgs.tema);
      if (!tema) {
        const answer = "Decime una palabra clave concreta del asunto (ej: teclados).";
        addToConversation(userId, "assistant", answer);
        return res.json({ answer });
      }
      const limit = Math.min(Number(toolArgs.limit) || 10, 50);
      const rows = await buscarPorAsunto(tema, limit);
      const listado = getPreferSoloClave(userId)
        ? formatearListaClave(rows)
        : rows
            .map(
              (row, idx) =>
                `${idx + 1}. ${row.codigo}-${row.numero}-${row.anio} - ${
                  row.asunto || "Sin asunto"
                }`
            )
            .join("\n");
      const answer = `Ultimos ${rows.length} expedientes con asunto relacionado a "${tema}":\n${listado}`;
      addToConversation(userId, "assistant", answer);
      setLastResults(userId, rows);
      return res.json({ answer, data: rows });
    }
    if (toolName === "buscar_por_asunto_dirigidos") {
      const tema = limpiarTema(toolArgs.tema);
      if (!tema) {
        const answer = "Decime una palabra clave concreta del asunto (ej: teclados).";
        addToConversation(userId, "assistant", answer);
        return res.json({ answer });
      }
      const limit = Math.min(Number(toolArgs.limit) || 10, 50);
      const rows = await buscarPorAsuntoDirigidos(
        codigosector,
        incluirTodosEntrada,
        tema,
        limit
      );
      const listado = getPreferSoloClave(userId)
        ? formatearListaClave(rows)
        : formatearLista(rows);
      const answer = `Ultimos ${rows.length} expedientes con asunto relacionado a "${tema}" dirigidos a tu sector:\n${listado}`;
      addToConversation(userId, "assistant", answer);
      setLastResults(userId, rows);
      return res.json({ answer, data: rows });
    }

    return res.json({
      answer:
        "No pude interpretar la consulta. Proba con: 'ultimos expedientes enviados a mi sector' o 'donde esta el expediente 769-34-2025'.",
    });
  } catch (err) {
    next(err);
  }
}
