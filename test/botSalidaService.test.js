import test from "node:test";
import assert from "node:assert/strict";

import { usuarioPuedeDarSalida } from "../src/services/botSalidaService.js";

test("permite salida al usuario del sector donde esta el expediente", () => {
  assert.equal(
    usuarioPuedeDarSalida(
      { nivel: "U", codigosector: "12" },
      { estado: "E", coddestino: "12" }
    ),
    true
  );
});

test("rechaza salida si el expediente no esta en el sector del usuario", () => {
  assert.equal(
    usuarioPuedeDarSalida(
      { nivel: "U", codigosector: "12" },
      { estado: "E", coddestino: "15" }
    ),
    false
  );
  assert.equal(
    usuarioPuedeDarSalida(
      { nivel: "U", codigosector: "12" },
      { estado: "S", coddestino: "12" }
    ),
    false
  );
});

test("permite salida global a supervisores y sector general", () => {
  const movimiento = { estado: "E", coddestino: "15" };
  assert.equal(usuarioPuedeDarSalida({ nivel: "S", codigosector: "12" }, movimiento), true);
  assert.equal(usuarioPuedeDarSalida({ nivel: "U", codigosector: "1" }, movimiento), true);
});
