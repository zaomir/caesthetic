import fs from 'node:fs';
import path from 'node:path';
export const REVIEW_REGISTRY = 'docs/caesthetic/design/review-pages.json';
export function reviewCheckPlacementCount(entry) {
  return entry.packageRole === 'focus_location' ? 0 : 2;
}
export function mergeReviewPages(root, contract) {
  const registryPath = path.join(root, REVIEW_REGISTRY);
  if (!fs.existsSync(registryPath)) return contract;
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  if (registry.schema !== 1 || !Array.isArray(registry.pages)) throw new Error('Invalid review page registry');
  const seenSources = new Set(contract.pages.map(p => p.source));
  const seenRoutes = new Set(contract.pages.map(p => p.route).filter(Boolean));
  const pages = registry.pages.map(p => {
    if (!p || typeof p.route !== 'string' || typeof p.source !== 'string' || p.source !== `site-caesthetic${p.route}index.html` || p.route.includes('..') || !p.route.endsWith('/')) throw new Error('Invalid review source/route mapping');
    if (seenSources.has(p.source) || seenRoutes.has(p.route)) throw new Error('Duplicate review registration');
    if (!contract.profiles.includes(p.profile)) throw new Error('Unknown review profile');
    if (!['manager_review', 'redirect'].includes(p.stage)) throw new Error('Invalid review stage');
    if (p.stage === 'manager_review' && (!p.route.startsWith('/score/') || p.locale !== 'ru' || p.profile !== 'growth-score-client/v6.0.0' || !p.accessGroupId)) throw new Error('Review must use protected Russian v6');
    if (p.stage === 'redirect' && p.profile !== 'redirect') throw new Error('Invalid review redirect');
    if (p.packageRole && !['network_parent','focus_location'].includes(p.packageRole)) throw new Error('Invalid review package role');
    if (p.packageRole === 'focus_location' && !registry.pages.some(parent => parent.route === p.parentRoute && parent.packageRole === 'network_parent' && parent.accessGroupId === p.accessGroupId && parent.case_id === p.case_id)) throw new Error('Focus review requires a parent in the same protected package');
    if (!Array.isArray(p.viewports) || ![320,390,1440].every(w=>p.viewports.includes(w))) throw new Error('Review must cover three viewports');
    seenSources.add(p.source); seenRoutes.add(p.route); return {...p};
  });
  return {...contract, pages: [...contract.pages, ...pages]};
}
