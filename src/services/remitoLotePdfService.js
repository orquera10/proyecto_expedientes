import PDFDocument from "pdfkit";
import { fileURLToPath } from "node:url";
import {
  formatearFechaRemito,
  formatearHoraRemito,
} from "./remitoPdfService.js";

const LOGO = fileURLToPath(new URL("../assets/logo-remito.png", import.meta.url));
const TINTA = "#172126";
const VERDE = "#4f9276";
const GRIS = "#647077";
const BORDE = "#d9dedb";
const MARGEN = 42;

function texto(valor, fallback = "N/D") {
  const contenido = String(valor ?? "").trim();
  return contenido || fallback;
}

function recortar(valor, maximo) {
  const contenido = texto(valor);
  return contenido.length > maximo
    ? `${contenido.slice(0, maximo - 1).trim()}…`
    : contenido;
}

export function usuarioPuedeVerRemitoLote(usuario, remito) {
  const sector = usuario?.codigosector ? String(usuario.codigosector) : null;
  if (usuario?.nivel === "S" || sector === "1") return true;
  if (!sector) return false;
  return [remito?.codigoren, remito?.coddestino].some(
    (codigo) => String(codigo || "") === sector
  );
}

export function nombreArchivoRemitoLote(remito) {
  return `remito-multiple-${texto(remito.id, "salida")}.pdf`;
}

function encabezado(doc, remito, continuacion = false) {
  const ancho = doc.page.width - MARGEN * 2;
  doc.roundedRect(MARGEN, 36, ancho, 78, 8).fill(TINTA);
  doc.roundedRect(MARGEN + 10, 44, 64, 62, 5).fill("#ffffff");
  doc.image(LOGO, MARGEN + 14, 48, { fit: [56, 54] });
  doc
    .font("Helvetica-Bold")
    .fontSize(17)
    .fillColor("#ffffff")
    .text(continuacion ? "REMITO MÚLTIPLE · CONTINUACIÓN" : "REMITO MÚLTIPLE DE SALIDA", MARGEN + 88, 55, {
      width: 290,
    });
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#dce5e1")
    .text("SEGUIMIENTO INTERNO DE EXPEDIENTES", MARGEN + 88, 83, { width: 280 });
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#ffffff")
    .text(`N.º ${texto(remito.id)}`, MARGEN + ancho - 125, 54, {
      width: 110,
      align: "right",
    });
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#dce5e1")
    .text(formatearFechaRemito(remito.fechamov), MARGEN + ancho - 125, 76, {
      width: 110,
      align: "right",
    })
    .text(formatearHoraRemito(remito.fechahora), MARGEN + ancho - 125, 90, {
      width: 110,
      align: "right",
    });
}

function datosEnvio(doc, remito, y) {
  const ancho = doc.page.width - MARGEN * 2;
  const mitad = (ancho - 12) / 2;
  for (const [etiqueta, valor, x] of [
    ["ORIGEN", remito.origen, MARGEN],
    ["DESTINO", remito.destino, MARGEN + mitad + 12],
  ]) {
    doc.roundedRect(x, y, mitad, 45, 5).fillAndStroke("#f6f7f4", BORDE);
    doc.font("Helvetica-Bold").fontSize(7).fillColor(GRIS).text(etiqueta, x + 9, y + 8);
    doc.font("Helvetica").fontSize(9).fillColor(TINTA).text(texto(valor), x + 9, y + 20, {
      width: mitad - 18,
      height: 18,
      ellipsis: true,
    });
  }
}

function cabeceraTabla(doc, y) {
  const anchos = [28, 112, 70, 245, 52];
  const titulos = ["#", "EXPEDIENTE", "TIPO", "ASUNTO", "FOJAS"];
  let x = MARGEN;
  doc.rect(MARGEN, y, anchos.reduce((a, b) => a + b, 0), 24).fill(TINTA);
  titulos.forEach((titulo, indice) => {
    doc.font("Helvetica-Bold").fontSize(7).fillColor("#ffffff").text(titulo, x + 5, y + 8, {
      width: anchos[indice] - 10,
      align: indice === 0 || indice === 4 ? "center" : "left",
    });
    x += anchos[indice];
  });
  return y + 24;
}

