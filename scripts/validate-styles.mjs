import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => {
  console.error(`Style architecture validation failed: ${message}`);
  process.exitCode = 1;
};

const designSystem = read('src/design-system.css');
const siteStyles = read('src/styles.css');
const index = read('index.html');

const canonicalTokens = [
  '--font-brand:',
  '--font-body:',
  '--color-ink:',
  '--color-accent:',
  '--ink:',
  '--accent:',
  '--container:',
  '--page-gutter:'
];

for (const token of canonicalTokens) {
  if (!designSystem.includes(token)) {
    fail(`src/design-system.css is missing canonical token ${token}`);
  }
  if (siteStyles.includes(token)) {
    fail(`src/styles.css redeclares canonical token ${token}`);
  }
}

if (/:root\s*\{/.test(siteStyles)) {
  fail('src/styles.css must not define :root; shared tokens belong in src/design-system.css');
}

if (/\b!important\b/.test(designSystem)) {
  fail('src/design-system.css must not use !important');
}

const allowedLateStylesheets = new Set([
  '/project-detail-refresh.css',
  '/timeline-scale-control.css',
  '/theory-of-change.css',
  '/resource-profile-spacing.css'
]);

const linkedStylesheets = [...index.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/g)]
  .map((match) => match[1]);

for (const href of linkedStylesheets) {
  if (!allowedLateStylesheets.has(href)) {
    fail(`index.html introduces an unregistered late stylesheet: ${href}`);
  }
}

if (!process.exitCode) {
  console.log('Style architecture validation passed');
}
