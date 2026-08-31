import fs from 'node:fs';
import path from 'node:path';

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
const detailPrimitiveStyles = read('src/styles/detail-primitives.css');
const portfolioStyles = read('src/styles/portfolio-overview.css');
const deliverableStyles = read('src/styles/deliverable-detail.css');
const planningDetailStyles = read('src/styles/planning-detail.css');
const projectStyles = read('src/styles/project-overview.css');
const postLegacyStyles = read('src/styles/post-legacy-cleanup.css');
const generatedLegacyStyles = read('src/styles/legacy-public.generated.css');
const legacySourceStyles = read('src/styles/legacy-public-source.css');
const legacyEntry = read('src/styles/legacy-public.css');
const resourceShim = read('public/resource-profile-legacy-shim.css');
const siteEntry = read('src/site-entry.jsx');
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
  ['src/styles/detail-primitives.css', detailPrimitiveStyles],
  ['src/styles/portfolio-overview.css', portfolioStyles],
  ['src/styles/deliverable-detail.css', deliverableStyles],
  ['src/styles/planning-detail.css', planningDetailStyles],
  ['src/styles/project-overview.css', projectStyles]
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

if (fs.existsSync(filePath('public/resource-profile-spacing.css'))) {
  fail('obsolete public/resource-profile-spacing.css must not be restored');
}

if (fs.existsSync(filePath('public/project-detail-refresh.css'))) {
  fail('obsolete public/project-detail-refresh.css must not be restored; project presentation belongs in src/styles/project-overview.css');
}

const resourceShimImportantCount = (resourceShim.match(/!important/g) || []).length;
if (resourceShimImportantCount > 3) {
  fail(`resource legacy shim has grown to ${resourceShimImportantCount} !important declarations; retire legacy rules instead`);
}

if (resourceShim.length > 1200) {
  fail('resource legacy shim has grown beyond its compatibility-only budget');
}

const postLegacyImportantCount = (postLegacyStyles.match(/!important/g) || []).length;
if (postLegacyImportantCount > 3) {
  fail(`post-legacy cleanup has grown to ${postLegacyImportantCount} !important declarations; move presentation into its owning stylesheet`);
}

if (postLegacyStyles.length > 1800) {
  fail('post-legacy cleanup has grown beyond its narrow compatibility budget');
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

const retiredSelectorTokens = [
  '.project-detail-hero',
  '.related-project-detail-hero',
  '.transformation-claim-panel',
  '.project-deliverable-panel',
  '.project-deliverable-board',
  '.project-deliverable-columns',
  '.project-deliverable-column',
  '.project-deliverable-header',
  '.project-step-stack',
  '.project-step-card',
  '.detail-hero:not(.project-detail-hero)',
  '.detail-summary',
  '.case-grid',
  '.detail-accordion',
  '.route-through-panel',
  '.step-card',
  '.step-card-story',
  '.step-story-block',
  '.step-detail-toggle',
  '.value-evidence-refined',
  '.benefit-',
  '.unmapped-evidence-block',
  '.site-header',
  '.planning-notice',
  '.governance-',
  '.decision-log-',
  '.raid-grid',
  '.raid-column',
  '#risks-decisions .schema-card'
];
const generatedLegacyBody = generatedLegacyStyles.replace(/^\/\*[\s\S]*?\*\//, '');
for (const selector of retiredSelectorTokens) {
  if (generatedLegacyBody.includes(selector)) {
    fail(`generated legacy bundle still contains retired selector token ${selector}`);
  }
}

if (/(^|\})\s*\.schema-card h3\s*\{/m.test(generatedLegacyBody)) {
  fail('generated legacy bundle still contains exact retired selector .schema-card h3');
}

const siteImport = siteEntry.indexOf("import './site.jsx';");
const chromeImport = siteEntry.indexOf("import './styles/global-chrome.css';");
const indexNavigationImport = siteEntry.indexOf("import './styles/index-navigation.css';");
const primitiveImport = siteEntry.indexOf("import './styles/detail-primitives.css';");
const portfolioImport = siteEntry.indexOf("import './styles/portfolio-overview.css';");
const deliverableImport = siteEntry.indexOf("import './styles/deliverable-detail.css';");
const planningDetailImport = siteEntry.indexOf("import './styles/planning-detail.css';");
const projectImport = siteEntry.indexOf("import './styles/project-overview.css';");
const cleanupImport = siteEntry.indexOf("import './styles/post-legacy-cleanup.css';");
if (
  siteImport < 0 ||
  chromeImport < siteImport ||
  indexNavigationImport < chromeImport ||
  primitiveImport < indexNavigationImport ||
  portfolioImport < primitiveImport ||
  deliverableImport < portfolioImport ||
  planningDetailImport < deliverableImport ||
  projectImport < planningDetailImport ||
  cleanupImport < projectImport
) {
  fail('src/site-entry.jsx must load chrome, index, shared primitives and owned feature styles after src/site.jsx in the documented order');
}

const allowedLateStylesheets = new Set([
  '/timeline-scale-control.css',
  '/theory-of-change.css',
  '/resource-profile-legacy-shim.css'
]);

const linkedStylesheets = [...index.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/g)]
  .map((match) => match[1]);

for (const href of linkedStylesheets) {
  if (!allowedLateStylesheets.has(href)) {
    fail(`index.html introduces an unregistered late stylesheet: ${href}`);
  }
}

if (!process.exitCode) console.log('Style architecture validation passed');
