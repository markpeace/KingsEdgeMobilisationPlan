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
const landingStyles = read('src/styles/landing-overview.css');
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

const residualChromeOwners = [
  ['site header', /(^|\n)\.site-header\s*\{/m],
  ['brand', /(^|\n)\.brand\s*\{/m],
  ['header navigation', /(^|\n)\.site-header nav\s*\{/m],
  ['site footer', /(^|\n)\.site-footer\s*\{/m],
  ['deliverable actions', /(^|\n)\.deliverable-actions\s*\{/m],
  ['print action', /(^|\n)\.print-a3-button\s*\{/m]
];
for (const [label, pattern] of residualChromeOwners) {
  if (pattern.test(siteStyles)) {
    fail(`src/styles.css must not own ${label} presentation; use src/styles/global-chrome.css`);
  }
}

const deadTimelineSelectors = [
  ['unprefixed timeline presentation', /(^|\n)\.timeline(?:-|\s*\{)/m],
  ['unprefixed dependency lens', /(^|\n)\.dependency-lens(?:\b|[.:])/m],
  ['legacy timeline key state', /(^|\n)\.(?:key-box|selected-key|dependency-key|dependent-key|dependency-dot)\b/m]
];
for (const [label, pattern] of deadTimelineSelectors) {
  if (pattern.test(siteStyles)) {
    fail(`src/styles.css contains ${label}; the operational timeline is owned by src/styles/timeline.css`);
  }
}

const residualPortfolioSelectors = [
  ['Projects index presentation', /(^|\n)\.(?:project-grid|project-board|project-scroll|programme-divider|project-column|project-header-link|deliverable-stack|deliverable-card)(?:\b|[.:])/m],
  ['generic Projects owner or lead metadata', /(^|\n)\.(?:owner|lead)\s*(?:,|\{)/m]
];
for (const [label, pattern] of residualPortfolioSelectors) {
  if (pattern.test(siteStyles)) {
    fail(`src/styles.css contains ${label}; the Projects index is owned by src/styles/portfolio-overview.css`);
  }
}

const residualCatalogueSelectors = [
  ['catalogue filter toolbar', /(^|\n)\.toolbar(?:\s|\{|:|,)/m],
  ['catalogue list, row or metadata', /(^|\n)\.(?:index-list|index-row|index-meta)(?:\b|[.:])/m]
];
for (const [label, pattern] of residualCatalogueSelectors) {
  if (pattern.test(siteStyles)) {
    fail(`src/styles.css contains ${label}; Deliverables and Measures catalogue navigation is owned by src/styles/index-navigation.css`);
  }
}

if (/(^|\n)\.depends(?:\b|[.:])/m.test(siteStyles)) {
  fail('src/styles.css must not style the behavioural .depends hook; visible delivery dependency presentation belongs to the canonical delivery sequence');
}

const printMediaIndex = siteStyles.search(/@media\s+print\s*\{/m);
const screenSiteStyles = printMediaIndex >= 0 ? siteStyles.slice(0, printMediaIndex) : siteStyles;
if (/\b!important\b/.test(screenSiteStyles)) {
  fail('src/styles.css must not use !important in screen presentation; print-only isolation is the sole residual exception');
}

for (const [file, styles] of [
  ['src/design-system.css', designSystem],
  ['src/styles/resource-profile.css', resourceStyles],
  ['src/styles/global-chrome.css', globalChromeStyles],
  ['src/styles/landing-overview.css', landingStyles],
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
  '.site-header {',
  '.brand::before',
  '.brand::after',
  `content: "KING'S EDGE"`,
  "content: 'MOBILISATION PLAN'",
  '.site-footer',
  '.deliverable-actions',
  '.print-a3-button',
  '.indicative-label'
];
for (const contract of requiredChromeContracts) {
  if (!globalChromeStyles.includes(contract)) {
    fail(`src/styles/global-chrome.css is missing migrated cross-site contract ${contract}`);
  }
}

const requiredLandingContracts = [
  '.landing-main',
  '.landing-hero::after',
  '.landing-hero h1::after',
  '.landing-hero .landing-links',
  '.landing-links a:first-child'
];
for (const contract of requiredLandingContracts) {
  if (!landingStyles.includes(contract)) {
    fail(`src/styles/landing-overview.css is missing landing contract ${contract}`);
  }
}

const requiredIndexPrimitives = [
  '.ds-filter-strip',
  '.ds-catalogue-card',
  '.toolbar:not(.timeline-toolbar)',
  '.index-list',
  '.deliverable-index-row',
  '.measure-row'
];
for (const selector of requiredIndexPrimitives) {
  if (!indexNavigationStyles.includes(selector)) {
    fail(`src/styles/index-navigation.css is missing shared index primitive ${selector}`);
  }
}

const requiredTimelineContracts = [
  '.ke-timeline-page',
  '.ke-timeline-toolbar',
  '.ke-timeline-dependency-lens',
  '.ke-timeline-table',
  '.ke-timeline-step'
];
for (const selector of requiredTimelineContracts) {
  if (!timelineStyles.includes(selector)) {
    fail(`src/styles/timeline.css is missing canonical timeline contract ${selector}`);
  }
}

const requiredPortfolioContracts = [
  '.project-board',
  '.project-scroll',
  '.project-column {',
  '.project-column-header',
  '.deliverable-stack',
  '.deliverable-card',
  '.programme-divider'
];
for (const selector of requiredPortfolioContracts) {
  if (!portfolioStyles.includes(selector)) {
    fail(`src/styles/portfolio-overview.css is missing canonical Projects index contract ${selector}`);
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
const landingImport = siteEntry.indexOf("import './styles/landing-overview.css';");
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
  landingImport < chromeImport ||
  indexNavigationImport < landingImport ||
  measuresImport < indexNavigationImport ||
  primitiveImport < measuresImport ||
  portfolioImport < primitiveImport ||
  deliverableImport < portfolioImport ||
  planningDetailImport < deliverableImport ||
  projectImport < planningDetailImport ||
  theoryImport < projectImport
) {
  fail('src/site-entry.jsx must load chrome, landing, index, Measures, shared primitives and owned feature styles after src/site.jsx in the documented order');
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
