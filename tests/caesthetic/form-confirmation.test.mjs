import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const site = resolve(root, "site-caesthetic");
const confirmation = readFileSync(resolve(site, "assets/js/form-confirmation.js"), "utf8");
const config = readFileSync(resolve(site, "assets/js/caesthetic-config.js"), "utf8");
const shared = readFileSync(resolve(site, "assets/js/caesthetic.js"), "utf8");

test("public form confirmation layer is loaded globally", () => {
  assert.match(config, /\/assets\/js\/form-confirmation\.js/);
});

test("Growth Score and Salon Growth Score expose explicit sent confirmations", () => {
  assert.match(confirmation, /Request sent successfully\./);
  assert.match(confirmation, /Запрос успешно отправлен\./);
  assert.match(confirmation, /Solicitud enviada correctamente\./);
  assert.match(confirmation, /Demande envoyée avec succès\./);
  assert.match(confirmation, /\[data-cae-score-form\] \.cae-form-success/);
  assert.match(confirmation, /\[data-cae-salon-score-form\] \[data-cae-salon-form-success\]/);
});

test("confirmation states are announced accessibly without fabricating success", () => {
  assert.match(confirmation, /setAttribute\("role", "status"\)/);
  assert.match(confirmation, /setAttribute\("aria-live", "polite"\)/);
  assert.match(confirmation, /setAttribute\("aria-atomic", "true"\)/);
  assert.doesNotMatch(confirmation, /hidden\s*=\s*false/);
  assert.doesNotMatch(confirmation, /\.showModal\(/);
  assert.doesNotMatch(confirmation, /fetch\s*\(/);
});

test("shared two-field request modal still requires backend operator notification before success", () => {
  assert.match(shared, /data\.notification_sent !== true/);
  assert.match(shared, /role="status" aria-live="polite"/);
  assert.match(shared, /Request sent\./);
});