function filaExpediente(doc, expediente, indice, y) {
  const anchos = [28, 112, 70, 245, 52];
  const valores = [
    String(indice + 1),
    `${texto(expediente.codigo)}-${texto(expediente.numero)}/${texto(expediente.anio)}`,
    recortar(expediente.tipo, 18),
    recortar(expediente.asunto, 90),
    texto(expediente.fojas),
  ];
  const alto = 34;
  let x = MARGEN;
  doc.rect(MARGEN, y, anchos.reduce((a, b) => a + b, 0), alto).fillAndStroke(
    indice % 2 === 0 ? "#ffffff" : "#f6f7f4",
    BORDE
  );
  valores.forEach((valor, posicion) => {
    if (posicion > 0) {
      doc.moveTo(x, y).lineTo(x, y + alto).strokeColor(BORDE).stroke();
    }
    doc.font(posicion === 1 ? "Helvetica-Bold" : "Helvetica").fontSize(7.5).fillColor(TINTA).text(
      valor,
      x + 5,
      y + 7,
      {
        width: anchos[posicion] - 10,
        height: alto - 12,
        align: posicion === 0 || posicion === 4 ? "center" : "left",
        ellipsis: true,
      }
    );
    x += anchos[posicion];
  });
  return y + alto;
}

function firmas(doc, remito, y) {
  const ancho = doc.page.width - MARGEN * 2;
  const mitad = (ancho - 16) / 2;
  for (const [titulo, sector, x] of [
    ["ENTREGADO POR", remito.origen, MARGEN],
    ["RECIBIDO POR", remito.destino, MARGEN + mitad + 16],
  ]) {
    doc.roundedRect(x, y, mitad, 112, 5).strokeColor(BORDE).stroke();
    doc.font("Helvetica-Bold").fontSize(9).fillColor(TINTA).text(titulo, x + 10, y + 10);
    doc.font("Helvetica").fontSize(7).fillColor(GRIS).text(texto(sector), x + 10, y + 24, {
      width: mitad - 20,
    });
    for (const [etiqueta, offset] of [["Firma", 57], ["Aclaración / DNI", 83]]) {
      doc.moveTo(x + 10, y + offset).lineTo(x + mitad - 10, y + offset).strokeColor(BORDE).stroke();
      doc.font("Helvetica").fontSize(6.5).fillColor(GRIS).text(etiqueta, x + 10, y + offset + 3);
    }
  }
  doc.font("Helvetica").fontSize(7.5).fillColor(GRIS).text(
    "Fecha y hora de recepción: ____ / ____ / ______    ______ : ______ hs",
    MARGEN,
    y + 126,
    { width: ancho, align: "center" }
  );
}

export function crearDocumentoRemitoLote(remito) {
  const doc = new PDFDocument({ size: "A4", margin: MARGEN, bufferPages: true });
  encabezado(doc, remito);
  datosEnvio(doc, remito, 128);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(VERDE).text(
    `${remito.expedientes.length} EXPEDIENTES INCLUIDOS`,
    MARGEN,
    187
  );
  let y = cabeceraTabla(doc, 202);

  remito.expedientes.forEach((expediente, indice) => {
    if (y + 34 > 690) {
      doc.addPage();
      encabezado(doc, remito, true);
      y = cabeceraTabla(doc, 132);
    }
    y = filaExpediente(doc, expediente, indice, y);
  });

  if (y + 155 > 790) {
    doc.addPage();
    encabezado(doc, remito, true);
    y = 138;
  } else {
    y += 18;
  }
  firmas(doc, remito, y);

  const rango = doc.bufferedPageRange();
  for (let i = 0; i < rango.count; i += 1) {
    doc.switchToPage(rango.start + i);
    doc.font("Helvetica").fontSize(7).fillColor(GRIS).text(
      `Página ${i + 1} de ${rango.count}`,
      MARGEN,
      doc.page.height - 30,
      { width: doc.page.width - MARGEN * 2, align: "right" }
    );
  }
  return doc;
}
