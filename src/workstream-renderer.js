import { registeredDeliverableMap } from './data/deliverables/index.js';
import { workstreamsForStep, stepTitlesForWorkstream, workstreamsOf } from './workstream-utils.js';
import './styles/workstreams.css';

function currentDeliverableId() {
  const match = String(window.location.hash || '').match(/^#\/deliverables\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function currentDeliverable() {
  const id = currentDeliverableId();
  return id ? registeredDeliverableMap.get(id) || null : null;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function benefitMeasures(deliverable, benefit) {
  return (deliverable.measures || []).filter((measure) => {
    const linked = measure.supportsBenefits || measure.relatedBenefitIds || [];
    return linked.includes(benefit.id);
  });
}

function buildBenefitsPanel(deliverable) {
  const benefits = deliverable.benefits || [];
  if (!benefits.length) return null;

  const panel = element('section', 'panel main-flow-benefits-panel');
  panel.id = 'benefits-evidence-main';
  panel.dataset.deliverableId = deliverable.id;
  panel.append(element('h2', '', 'Benefits and evidence'));
  panel.append(element('p', 'subtle', 'The value this deliverable is intended to create, with the evidence that will ultimately tell us whether it is being realised.'));

  const grid = element('div', 'main-flow-benefits-grid');
  benefits.forEach((benefit) => {
    const card = element('article', 'main-flow-benefit-card');
    const label = element('span', 'reference', benefit.id || 'Benefit');
    card.append(label);
    card.append(element('h3', '', benefit.title || 'Benefit'));
    if (benefit.statement) card.append(element('p', 'main-flow-benefit-statement', benefit.statement));
    if (benefit.successLooksLike) {
      const success = element('div', 'main-flow-benefit-success');
      success.append(element('strong', '', 'Success means'));
      success.append(element('p', '', benefit.successLooksLike));
      card.append(success);
    }

    const measures = benefitMeasures(deliverable, benefit);
    if (measures.length) {
      const evidence = element('div', 'main-flow-benefit-evidence');
      evidence.append(element('strong', '', `Evidence · ${measures.length} ${measures.length === 1 ? 'measure' : 'measures'}`));
      const list = element('ul');
      measures.forEach((measure) => list.append(element('li', '', measure.title || measure.measure || 'Measure')));
      evidence.append(list);
      card.append(evidence);
    }
    grid.append(card);
  });

  panel.append(grid);
  return panel;
}

function buildWorkstreamPanel(deliverable) {
  const workstreams = workstreamsOf(deliverable);
  if (!workstreams.length) return null;

  const panel = element('section', 'panel workstreams-panel');
  panel.id = 'workstreams';
  panel.dataset.deliverableId = deliverable.id;
  panel.setAttribute('aria-label', 'Workstreams');
  panel.append(element('h2', '', 'Workstreams'));
  panel.append(element('p', 'subtle workstreams-intro', 'The parallel strands through which responsibility for this deliverable is organised. They cut across the chronological delivery steps rather than creating a second timeline.'));

  const grid = element('div', 'workstreams-grid');
  workstreams.forEach((workstream) => {
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
      route.append(element('strong', '', `Across ${stepTitles.length} ${stepTitles.length === 1 ? 'delivery stage' : 'delivery stages'}`));
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

function ensureTimelineShell(route, deliverable) {
  let shell = route.querySelector(':scope > .delivery-timeline-shell');
  if (!shell) {
    shell = element('section', 'panel delivery-timeline-shell timeline-collapsed');
    shell.dataset.deliverableId = deliverable.id;

    const toggle = element('button', 'delivery-timeline-toggle');
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    const titleGroup = element('span', 'delivery-timeline-toggle-copy');
    titleGroup.append(element('strong', '', 'Delivery timeline'));
    titleGroup.append(element('em', '', `${deliverable.steps?.length || 0} chronological stages · open to see the route through this deliverable`));
    toggle.append(titleGroup);
    toggle.append(element('span', 'delivery-timeline-toggle-action', 'Show'));
    toggle.addEventListener('click', () => {
      const collapsed = shell.classList.toggle('timeline-collapsed');
      toggle.setAttribute('aria-expanded', String(!collapsed));
      const action = toggle.querySelector('.delivery-timeline-toggle-action');
      if (action) action.textContent = collapsed ? 'Show' : 'Hide';
    });

    const body = element('div', 'delivery-timeline-body');
    shell.append(toggle, body);
    route.append(shell);
  }

  const body = shell.querySelector('.delivery-timeline-body');
  const heading = [...route.children].find((child) => child.matches?.('h2'));
  const intro = [...route.children].find((child) => child.matches?.('p.subtle'));
  const steps = [...route.children].find((child) => child.matches?.('.steps-list'));
  if (heading) heading.remove();
  if (intro && intro.parentElement === route) body.append(intro);
  if (steps && steps.parentElement === route) body.append(steps);

  return shell;
}

function renderStepTags(deliverable, route) {
  const cards = [...route.querySelectorAll('.steps-list > .step-card')];
  cards.forEach((card, index) => {
    const step = deliverable.steps?.[index];
    const linked = workstreamsForStep(deliverable, step);
    const existing = card.querySelector('.workstream-tag-row');
    if (!linked.length) {
      existing?.remove();
      return;
    }

    const key = linked.map((workstream) => workstream.id).join('|');
    if (existing?.dataset.workstreamKey === key) return;
    existing?.remove();

    const row = element('div', 'workstream-tag-row');
    row.dataset.workstreamKey = key;
    linked.slice(0, 2).forEach((workstream) => row.append(element('span', 'workstream-tag', workstream.title)));
    if (linked.length > 2) row.append(element('span', 'workstream-tag workstream-tag-more', `+${linked.length - 2} more`));
    const heading = card.querySelector('h3');
    if (heading) card.insertBefore(row, heading);
    else card.prepend(row);
  });
}

function clearPrototypeUi() {
  document.getElementById('benefits-evidence-main')?.remove();
  document.getElementById('workstreams')?.remove();
  document.querySelectorAll('.workstream-tag-row').forEach((node) => node.remove());
}

function renderDeliverableFlow() {
  const deliverable = currentDeliverable();
  const route = document.getElementById('route-through');
  if (!deliverable || !route) {
    clearPrototypeUi();
    return;
  }

  route.classList.add('route-composite-flow');

  const sourceValue = document.getElementById('value-evidence');
  if (sourceValue) sourceValue.hidden = true;

  let benefits = document.getElementById('benefits-evidence-main');
  if (benefits?.dataset.deliverableId !== deliverable.id) {
    benefits.remove();
    benefits = null;
  }
  if (!benefits) benefits = buildBenefitsPanel(deliverable);

  let workstreams = document.getElementById('workstreams');
  if (workstreams?.dataset.deliverableId !== deliverable.id) {
    workstreams.remove();
    workstreams = null;
  }
  if (!workstreams) workstreams = buildWorkstreamPanel(deliverable);

  const shell = ensureTimelineShell(route, deliverable);

  if (benefits && benefits.parentElement !== route) route.insertBefore(benefits, shell);
  if (workstreams && workstreams.parentElement !== route) route.insertBefore(workstreams, shell);
  if (benefits && workstreams && benefits.nextElementSibling !== workstreams) route.insertBefore(benefits, workstreams);
  if (workstreams && workstreams.nextElementSibling !== shell) route.insertBefore(workstreams, shell);
  if (!workstreams && benefits && benefits.nextElementSibling !== shell) route.insertBefore(benefits, shell);

  renderStepTags(deliverable, route);
}

let scheduled = false;
function scheduleRender() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    renderDeliverableFlow();
  });
}

const observer = new MutationObserver(scheduleRender);
observer.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener('hashchange', scheduleRender);

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleRender);
else scheduleRender();
