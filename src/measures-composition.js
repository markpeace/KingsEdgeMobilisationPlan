import { projects } from './plan-utils.js';

/*
 * Semantic composition for the Measures index.
 *
 * The underlying MeasuresView remains the source of filtering, routing and
 * rendered result rows. This module only enriches the internal anatomy of an
 * already-rendered measure card so that the shared catalogue shell can express
 * measure-specific meaning without duplicating the index component.
 */

const displayId = (item) => item?.displayId || item?.id || '';

const measureLookup = new Map();
for (const project of projects) {
  for (const deliverable of project.deliverables || []) {
    for (const measure of deliverable.measures || []) {
      measureLookup.set(`${deliverable.id}::${measure.title}`, {
        project,
        deliverable,
        measure
      });
    }
  }
}

const metricLabels = [
  'Measures in scope',
  'Projects represented',
  'Deliverables represented'
];

function appendEvidenceLine(container, label, value, className = '') {
  if (!value) return;
  const line = document.createElement('span');
  line.className = `measure-evidence-line ${className}`.trim();

  const heading = document.createElement('strong');
  heading.textContent = label;
  line.appendChild(heading);

  const text = document.createElement('span');
  text.textContent = value;
  line.appendChild(text);

  container.appendChild(line);
}

function appendEvidenceFacts(container, measure) {
  const facts = [
    ['Target', measure.target],
    ['Baseline', measure.baseline],
    ['Source', measure.dataSource]
  ].filter(([, value]) => value);

  if (!facts.length) return;

  const factList = document.createElement('span');
  factList.className = 'measure-evidence-facts';

  for (const [label, value] of facts) {
    const fact = document.createElement('span');
    fact.className = 'measure-evidence-fact';

    const heading = document.createElement('strong');
    heading.textContent = label;
    fact.appendChild(heading);

    const text = document.createElement('span');
    text.textContent = value;
    fact.appendChild(text);

    factList.appendChild(fact);
  }

  container.appendChild(factList);
}

function rowEntry(row) {
  const heading = row.querySelector('h3');
  if (!heading) return null;

  const href = row.getAttribute('href') || '';
  const deliverableId = decodeURIComponent(href.split('/').filter(Boolean).pop() || '');
  return measureLookup.get(`${deliverableId}::${heading.textContent.trim()}`) || null;
}

function enhanceContext(row, entry) {
  const context = row.querySelector('.deliverable-context-line');
  const projectContext = context?.querySelector('.project-context');
  if (!projectContext) return;

  const projectLabel = `Project ${displayId(entry.project)} ${entry.project.title}`;
  const deliverableTitle = entry.deliverable.title;

  if (projectContext.textContent !== deliverableTitle) {
    projectContext.textContent = deliverableTitle;
  }
  if (projectContext.dataset.project !== projectLabel) {
    projectContext.dataset.project = projectLabel;
  }
  projectContext.setAttribute('aria-label', `${deliverableTitle}. ${projectLabel}`);
}

function enhanceEvidence(row, entry) {
  const heading = row.querySelector('h3');
  const body = heading?.nextElementSibling;
  if (!body || body.tagName !== 'P') return;

  const alreadyStructured = body.querySelector('.measure-evidence-line');
  if (alreadyStructured) return;

  body.classList.add('measure-evidence-summary');
  body.replaceChildren();

  appendEvidenceLine(body, 'Question', entry.measure.questionAnswered, 'measure-question');
  appendEvidenceLine(body, 'Evidence', entry.measure.measure, 'measure-definition');
  appendEvidenceFacts(body, entry.measure);
}

function enhanceFooter(row, entry) {
  const confidence = row.querySelector('.index-meta span');
  if (!confidence) return;

  const label = `Confidence: ${entry.measure.confidence || 'TBC'}`;
  if (confidence.textContent !== label) confidence.textContent = label;
}

function enhanceMetricLabels(main) {
  main.querySelectorAll('.measure-summary .measure-card strong').forEach((label, index) => {
    if (metricLabels[index] && label.textContent !== metricLabels[index]) {
      label.textContent = metricLabels[index];
    }
  });
}

function enhanceMeasuresPage() {
  if (!window.location.hash.startsWith('#/measures')) return;

  const main = document.querySelector('main');
  if (!main) return;

  enhanceMetricLabels(main);

  for (const row of main.querySelectorAll('.measure-row')) {
    const entry = rowEntry(row);
    if (!entry) continue;
    enhanceContext(row, entry);
    enhanceEvidence(row, entry);
    enhanceFooter(row, entry);
  }
}

let scheduled = false;
function scheduleEnhancement() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    enhanceMeasuresPage();
  });
}

function start() {
  const root = document.getElementById('root') || document.body;
  const observer = new MutationObserver(scheduleEnhancement);
  observer.observe(root, { childList: true, subtree: true });
  window.addEventListener('hashchange', scheduleEnhancement);
  scheduleEnhancement();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
