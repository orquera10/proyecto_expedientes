import test from "node:test";
import assert from "node:assert/strict";

import { usuarioPuedeDarEntrada } from "../src/services/botEntradaService.js";

test("permite entrada cuando la salida esta dirigida al sector del usuario", () => {
  assert.equal(
    usuarioPuedeDarEntrada(
      { nivel: "U", codigosector: "12" },
      { estado: "S", coddestino: "12" }
    ),
    true
  );
});

test("rechaza entrada de otro sector o de un expediente ya ingresado", () => {
  assert.equal(
    usuarioPuedeDarEntrada(
      { nivel: "U", codigosector: "12" },
      { estado: "S", coddestino: "15" }
    ),
    false
  );
  assert.equal(
    usuarioPuedeDarEntrada(
      { nivel: "U", codigosector: "12" },
      { estado: "E", coddestino: "12" }
    ),
    false
  );
});

test("permite entrada global a supervisores y sector general", () => {
  const movimiento = { estado: "S", coddestino: "15" };
  assert.equal(usuarioPuedeDarEntrada({ nivel: "S", codigosector: "12" }, movimiento), true);
  assert.equal(usuarioPuedeDarEntrada({ nivel: "U", codigosector: "1" }, movimiento), true);
});
