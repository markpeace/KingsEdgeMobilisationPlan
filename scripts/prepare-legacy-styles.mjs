import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = path.join(root, 'src/styles/legacy-public-source.css');
const outputPath = path.join(root, 'src/styles/legacy-public.css');

const retiredProjectSelectors = [
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

function isRetiredSelector(selector) {
  return retiredProjectSelectors.some((token) => selector.includes(token));
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
        if (nested.css.trim()) {
          output += `${rawPrelude}{${nested.css}}`;
        }
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
const banner = `/* GENERATED FILE. Do not edit directly.\n   Source: src/styles/legacy-public-source.css\n   Retired project selectors: ${retiredProjectSelectors.join(', ')}\n   Removed selector occurrences: ${result.removedSelectors}; fully removed rules: ${result.removedRules}. */\n`;
const generated = `${banner}${result.css}`;

const surviving = retiredProjectSelectors.filter((selector) => result.css.includes(selector));
if (surviving.length) {
  throw new Error(`Retired project selectors survived legacy generation: ${surviving.join(', ')}`);
}
if (result.removedSelectors < 25) {
  throw new Error(`Legacy project retirement removed only ${result.removedSelectors} selector occurrences; expected at least 25. Check source drift.`);
}

fs.writeFileSync(outputPath, generated);
console.log(`Prepared legacy CSS: removed ${result.removedSelectors} project selector occurrences across ${result.removedRules} fully retired rules.`);
