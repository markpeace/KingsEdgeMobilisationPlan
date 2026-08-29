import { buildLookups } from './plan-utils.js';
import { workstreamsForStep, stepTitlesForWorkstream, workstreamsOf } from './workstream-utils.js';
import './styles/workstreams.css';

const { deliverables } = buildLookups();
const deliverableById = new Map(deliverables.map((deliverable) => [deliverable.id, deliverable]));

function currentDeliverable() {
  const match = window.location.hash.match(/^#\/deliverables\/([^/?#]+)/);
  return match ? deliverableById.get(decodeURIComponent(match[1])) : null;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function buildWorkstreamPanel(deliverable) {
  const panel = element('section', 'panel workstreams-panel');
  panel.id = 'workstreams';
  panel.dataset.deliverableId = deliverable.id;
  panel.setAttribute('aria-label', 'Workstreams');

  const heading = element('div', 'workstreams-heading', 'Workstreams');
  heading.setAttribute('role', 'heading');
  heading.setAttribute('aria-level', '2');
  panel.append(heading);
  panel.append(element('p', 'subtle workstreams-intro', 'The parallel strands through which responsibility for this deliverable is organised. They cut across the chronological delivery steps rather than creating a second timeline.'));

  const grid = element('div', 'workstreams-grid');
  workstreamsOf(deliverable).forEach((workstream) => {
    const card = element('article', 'workstream-card');
    const cardHeading = element('div', 'workstream-card-heading');
    cardHeading.append(element('span', 'reference', workstream.id));
    cardHeading.append(element('h3', '', workstream.title));
    card.append(cardHeading);
    if (workstream.owner) card.append(element('p', 'workstream-owner', `Owner: ${workstream.owner}`));
    card.append(element('p', '', workstream.summary));

    const stepTitles = stepTitlesForWorkstream(deliverable, workstream);
    if (stepTitles.length) {
      const route = element('div', 'workstream-route');
      route.append(element('strong', '', `Touches ${stepTitles.length} ${stepTitles.length === 1 ? 'delivery step' : 'delivery steps'}`));
      const list = element('ol', 'workstream-step-list');
      stepTitles.slice(0, 3).forEach((title) => list.append(element('li', '', title)));
      if (stepTitles.length > 3) list.append(element('li', 'workstream-step-more', `+${stepTitles.length - 3} more`));
      route.append(list);
      card.append(route);
    }
    grid.append(card);
  });
  panel.append(grid);
  return panel;
}

function positionWorkstreamPanel(deliverable) {
  const route = document.getElementById('route-through');
  if (!route) return false;

  const benefits = document.getElementById('value-evidence');
  const timelineHeading = route.querySelector(':scope > h2');

  let panel = document.getElementById('workstreams');
  if (panel?.dataset.deliverableId !== deliverable.id) {
    panel.remove();
    panel = null;
  }
  if (!panel) panel = buildWorkstreamPanel(deliverable);

  if (benefits?.parentElement === route) {
    if (panel.parentElement !== route || panel.previousElementSibling !== benefits) {
      benefits.insertAdjacentElement('afterend', panel);
    }
  } else if (timelineHeading) {
    route.insertBefore(panel, timelineHeading);
  } else {
    route.prepend(panel);
  }

  return true;
}

function renderStepTags(deliverable) {
  const cards = [...document.querySelectorAll('#route-through .steps-list > .step-card')];
  cards.forEach((card, index) => {
    const step = deliverable.steps?.[index];
    const linked = workstreamsForStep(deliverable, step);
    const key = linked.map((workstream) => workstream.id).join('|');
    const existing = card.querySelector('.workstream-tag-row');

    if (!linked.length) {
      existing?.remove();
      return;
    }
    if (existing?.dataset.workstreamKey === key) return;
    existing?.remove();

    const row = element('div', 'workstream-tag-row');
    row.dataset.workstreamKey = key;
    row.setAttribute('aria-label', 'Workstreams for this step');
    linked.slice(0, 2).forEach((workstream) => row.append(element('span', 'workstream-tag', workstream.title)));
    if (linked.length > 2) row.append(element('span', 'workstream-tag workstream-tag-more', `+${linked.length - 2} more`));
    const heading = card.querySelector('h3');
    if (heading) card.insertBefore(row, heading);
    else card.prepend(row);
  });
}

function clearWorkstreamUi() {
  document.getElementById('workstreams')?.remove();
  document.querySelectorAll('.workstream-tag-row').forEach((node) => node.remove());
}

function renderWorkstreams() {
  const deliverable = currentDeliverable();
  const workstreams = workstreamsOf(deliverable);
  if (!deliverable || !workstreams.length) {
    clearWorkstreamUi();
    return;
  }

  if (!positionWorkstreamPanel(deliverable)) return;
  renderStepTags(deliverable);
}

let scheduled = false;
function scheduleRender() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    renderWorkstreams();
  });
}

const observer = new MutationObserver(scheduleRender);
observer.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener('hashchange', scheduleRender);

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleRender);
else scheduleRender();
