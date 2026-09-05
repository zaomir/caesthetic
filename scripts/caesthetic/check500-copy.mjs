/** Versioned US-English copy opt-in; frozen reports keep their existing copy lock. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const CHECK500_US_COPY = 'check500-section/en-US/1.1.0';
export function check500USCopy() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const source = fs.readFileSync(path.join(root, 'docs/ssot/CAESTHETIC_LEAD_TO_REVENUE_CHECK.md'), 'utf8');
  const match = source.match(/<!-- check500-us-1\.1:start -->\s*```json\s*([\s\S]+?)\s*```\s*<!-- check500-us-1\.1:end -->/);
  if (!match) throw new Error('CHECK500_COPY_INVALID: missing approved US copy contract');
  const copy = JSON.parse(match[1]);
  if (copy.copy_contract !== CHECK500_US_COPY || ['title','product_line','body','cta','fine_print'].some(k => typeof copy[k] !== 'string' || !copy[k].trim())) throw new Error('CHECK500_COPY_INVALID: incomplete US copy');
  return Object.freeze(copy);
}
