import fs from 'node:fs';
import path from 'node:path';
import {
  exactlyRetiredSelectors,
  retiredSelectorTokens
} from './style-retirement-config.mjs';

const root = process.cwd();
const filePath = (file) => path.join(root, file);
const read = (file) => fs.readFileSync(filePath(file), 'utf8');
const fail = (message) => {
  console.error(`Style architecture validation failed: ${message}`);
  process.exitCode = 1;
};

const designSystem = read('src/design-system.css');
const siteStyles = read('src/styles.css');
const resourceStyles = read('src/styles/resource-profile.css');
const globalChromeStyles = read('src/styles/global-chrome.css');
const indexNavigationStyles = read('src/styles/index-navigation.css');
const measuresStyles = read('src/styles/measures-overview.css');
const timelineStyles = read('src/styles/timeline.css');
const detailPrimitiveStyles = read('src/styles/detail-primitives.css');
const portfolioStyles = read('src/styles/portfolio-overview.css');
const deliverableStyles = read('src/styles/deliverable-detail.css');
const planningDetailStyles = read('src/styles/planning-detail.css');
const projectStyles = read('src/styles/project-overview.css');
const theoryStyles = read('src/styles/theory-of-change.css');
const generatedLegacyStyles = read('src/styles/legacy-public.generated.css');
const legacySourceStyles = read('src/styles/legacy-public-source.css');
const legacyEntry = read('src/styles/legacy-public.css');
const siteEntry = read('src/site-entry.jsx');
const theoryScript = read('src/theory-of-change.js');
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
  if (!designSystem.includes(token)) fail(`src/design-system.css is missing canonical token ${token}`);
  if (siteStyles.includes(token)) fail(`src/styles.css redeclares canonical token ${token}`);
}

