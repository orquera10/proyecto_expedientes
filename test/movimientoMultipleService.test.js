import test from "node:test";
import assert from "node:assert/strict";
import {
  MovimientoMultipleError,
  normalizarExpedientesMultiples,
} from "../src/services/movimientoMultipleService.js";

test("normaliza y ordena una seleccion multiple", () => {
  const resultado = normalizarExpedientesMultiples([
    { codigo: "769", numero: "20", anio: "2026" },
    { codigo: "1063", numero: 3, anio: 2025 },
  ]);
  assert.deepEqual(resultado, [
    { codigo: "1063", numero: 3, anio: 2025 },
    { codigo: "769", numero: 20, anio: 2026 },
  ]);
});

test("rechaza lotes de uno y expedientes repetidos", () => {
  assert.throws(
    () => normalizarExpedientesMultiples([{ codigo: "769", numero: 1, anio: 2026 }]),
    MovimientoMultipleError
  );
  assert.throws(
    () =>
      normalizarExpedientesMultiples([
        { codigo: "769", numero: 1, anio: 2026 },
        { codigo: "769", numero: 1, anio: 2026 },
      ]),
    /repetidos/
  );
});
