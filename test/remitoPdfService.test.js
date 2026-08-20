import test from "node:test";
import assert from "node:assert/strict";

import {
  crearDocumentoRemito,
  formatearFechaRemito,
  formatearHoraRemito,
  nombreArchivoRemito,
  usuarioPuedeVerRemito,
} from "../src/services/remitoPdfService.js";

test("formatea la fecha y crea un nombre de archivo seguro", () => {
  assert.equal(formatearFechaRemito("2026-08-20T00:00:00.000Z"), "20/08/2026");
  assert.equal(
    formatearFechaRemito(new Date("2026-08-20T00:00:00.000Z")),
    "20/08/2026"
  );
  assert.equal(formatearHoraRemito("2026-08-20T15:34:00.000Z"), "12:34 hs");
  assert.equal(
    nombreArchivoRemito({ codigo: "A/B", numero: 42, anio: 2026 }),
    "remito-A_B-42-2026.pdf"
  );
});

test("limita el remito a los sectores involucrados y usuarios globales", () => {
  const remito = { codigoren: "12", coddestino: "15" };
  assert.equal(usuarioPuedeVerRemito({ nivel: "U", codigosector: "12" }, remito), true);
  assert.equal(usuarioPuedeVerRemito({ nivel: "U", codigosector: "15" }, remito), true);
  assert.equal(usuarioPuedeVerRemito({ nivel: "U", codigosector: "20" }, remito), false);
  assert.equal(usuarioPuedeVerRemito({ nivel: "S", codigosector: "20" }, remito), true);
  assert.equal(usuarioPuedeVerRemito({ nivel: "U", codigosector: "1" }, remito), true);
});

test("genera un remito PDF valido", async () => {
  const documento = crearDocumentoRemito({
    id: 152,
    codigo: "EXP",
    numero: 42,
    anio: 2026,
    fechamov: "2026-08-20",
    fechahora: "2026-08-20T15:34:00.000Z",
    tipo: "Administrativo",
    partida: "123",
    fojas: 18,
    asunto: "Solicitud de prueba",
    iniciador: "Mesa de entradas",
    beneficiario: "Persona beneficiaria",
    cajainterna: "CI-5",
    caja: "A-12",
    usuario: "Usuario de prueba",
    origen: "DIRECCION DE ORIGEN",
    destino: "DIRECCION DE DESTINO",
    motivo: "Para conocimiento y tramite.",
  });
  const partes = [];
  documento.on("data", (parte) => partes.push(parte));
  const terminado = new Promise((resolve, reject) => {
    documento.on("end", resolve);
    documento.on("error", reject);
  });
  documento.end();
  await terminado;

  const pdf = Buffer.concat(partes);
  assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
  assert.ok(pdf.length > 1_000);
});
