import { themeCheckRun } from '@shopify/theme-check-node';
const root = (await import('node:path')).resolve(process.argv[2] || new URL('../theme', import.meta.url).pathname);
const { offenses } = await themeCheckRun(root, undefined, () => {});
const sev = ['error', 'warning', 'info'];
for (const o of offenses.sort((a, b) => a.severity - b.severity)) {
  console.log(`[${sev[o.severity]}] ${o.check} ${o.uri.replace('file://' + root, '')}:${o.start?.line + 1} — ${o.message}`);
}
console.log(`\n${offenses.length} offenses (${offenses.filter(o => o.severity === 0).length} errors)`);
