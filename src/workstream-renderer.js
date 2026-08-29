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
  panel.setAttribute('aria-label', 'Workstreams');
  panel.append(element('h2', '', 'Workstreams'));
  panel.append(element('p', 'subtle workstreams-intro', 'Parallel strands that organise this deliverable. They cut across the chronological delivery steps rather than creating a second timeline.'));

  const grid = element('div', 'workstreams-grid');
  workstreamsOf(deliverable).forEach((workstream) => {
    const card = element('article', 'workstream-card');
    const heading = element('div', 'workstream-card-heading');
    heading.append(element('span', 'reference', workstream.id));
    heading.append(element('h3', '', workstream.title));
    card.append(heading);
    if (workstream.owner) card.append(element('p', 'workstream-owner', `Owner: ${workstream.owner}`));
    card.append(element('p', '', workstream.summary));

    const stepTitles = stepTitlesForWorkstream(deliverable, workstream);
    if (stepTitles.length) {
      const route = element('div', 'workstream-route');
      route.append(element('strong', '', 'Delivery route'));
      const list = element('ol', 'workstream-step-list');
      stepTitles.forEach((title) => list.append(element('li', '', title)));
      route.append(list);
      card.append(route);
    }
    grid.append(card);
  });
  panel.append(grid);
  return panel;
}

function renderStepTags(deliverable) {
  const cards = [...document.querySelectorAll('#route-through .steps-list > .step-card')];
  cards.forEach((card, index) => {
    card.querySelector('.workstream-tag-row')?.remove();
    const step = deliverable.steps?.[index];
    const linked = workstreamsForStep(deliverable, step);
    if (!linked.length) return;
    const row = element('div', 'workstream-tag-row');
    row.setAttribute('aria-label', 'Workstreams for this step');
    linked.forEach((workstream) => row.append(element('span', 'workstream-tag', workstream.title)));
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

  const flow = document.querySelector('.deliverable-main-flow');
  const route = document.getElementById('route-through');
  if (!flow || !route) return;

  const existing = document.getElementById('workstreams');
  if (!existing) flow.insertBefore(buildWorkstreamPanel(deliverable), route);
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
