import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../src/data/', import.meta.url));
const baseline = JSON.parse(fs.readFileSync(new URL('../docs/plan-v1-baseline.json', import.meta.url), 'utf8'));
const initialParity = process.argv.includes('--initial-parity');
const errors = [];

for (const [relativePath, originalHash] of Object.entries(baseline.files)) {
  const original = path.join(root, relativePath);
  const copy = path.join(root, 'v2', relativePath);
  for (const [label, file] of [['Version 1', original], ['Version 2', copy]]) {
    if (!fs.existsSync(file) || !fs.statSync(file).isFile() || fs.lstatSync(file).isSymbolicLink()) {
      errors.push(`${label} is missing an independent file: ${relativePath}`);
      continue;
    }
    const hash = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
    if (label === 'Version 1' && hash !== originalHash) errors.push(`Version 1 baseline changed: ${relativePath}`);
    if (initialParity && hash !== originalHash) errors.push(`${label} differs from the initial baseline: ${relativePath}`);
  }
}

if (errors.length) {
  errors.forEach((error) => console.error(error));
  process.exitCode = 1;
} else {
  console.log(`Version 1 baseline intact; ${Object.keys(baseline.files).length} independent Version 2 files present${initialParity ? ' and identical' : ''}.`);
}
