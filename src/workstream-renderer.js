import { buildLookups, periodLabel } from './plan-utils.js';
import { registeredDeliverableMap } from './data/deliverables/index.js';
import { workstreamsForStep, stepTitlesForWorkstream, workstreamsOf } from './workstream-utils.js';
import './styles/workstreams.css';
import './styles/deliverable-timeline-compact.css';

const { deliverables } = buildLookups();
const normalisedDeliverableMap = new Map(deliverables.map((deliverable) => [deliverable.id, deliverable]));

function currentDeliverableId() {
  const match = String(window.location.hash || '').match(/^#\/deliverables\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function currentDeliverable() {
  const id = currentDeliverableId();
  if (!id) return null;
  const registered = registeredDeliverableMap.get(id);
  const normalised = normalisedDeliverableMap.get(id);
  if (!registered) return normalised || null;
  return { ...normalised, ...registered, project: normalised?.project || registered.project };
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function itemTitle(item, fallback = 'Item') {
  if (typeof item === 'string') return item;
  return item?.title || item?.label || item?.item || item?.role || item?.condition || fallback;
}

function itemDescription(item) {
  if (!item || typeof item === 'string') return '';
  return item.description || item.summary || item.statement || item.contribution || item.rationale || item.notes || item.riskIfMissing || '';
}

function appendItemList(parent, title, items) {
  const values = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!values.length) return;
  const block = element('section', 'delivery-step-detail-group');
  block.append(element('h4', '', title));
  const list = element('ul');
  values.forEach((item) => {
    const li = element('li');
    li.append(element('strong', '', itemTitle(item)));
    const description = itemDescription(item);
    if (description) li.append(element('p', '', description));
    list.append(li);
  });
  block.append(list);
  parent.append(block);
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
  panel.append(element('h2', '', 'Benefits and evidence'));
  panel.append(element('p', 'subtle', 'The value this deliverable is intended to create, and the evidence that will ultimately tell us whether it is being realised.'));

  const grid = element('div', 'main-flow-benefits-grid');
  benefits.forEach((benefit) => {
    const card = element('article', 'main-flow-benefit-card');
    card.append(element('span', 'reference', benefit.id || 'Benefit'));
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

function buildStepDetail(deliverable, step) {
  const resources = step.resources || {};
  const hasDetail = [
    step.outputs,
    resources.existingCapacity,
    resources.newInvestment,
    resources.enablingConditions,
    step.decisions,
    step.risks,
    step.issues,
    step.assumptions
  ].some((items) => Array.isArray(items) && items.length);
  if (!hasDetail) return null;

  const detail = element('details', 'delivery-step-detail');
  detail.append(element('summary', '', 'Step detail'));
  const body = element('div', 'delivery-step-detail-body');
  appendItemList(body, 'Outputs', step.outputs);
  appendItemList(body, 'Existing capacity', resources.existingCapacity);
  appendItemList(body, 'New investment', resources.newInvestment);
  appendItemList(body, 'Enabling conditions', resources.enablingConditions);
  appendItemList(body, 'Decisions', step.decisions);
  appendItemList(body, 'Risks', step.risks);
  appendItemList(body, 'Issues', step.issues);
  appendItemList(body, 'Assumptions', step.assumptions);
  detail.append(body);
  return detail;
}

function buildTimelinePanel(deliverable) {
  const timeline = element('details', 'panel delivery-timeline-shell');
  timeline.id = 'delivery-timeline-main';

  const summary = element('summary', 'delivery-timeline-toggle');
  const copy = element('span', 'delivery-timeline-toggle-copy');
  copy.append(element('strong', '', 'Delivery timeline'));
  copy.append(element('em', '', `${deliverable.steps?.length || 0} chronological stages · open to see the route through this deliverable`));
  summary.append(copy);
  summary.append(element('span', 'delivery-timeline-toggle-action', 'Open'));
  timeline.append(summary);

  const body = element('div', 'delivery-timeline-body');
  body.append(element('p', 'subtle', 'The chronological route through this deliverable. Open an individual step when you need its detailed outputs, resources, decisions, risks or assumptions.'));

  const list = element('div', 'delivery-route-list');
  (deliverable.steps || []).forEach((step, index) => {
    const card = element('article', 'delivery-route-step');
    const meta = element('div', 'delivery-route-step-meta');
    meta.append(element('span', 'delivery-route-step-number', `Step ${String(index + 1).padStart(2, '0')}`));
    meta.append(element('strong', '', periodLabel(step.period)));
    card.append(meta);

    const content = element('div', 'delivery-route-step-content');
    const linked = workstreamsForStep(deliverable, step);
    if (linked.length) {
      const tags = element('div', 'workstream-tag-row');
      linked.slice(0, 2).forEach((workstream) => tags.append(element('span', 'workstream-tag', workstream.title)));
      if (linked.length > 2) tags.append(element('span', 'workstream-tag workstream-tag-more', `+${linked.length - 2} more`));
      content.append(tags);
    }
    content.append(element('h3', '', step.title));
    if (step.summary) content.append(element('p', '', step.summary));
    const detail = buildStepDetail(deliverable, step);
    if (detail) content.append(detail);
    card.append(content);
    list.append(card);
  });

  body.append(list);
  timeline.append(body);
  timeline.addEventListener('toggle', () => {
    const action = timeline.querySelector('.delivery-timeline-toggle-action');
    if (action) action.textContent = timeline.open ? 'Close' : 'Open';
  });
  return timeline;
}

function buildFlow(deliverable) {
  const flow = element('div', 'optional-deliverable-flow');
  flow.id = 'optional-deliverable-flow';
  flow.dataset.deliverableId = deliverable.id;

  const benefits = buildBenefitsPanel(deliverable);
  const workstreams = buildWorkstreamPanel(deliverable);
  if (benefits) flow.append(benefits);
  if (workstreams) flow.append(workstreams);
  flow.append(buildTimelinePanel(deliverable));
  return flow;
}

function clearFlow() {
  document.getElementById('optional-deliverable-flow')?.remove();
  document.querySelector('.route-through-panel')?.classList.remove('prototype-source-route-hidden');
  const sourceValue = document.getElementById('value-evidence');
  if (sourceValue) sourceValue.hidden = false;
}

function renderDeliverableFlow() {
  const deliverable = currentDeliverable();
  const route = document.querySelector('.deliverable-main-flow > .route-through-panel');
  if (!deliverable || !route) {
    clearFlow();
    return;
  }

  route.classList.remove('route-composite-flow', 'compact-delivery-timeline');
  route.classList.add('prototype-source-route-hidden');

  const sourceValue = document.getElementById('value-evidence');
  if (sourceValue && (deliverable.benefits || []).length) sourceValue.hidden = true;

  let flow = document.getElementById('optional-deliverable-flow');
  if (flow?.dataset.deliverableId !== deliverable.id) {
    flow.remove();
    flow = null;
  }
  if (!flow) flow = buildFlow(deliverable);

  if (flow.previousElementSibling !== route) route.insertAdjacentElement('afterend', flow);
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
