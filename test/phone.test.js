import test from "node:test";
import assert from "node:assert/strict";
import { normalizeArgentinePhone } from "../src/utils/phone.js";

test("normaliza telefonos argentinos para WhatsApp", () => {
  for (const value of [
    "388 410-4530",
    "0388 410-4530",
    "+54 9 388 410-4530",
    "5493884104530",
  ]) {
    assert.equal(normalizeArgentinePhone(value), "5493884104530");
  }
});

test("rechaza numeros incompletos", () => {
  assert.equal(normalizeArgentinePhone("1234"), "");
  assert.equal(normalizeArgentinePhone(""), "");
});
