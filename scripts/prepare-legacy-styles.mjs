import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = path.join(root, 'src/styles/legacy-public-source.css');
const outputPath = path.join(root, 'src/styles/legacy-public.generated.css');

const retiredProjectSelectorTokens = [
  '.project-detail-hero',
  '.related-project-detail-hero',
  '.transformation-claim-panel',
  '.project-deliverable-panel',
  '.project-deliverable-board',
  '.project-deliverable-columns',
  '.project-deliverable-column',
  '.project-deliverable-header',
  '.project-step-stack',
  '.project-step-card'
];

const explicitlyRetiredSelectorTokens = [
  '.detail-hero:not(.project-detail-hero)',
  '.detail-summary',
  '.case-grid',
  '.detail-accordion',
  '.detailed-plan-reveal',
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
  '.measure-summary',
  '.measure-card',
  '.measure-row',
  '.timeline-page',
  '.timeline-controls',
  '.timeline-key',
  '.timeline-refresh',
  '.timeline-modal',
  '#risks-decisions .schema-card'
];

/* These generic selectors conflict with migrated consumers but must not retire
   more-specific schema-card variants that still belong to legacy features. */
const exactlyRetiredSelectors = [
  '.schema-card h3'
];

const retiredSelectorTokens = [
  ...retiredProjectSelectorTokens,
  ...explicitlyRetiredSelectorTokens
];

function semanticPrelude(value) {
  return value.replace(/\/\*[\s\S]*?\*\//g, '').trim();
}

function splitSelectors(value) {
  const selectors = [];
  let start = 0;
  let quote = null;
  let bracketDepth = 0;
  let parenDepth = 0;

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    const next = value[i + 1];

    if (quote) {
      if (char === '\\') {
        i += 1;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === '/' && next === '*') {
      const end = value.indexOf('*/', i + 2);
      i = end === -1 ? value.length : end + 1;
      continue;
    }

    if (char === '[') bracketDepth += 1;
    if (char === ']') bracketDepth = Math.max(0, bracketDepth - 1);
    if (char === '(') parenDepth += 1;
    if (char === ')') parenDepth = Math.max(0, parenDepth - 1);

    if (char === ',' && bracketDepth === 0 && parenDepth === 0) {
      selectors.push(value.slice(start, i).trim());
      start = i + 1;
    }
  }

  selectors.push(value.slice(start).trim());
  return selectors.filter(Boolean);
}

function findBoundary(source, start) {
  let quote = null;
  let inComment = false;

  for (let i = start; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (inComment) {
      if (char === '*' && next === '/') {
        inComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (char === '\\') {
        i += 1;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }

    if (char === '/' && next === '*') {
      inComment = true;
      i += 1;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === '{' || char === ';') return { index: i, char };
  }

  return null;
}

function findClosingBrace(source, openIndex) {
  let depth = 1;
  let quote = null;
  let inComment = false;

  for (let i = openIndex + 1; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (inComment) {
      if (char === '*' && next === '/') {
        inComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (char === '\\') {
        i += 1;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }

    if (char === '/' && next === '*') {
      inComment = true;
      i += 1;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  throw new Error('Unbalanced CSS braces in legacy-public-source.css');
}

function shouldRecurseAtRule(prelude) {
  return /^@(media|supports|container|layer|document)\b/i.test(prelude);
}

function removeNegationArguments(selector) {
  let result = selector;
  let previous;
  do {
    previous = result;
    result = result.replace(/:not\([^()]*\)/g, ':not()');
  } while (result !== previous && /:not\([^()]+\)/.test(result));
  return result;
}

function containsRetiredProjectSelector(selector) {
  const positiveSelector = removeNegationArguments(selector);
  return retiredProjectSelectorTokens.some((token) => positiveSelector.includes(token));
}

function isRetiredSelector(selector) {
  const normalized = selector.trim();
  if (exactlyRetiredSelectors.includes(normalized)) return true;
  if (explicitlyRetiredSelectorTokens.some((token) => selector.includes(token))) return true;
  return containsRetiredProjectSelector(selector);
}

if (containsRetiredProjectSelector('.detail-hero:not(.project-detail-hero)')) {
  throw new Error('Project selector matcher must ignore project classes used only inside :not(...)');
}

function filterCss(source) {
  let output = '';
  let cursor = 0;
  let removedSelectors = 0;
  let removedRules = 0;

  while (cursor < source.length) {
    const boundary = findBoundary(source, cursor);
    if (!boundary) {
      output += source.slice(cursor);
      break;
    }

    if (boundary.char === ';') {
      output += source.slice(cursor, boundary.index + 1);
      cursor = boundary.index + 1;
      continue;
    }

    const closeIndex = findClosingBrace(source, boundary.index);
    const rawPrelude = source.slice(cursor, boundary.index);
    const prelude = semanticPrelude(rawPrelude);
    const body = source.slice(boundary.index + 1, closeIndex);

    if (prelude.startsWith('@')) {
      if (shouldRecurseAtRule(prelude)) {
        const nested = filterCss(body);
        removedSelectors += nested.removedSelectors;
        removedRules += nested.removedRules;
        if (nested.css.trim()) output += `${rawPrelude}{${nested.css}}`;
      } else {
        output += source.slice(cursor, closeIndex + 1);
      }
      cursor = closeIndex + 1;
      continue;
    }

    const selectors = splitSelectors(prelude);
    const retained = selectors.filter((selector) => !isRetiredSelector(selector));
    removedSelectors += selectors.length - retained.length;

    if (retained.length === 0) {
      removedRules += 1;
    } else {
      const leading = rawPrelude.match(/^\s*/)?.[0] || '';
      output += `${leading}${retained.join(',\n')}{${body}}`;
    }

    cursor = closeIndex + 1;
  }

  return { css: output, removedSelectors, removedRules };
}

const source = fs.readFileSync(sourcePath, 'utf8');
const result = filterCss(source);
const banner = `/* GENERATED FILE. Do not edit directly.\n   Source: src/styles/legacy-public-source.css\n   Removed selector occurrences: ${result.removedSelectors}; fully removed rules: ${result.removedRules}. */\n`;
const generated = `${banner}${result.css}`;

const survivingTokens = retiredSelectorTokens.filter((selector) => result.css.includes(selector));
if (survivingTokens.length) {
  throw new Error(`Retired selector tokens survived legacy generation: ${survivingTokens.join(', ')}`);
}

if (/(^|\})\s*\.schema-card h3\s*\{/m.test(result.css)) {
  throw new Error('Exact retired selector .schema-card h3 survived legacy generation');
}

if (result.removedSelectors < 102) {
  throw new Error(`Legacy retirement removed only ${result.removedSelectors} selector occurrences; expected at least 102. Check source drift.`);
}

fs.writeFileSync(outputPath, generated);
console.log(`Prepared legacy CSS: removed ${result.removedSelectors} retired selector occurrences across ${result.removedRules} fully retired rules.`);
