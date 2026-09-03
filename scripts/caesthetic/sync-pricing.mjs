#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const sourcePath = resolve('site-caesthetic/src/config/pricing.ts');
const outputPath = resolve('site-caesthetic/assets/js/caesthetic-pricing.generated.js');
const source = readFileSync(sourcePath, 'utf8');

const readNumber = (name) => {
  const match = source.match(new RegExp(`\\b${name}:\\s*([0-9.]+)`));
  if (!match) throw new Error(`Missing pricing field: ${name}`);
  return Number(match[1]);
};
const usd = (value) => `$${new Intl.NumberFormat('en-US').format(value)}`;
const growthScoreUsd = readNumber('growthScoreUsd');
const leadToRevenueCheckUsd = readNumber('leadToRevenueCheckUsd');
const sprintPriceUsd = readNumber('growthSprintUsd');
const pricing = {
  growthScoreUsd,
  growthScoreLabel: usd(growthScoreUsd),
  leadToRevenueCheckUsd,
  leadToRevenueCheckLabel: usd(leadToRevenueCheckUsd),
  sprintPriceUsd,
  sprintPriceLabel: usd(sprintPriceUsd),
  sprintAfterCheckBalanceUsd: sprintPriceUsd - leadToRevenueCheckUsd,
  sprintAfterCheckBalanceLabel: usd(sprintPriceUsd - leadToRevenueCheckUsd),
  recurringCommercialTerms: 'client_specific',
};

const generated = `/** GENERATED from site-caesthetic/src/config/pricing.ts. Do not edit by hand. */\n`+
  `globalThis.CAESTHETIC_PRICING = Object.freeze(${JSON.stringify(pricing, null, 2)});\n`;
writeFileSync(outputPath, generated);
console.log(`Synced ${outputPath}`);
