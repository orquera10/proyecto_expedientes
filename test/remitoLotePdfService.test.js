import test from "node:test";
import assert from "node:assert/strict";
import {
  crearDocumentoRemitoLote,
  nombreArchivoRemitoLote,
  usuarioPuedeVerRemitoLote,
} from "../src/services/remitoLotePdfService.js";

test("controla acceso y nombre del remito multiple", () => {
  const remito = { id: 12, codigoren: "4", coddestino: "9" };
  assert.equal(usuarioPuedeVerRemitoLote({ nivel: "U", codigosector: "4" }, remito), true);
  assert.equal(usuarioPuedeVerRemitoLote({ nivel: "U", codigosector: "9" }, remito), true);
  assert.equal(usuarioPuedeVerRemitoLote({ nivel: "U", codigosector: "7" }, remito), false);
  assert.equal(nombreArchivoRemitoLote(remito), "remito-multiple-12.pdf");
});

test("genera un remito multiple de varias paginas", async () => {
  const remito = {
    id: 12,
    fechamov: "2026-08-20",
    fechahora: "2026-08-20T15:30:00.000Z",
    origen: "SECTOR DE ORIGEN",
    destino: "SECTOR DE DESTINO",
    expedientes: Array.from({ length: 25 }, (_, indice) => ({
      codigo: "769",
      numero: indice + 1,
      anio: 2026,
      tipo: "Administrativo",
      asunto: `Asunto correspondiente al expediente numero ${indice + 1}`,
      fojas: indice + 5,
    })),
  };
  const documento = crearDocumentoRemitoLote(remito);
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
  assert.ok(pdf.length > 10_000);
});
