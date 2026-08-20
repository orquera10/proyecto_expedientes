import PDFDocument from "pdfkit";
import { fileURLToPath } from "node:url";

const COLOR_TINTA = "#172126";
const COLOR_VERDE = "#4f9276";
const COLOR_GRIS = "#647077";
const COLOR_BORDE = "#d9dedb";
const COLOR_FONDO = "#f6f7f4";
const LOGO_REMITO = fileURLToPath(
  new URL("../assets/logo-remito.png", import.meta.url)
);

function texto(valor, fallback = "N/D") {
  if (valor === null || valor === undefined || String(valor).trim() === "") {
    return fallback;
  }
  return String(valor).trim();
}

function recortar(valor, maximo) {
  const contenido = texto(valor);
  return contenido.length <= maximo
    ? contenido
    : `${contenido.slice(0, maximo - 1).trim()}…`;
}

export function formatearFechaRemito(valor) {
  if (!valor) return "N/D";
  if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
    const dia = String(valor.getUTCDate()).padStart(2, "0");
    const mes = String(valor.getUTCMonth() + 1).padStart(2, "0");
    return `${dia}/${mes}/${valor.getUTCFullYear()}`;
  }
  const coincidencia = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (coincidencia) {
    return `${coincidencia[3]}/${coincidencia[2]}/${coincidencia[1]}`;
  }
  return texto(valor);
}

export function formatearHoraRemito(valor) {
  if (!valor) return "";
  const fecha = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "";
  const partes = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(fecha);
  const hora = partes.find((parte) => parte.type === "hour")?.value;
  const minuto = partes.find((parte) => parte.type === "minute")?.value;
  return hora && minuto ? `${hora}:${minuto} hs` : "";
}

export function nombreArchivoRemito(datos) {
  const identificador = [datos.codigo, datos.numero, datos.anio]
    .map((parte) => texto(parte, ""))
    .filter(Boolean)
    .join("-")
    .replace(/[^a-zA-Z0-9_-]/g, "_");
  return `remito-${identificador || datos.id || "salida"}.pdf`;
}

export function usuarioPuedeVerRemito(usuario, datos) {
  const codigosector = usuario?.codigosector
    ? String(usuario.codigosector)
    : null;
  if (usuario?.nivel === "S" || codigosector === "1") return true;
  if (!codigosector) return false;
  return [datos?.codigoren, datos?.coddestino].some(
    (codigo) => String(codigo || "") === codigosector
  );
}

function campo(doc, etiqueta, valor, x, y, ancho) {
  doc
    .font("Helvetica-Bold")
    .fontSize(7.5)
    .fillColor(COLOR_GRIS)
    .text(etiqueta.toUpperCase(), x, y, { width: ancho });
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(COLOR_TINTA)
    .text(texto(valor), x, y + 12, { width: ancho, lineBreak: false });
}

function cajaTexto(doc, etiqueta, valor, x, y, ancho, alto, maximo) {
  doc
    .roundedRect(x, y, ancho, alto, 5)
    .fillAndStroke(COLOR_FONDO, COLOR_BORDE);
  doc
    .font("Helvetica-Bold")
    .fontSize(7.5)
    .fillColor(COLOR_GRIS)
    .text(etiqueta.toUpperCase(), x + 10, y + 9, { width: ancho - 20 });
  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(COLOR_TINTA)
    .text(recortar(valor, maximo), x + 10, y + 23, {
      width: ancho - 20,
      height: alto - 29,
      ellipsis: true,
    });
}

function bloqueFirma(doc, titulo, subtitulo, x, y, ancho) {
  doc
    .roundedRect(x, y, ancho, 137, 6)
    .strokeColor(COLOR_BORDE)
    .lineWidth(1)
    .stroke();
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(COLOR_TINTA)
    .text(titulo, x + 12, y + 12, { width: ancho - 24 });
  doc
    .font("Helvetica")
    .fontSize(7.5)
    .fillColor(COLOR_GRIS)
    .text(subtitulo, x + 12, y + 27, { width: ancho - 24 });

  const lineas = [
    ["Firma", 63],
    ["Aclaración", 88],
    ["DNI", 113],
  ];
  for (const [etiqueta, desplazamiento] of lineas) {
    doc
      .moveTo(x + 12, y + desplazamiento)
      .lineTo(x + ancho - 12, y + desplazamiento)
      .strokeColor(COLOR_BORDE)
      .stroke();
    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor(COLOR_GRIS)
      .text(etiqueta, x + 12, y + desplazamiento + 3);
  }
}