if (/:root\s*\{/.test(siteStyles)) {
  fail('src/styles.css must not define :root; shared tokens belong in src/design-system.css');
}

for (const [file, styles] of [
  ['src/design-system.css', designSystem],
  ['src/styles/resource-profile.css', resourceStyles],
  ['src/styles/global-chrome.css', globalChromeStyles],
  ['src/styles/index-navigation.css', indexNavigationStyles],
  ['src/styles/measures-overview.css', measuresStyles],
  ['src/styles/timeline.css', timelineStyles],
  ['src/styles/detail-primitives.css', detailPrimitiveStyles],
  ['src/styles/portfolio-overview.css', portfolioStyles],
  ['src/styles/deliverable-detail.css', deliverableStyles],
  ['src/styles/planning-detail.css', planningDetailStyles],
  ['src/styles/project-overview.css', projectStyles],
  ['src/styles/theory-of-change.css', theoryStyles]
]) {
  if (/\b!important\b/.test(styles)) {
    fail(`${file} must not use !important; retire the conflicting legacy selector instead`);
  }
}

const requiredChromePrimitives = ['.ds-page-actions', '.ds-context-strip'];
for (const selector of requiredChromePrimitives) {
  if (!globalChromeStyles.includes(selector)) {
    fail(`src/styles/global-chrome.css is missing shared chrome primitive ${selector}`);
  }
}

const requiredChromeContracts = [
  'scroll-padding-top: 7rem',
  '.landing-hero::after',
  '.site-footer',
  '.indicative-label'
];
for (const contract of requiredChromeContracts) {
  if (!globalChromeStyles.includes(contract)) {
    fail(`src/styles/global-chrome.css is missing migrated cross-site contract ${contract}`);
  }
}

const requiredIndexPrimitives = ['.ds-filter-strip', '.ds-catalogue-card'];
for (const selector of requiredIndexPrimitives) {
  if (!indexNavigationStyles.includes(selector)) {
    fail(`src/styles/index-navigation.css is missing shared index primitive ${selector}`);
  }
}

const requiredDetailPrimitives = [
  '.ds-editorial-card',
  '.ds-sequence-card',
  '.ds-disclosure',
  '.ds-disclosure-trigger'
];
for (const selector of requiredDetailPrimitives) {
  if (!detailPrimitiveStyles.includes(selector)) {
    fail(`src/styles/detail-primitives.css is missing shared primitive ${selector}`);
  }
}

if (!theoryScript.includes('theory-chain-step ds-sequence-card')) {
  fail('Theory of Change causal chain must consume the shared sequence-card primitive');
}

const obsoleteStyleFiles = [
  'public/resource-profile-spacing.css',
  'public/project-detail-refresh.css',
  'public/timeline-scale-control.css',
  'public/resource-profile-legacy-shim.css',
  'src/styles/post-legacy-cleanup.css',
  'theory-of-change.css'
];
for (const file of obsoleteStyleFiles) {
  if (fs.existsSync(filePath(file))) {
    fail(`obsolete stylesheet ${file} must not be restored`);
  }
}

if (legacySourceStyles.length < 50000) {
  fail('legacy-public-source.css no longer looks like the preserved migration source; do not edit the generated bundle as the source of truth');
}

if (!legacyEntry.includes("@import './legacy-public.generated.css';")) {
  fail('legacy-public.css must remain a stable wrapper around the generated compatibility bundle');
}

if (!generatedLegacyStyles.includes('GENERATED FILE')) {
  fail('legacy-public.generated.css was not prepared from the preserved migration source; run npm run prepare:styles');
}

if (generatedLegacyStyles.length >= legacySourceStyles.length) {
  fail('generated legacy bundle is not smaller than the preserved legacy source');
}

const generatedLegacyBody = generatedLegacyStyles.replace(/^\/\*[\s\S]*?\*\//, '');
for (const selector of retiredSelectorTokens) {
  if (generatedLegacyBody.includes(selector)) {
    fail(`generated legacy bundle still contains retired selector token ${selector}`);
  }
}

for (const selector of exactlyRetiredSelectors) {
  if (selector === '.schema-card h3' && /(^|\})\s*\.schema-card h3\s*\{/m.test(generatedLegacyBody)) {
    fail('generated legacy bundle still contains exact retired selector .schema-card h3');
  }
}

const siteImport = siteEntry.indexOf("import './site.jsx';");
const chromeImport = siteEntry.indexOf("import './styles/global-chrome.css';");
const indexNavigationImport = siteEntry.indexOf("import './styles/index-navigation.css';");
const measuresImport = siteEntry.indexOf("import './styles/measures-overview.css';");
const primitiveImport = siteEntry.indexOf("import './styles/detail-primitives.css';");
const portfolioImport = siteEntry.indexOf("import './styles/portfolio-overview.css';");
const deliverableImport = siteEntry.indexOf("import './styles/deliverable-detail.css';");
const planningDetailImport = siteEntry.indexOf("import './styles/planning-detail.css';");
const projectImport = siteEntry.indexOf("import './styles/project-overview.css';");
const theoryImport = siteEntry.indexOf("import './styles/theory-of-change.css';");
if (
  siteImport < 0 ||
  chromeImport < siteImport ||
  indexNavigationImport < chromeImport ||
  measuresImport < indexNavigationImport ||
  primitiveImport < measuresImport ||
  portfolioImport < primitiveImport ||
  deliverableImport < portfolioImport ||
  planningDetailImport < deliverableImport ||
  projectImport < planningDetailImport ||
  theoryImport < projectImport
) {
  fail('src/site-entry.jsx must load chrome, index, Measures, shared primitives and owned feature styles after src/site.jsx in the documented order');
}

if (siteEntry.includes('post-legacy-cleanup.css')) {
  fail('src/site-entry.jsx must not restore the retired post-legacy cleanup layer');
}

const linkedStylesheets = [...index.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/g)]
  .map((match) => match[1]);
if (linkedStylesheets.length) {
  fail(`index.html must not late-load stylesheets; found ${linkedStylesheets.join(', ')}`);
}

if (!process.exitCode) console.log('Style architecture validation passed');
