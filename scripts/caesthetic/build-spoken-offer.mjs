#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = fs.readFileSync(path.join(root, 'supabase/functions/caesthetic-product-order/spoken-offer.mjs'));
const target = path.join(root, 'site-caesthetic/assets/js/spoken-offer-data.js');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(target) || !source.equals(fs.readFileSync(target))) throw new Error('Spoken commercial terms differ between server and public copy');
} else fs.writeFileSync(target, source);
console.log('Spoken offer server/public parity: PASS');