export function crearDocumentoRemito(datos) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 42,
    info: {
      Title: `Remito de salida ${texto(datos.codigo, "")}-${texto(datos.numero, "")}-${texto(datos.anio, "")}`,
      Author: "Sistema de Seguimiento Interno de Expedientes",
      Subject: "Constancia de entrega de expediente",
    },
  });

  const izquierda = 42;
  const anchoPagina = doc.page.width - 84;

  doc.roundedRect(izquierda, 42, anchoPagina, 72, 8).fill(COLOR_TINTA);
  doc.roundedRect(izquierda + 10, 48, 64, 60, 5).fill("#ffffff");
  doc.image(LOGO_REMITO, izquierda + 14, 51, {
    fit: [56, 54],
    align: "center",
    valign: "center",
  });
  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor("#ffffff")
    .text("REMITO DE SALIDA", izquierda + 88, 59, { width: 260 });
  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor("#dce5e1")
    .text("SEGUIMIENTO INTERNO DE EXPEDIENTES", izquierda + 88, 84, {
      width: 260,
    });
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#ffffff")
    .text(`N.º ${texto(datos.id)}`, izquierda + anchoPagina - 150, 59, {
      width: 130,
      align: "right",
    });
  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor("#dce5e1")
    .text(formatearFechaRemito(datos.fechamov), izquierda + anchoPagina - 150, 81, {
      width: 130,
      align: "right",
    });
  const horaMovimiento = formatearHoraRemito(datos.fechahora);
  if (horaMovimiento) {
    doc.text(horaMovimiento, izquierda + anchoPagina - 150, 95, {
      width: 130,
      align: "right",
    });
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(COLOR_VERDE)
    .text("EXPEDIENTE", izquierda, 133);
  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor(COLOR_TINTA)
    .text(
      `${texto(datos.codigo)} - ${texto(datos.numero)} - ${texto(datos.anio)}`,
      izquierda,
      148,
      { width: anchoPagina }
    );

  const columna = (anchoPagina - 24) / 3;
  campo(doc, "Tipo", datos.tipo, izquierda, 188, columna);
  campo(doc, "Partida", datos.partida, izquierda + columna + 12, 188, columna);
  campo(doc, "Fojas", datos.fojas, izquierda + (columna + 12) * 2, 188, columna);

  cajaTexto(doc, "Asunto", datos.asunto, izquierda, 226, anchoPagina, 62, 300);

  campo(doc, "Iniciado por", datos.iniciador, izquierda, 306, anchoPagina / 2 - 8);
  campo(
    doc,
    "Beneficiario",
    datos.beneficiario,
    izquierda + anchoPagina / 2 + 8,
    306,
    anchoPagina / 2 - 8
  );
  campo(doc, "Caja interna", datos.cajainterna, izquierda, 348, columna);
  campo(doc, "Caja archivo", datos.caja, izquierda + columna + 12, 348, columna);
  campo(doc, "Registrado por", datos.usuario, izquierda + (columna + 12) * 2, 348, columna);

  cajaTexto(doc, "Origen", datos.origen, izquierda, 391, anchoPagina / 2 - 8, 53, 100);
  cajaTexto(
    doc,
    "Destino",
    datos.destino,
    izquierda + anchoPagina / 2 + 8,
    391,
    anchoPagina / 2 - 8,
    53,
    100
  );
  cajaTexto(doc, "Motivo / observaciones", datos.motivo, izquierda, 458, anchoPagina, 60, 230);

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(COLOR_VERDE)
    .text("CONSTANCIA DE ENTREGA Y RECEPCIÓN", izquierda, 538);

  const anchoFirma = (anchoPagina - 16) / 2;
  bloqueFirma(doc, "ENTREGADO POR", texto(datos.origen), izquierda, 555, anchoFirma);
  bloqueFirma(
    doc,
    "RECIBIDO POR",
    texto(datos.destino),
    izquierda + anchoFirma + 16,
    555,
    anchoFirma
  );

  doc
    .font("Helvetica")
    .fontSize(7.5)
    .fillColor(COLOR_GRIS)
    .text("Fecha y hora de recepción: ____ / ____ / ______    ______ : ______ hs", izquierda, 710, {
      width: anchoPagina - 95,
    });
  doc
    .roundedRect(izquierda + anchoPagina - 82, 697, 82, 45, 4)
    .strokeColor(COLOR_BORDE)
    .stroke();
  doc
    .font("Helvetica")
    .fontSize(7)
    .fillColor(COLOR_GRIS)
    .text("SELLO DEL SECTOR", izquierda + anchoPagina - 77, 715, {
      width: 72,
      align: "center",
    });

  doc
    .moveTo(izquierda, 765)
    .lineTo(izquierda + anchoPagina, 765)
    .strokeColor(COLOR_BORDE)
    .stroke();
  doc
    .font("Helvetica")
    .fontSize(7)
    .fillColor(COLOR_GRIS)
    .text(
      "Este remito acredita la entrega física del expediente al sector de destino. Conservar firmado como constancia.",
      izquierda,
      775,
      { width: anchoPagina, align: "center" }
    );

  return doc;
}
