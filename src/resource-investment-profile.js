import { buildLookups, getStepPeriodSpan, periodLabel, projects } from './plan-utils.js';

const { deliverables } = buildLookups(projects);
const deliverableById = new Map(deliverables.map((deliverable) => [deliverable.id, deliverable]));
const projectById = new Map(projects.map((project) => [project.id, project]));

function currentDeliverableId() {
  const match = String(window.location.hash || '').match(/#\/deliverables\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function currentProjectId() {
  const match = String(window.location.hash || '').match(/#\/projects\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatMoney(amount, currency = 'GBP') {
  if (typeof amount !== 'number') return '';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

function stepLabel(index) {
  return `Step ${String(index + 1).padStart(2, '0')}`;
}

function resourceGroups(step) {
  return [
    {
      key: 'existing-capacity',
      label: 'Existing capacity to align',
      items: step.resources?.existingCapacity || []
    },
    {
      key: 'new-investment',
      label: 'New investment',
      items: step.resources?.newInvestment || []
    },
    {
      key: 'enabling-condition',
      label: 'Enabling conditions',
      items: step.resources?.enablingConditions || []
    }
  ].filter((group) => group.items.length);
}

function stepAskCount(step) {
  return resourceGroups(step).reduce((total, group) => total + group.items.length, 0);
}

function periodForAsk(ask, step) {
  const period = ask.periodNeeded || step.period;
  return periodLabel(period);
}

function askDescription(ask) {
  return ask.rationale || ask.contribution || ask.whatItUnlocks || ask.notes || '';
}

function renderAsk(ask, step) {
  const cost = formatMoney(ask.amount, ask.currency || 'GBP') || ask.estimatedCost || ask.additionalCost || '';
  const meta = [
    cost,
    ask.owner && `Owner: ${ask.owner}`,
    ask.decisionNeededBy && `Decision by: ${ask.decisionNeededBy}`,
    ask.confidence && `Confidence: ${ask.confidence}`
  ].filter(Boolean);

  return `
    <article class="resource-ask-card resource-ask-${escapeHtml(ask.askType || 'item')}">
      <div class="resource-ask-heading">
        <strong>${escapeHtml(ask.label || ask.role || ask.item || ask.condition || 'Resource ask')}</strong>
        <span>${escapeHtml(periodForAsk(ask, step))}</span>
      </div>
      ${askDescription(ask) ? `<p>${escapeHtml(askDescription(ask))}</p>` : ''}
      ${meta.length ? `<p class="resource-ask-meta">${meta.map(escapeHtml).join(' · ')}</p>` : ''}
      ${ask.riskIfMissing ? `<p class="resource-ask-risk"><strong>If missing:</strong> ${escapeHtml(ask.riskIfMissing)}</p>` : ''}
    </article>
  `;
}

function renderResourceGroup(group, step) {
  return `
    <section class="resource-ask-group resource-ask-group-${escapeHtml(group.key)}">
      <h4>${escapeHtml(group.label)}</h4>
      <div class="resource-ask-list">
        ${group.items.map((ask) => renderAsk(ask, step)).join('')}
      </div>
    </section>
  `;
}

function renderStepResources(step, index, contextLabel = '') {
  const groups = resourceGroups(step);
  const askCount = groups.reduce((total, group) => total + group.items.length, 0);
  const countLabel = `${askCount} ${askCount === 1 ? 'ask' : 'asks'}`;
  const label = [contextLabel, stepLabel(index)].filter(Boolean).join(' · ');

  return `
    <details class="resource-step-group">
      <summary>
        <span class="resource-step-period">${escapeHtml(periodLabel(step.period))}</span>
        <span class="resource-step-title"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(step.title)}</span></span>
        <span class="resource-step-count">${escapeHtml(countLabel)}</span>
      </summary>
      <div class="resource-step-body">
        ${groups.map((group) => renderResourceGroup(group, step)).join('')}
      </div>
    </details>
  `;
}

function resourceSummary(steps) {
  const asks = steps.flatMap((step) => resourceGroups(step).flatMap((group) => group.items));
  const investmentAsks = asks.filter((ask) => ask.askType === 'new-investment');
  const enablingConditions = asks.filter((ask) => ask.askType === 'enabling-condition');
  const capacityAsks = asks.filter((ask) => ask.askType === 'existing-capacity');
  const knownInvestment = investmentAsks.reduce((total, ask) => total + (typeof ask.amount === 'number' ? ask.amount : 0), 0);

  return {
    total: asks.length,
    steps: steps.length,
    investmentAsks: investmentAsks.length,
    enablingConditions: enablingConditions.length,
    capacityAsks: capacityAsks.length,
    knownInvestment
  };
}

function signatureForDeliverable(deliverable) {
  return JSON.stringify((deliverable.steps || []).map((step) => ({
    id: step.id,
    title: step.title,
    period: step.period,
    resources: step.resources
  })));
}

function createDeliverableProfile(deliverable) {
  const steps = (deliverable.steps || [])
    .map((step, sourceIndex) => ({ step, sourceIndex, span: getStepPeriodSpan(step.period) }))
    .filter(({ step }) => stepAskCount(step) > 0)
    .sort((a, b) => a.span.startIndex - b.span.startIndex || a.sourceIndex - b.sourceIndex);

  if (!steps.length) return null;

  const summary = resourceSummary(steps.map(({ step }) => step));
  const knownInvestment = summary.knownInvestment ? formatMoney(summary.knownInvestment) : 'No quantified total yet';
  const profile = document.createElement('details');
  profile.id = 'resource-investment-profile';
  profile.className = 'panel resource-investment-profile';
  profile.dataset.resourceProfileSignature = signatureForDeliverable(deliverable);
  profile.innerHTML = `
    <summary class="resource-profile-summary">
      <span class="resource-profile-heading">
        <strong>Resource and investment profile</strong>
        <em>Derived from the asks attached to each delivery step.</em>
      </span>
      <span class="resource-profile-toggle" aria-hidden="true"></span>
    </summary>
    <div class="resource-profile-body">
      <p class="subtle resource-profile-explainer">The timeline remains the source of truth. This roll-up sequences when capacity, investment and enabling conditions are needed, without creating a second resource plan.</p>
      <div class="resource-profile-summary-grid">
        <article><strong>${escapeHtml(summary.steps)}</strong><span>Steps with asks</span></article>
        <article><strong>${escapeHtml(summary.capacityAsks)}</strong><span>Capacity asks</span></article>
        <article><strong>${escapeHtml(summary.investmentAsks)}</strong><span>Investment asks</span></article>
        <article><strong>${escapeHtml(knownInvestment)}</strong><span>Known investment</span></article>
        <article><strong>${escapeHtml(summary.enablingConditions)}</strong><span>Enabling conditions</span></article>
      </div>
      <div class="resource-step-sequence">
        ${steps.map(({ step, sourceIndex }) => renderStepResources(step, sourceIndex)).join('')}
      </div>
    </div>
  `;
  return profile;
}

function projectDeliverablesWithResources(project) {
  return (project.deliverables || [])
    .map((deliverable) => ({
      deliverable,
      steps: (deliverable.steps || [])
        .map((step, sourceIndex) => ({ step, sourceIndex, span: getStepPeriodSpan(step.period) }))
        .filter(({ step }) => stepAskCount(step) > 0)
        .sort((a, b) => a.span.startIndex - b.span.startIndex || a.sourceIndex - b.sourceIndex)
    }))
    .filter(({ steps }) => steps.length);
}

function signatureForProject(project) {
  return JSON.stringify(projectDeliverablesWithResources(project).map(({ deliverable, steps }) => ({
    id: deliverable.id,
    steps: steps.map(({ step }) => ({
      id: step.id,
      title: step.title,
      period: step.period,
      resources: step.resources
    }))
  })));
}

function createProjectProfile(project) {
  const deliverableGroups = projectDeliverablesWithResources(project);
  if (!deliverableGroups.length) return null;

  const steps = deliverableGroups.flatMap(({ steps: deliverableSteps }) => deliverableSteps.map(({ step }) => step));
  const summary = resourceSummary(steps);
  const knownInvestment = summary.knownInvestment ? formatMoney(summary.knownInvestment) : 'No quantified total yet';
  const profile = document.createElement('details');
  profile.id = 'resource-investment-profile';
  profile.className = 'panel resource-investment-profile';
  profile.dataset.resourceProfileSignature = signatureForProject(project);
  profile.innerHTML = `
    <summary class="resource-profile-summary">
      <span class="resource-profile-heading">
        <strong>Project resource and investment profile</strong>
        <em>Derived from the delivery-step asks across this project's deliverables.</em>
      </span>
      <span class="resource-profile-toggle" aria-hidden="true"></span>
    </summary>
    <div class="resource-profile-body">
      <p class="subtle resource-profile-explainer">Delivery steps remain the source of truth. This project roll-up brings their capacity, investment and enabling conditions together without creating a second authored resource plan.</p>
      <div class="resource-profile-summary-grid">
        <article><strong>${escapeHtml(deliverableGroups.length)}</strong><span>Deliverables with asks</span></article>
        <article><strong>${escapeHtml(summary.capacityAsks)}</strong><span>Capacity asks</span></article>
        <article><strong>${escapeHtml(summary.investmentAsks)}</strong><span>Investment asks</span></article>
        <article><strong>${escapeHtml(knownInvestment)}</strong><span>Known investment</span></article>
        <article><strong>${escapeHtml(summary.enablingConditions)}</strong><span>Enabling conditions</span></article>
      </div>
      <div class="resource-step-sequence">
        ${deliverableGroups.map(({ deliverable, steps: deliverableSteps }) => `
          <section class="resource-project-deliverable">
            <h3><a href="#/deliverables/${encodeURIComponent(deliverable.id)}">${escapeHtml(deliverable.id)} ${escapeHtml(deliverable.title)}</a></h3>
            ${deliverableSteps.map(({ step, sourceIndex }) => renderStepResources(step, sourceIndex, deliverable.id)).join('')}
          </section>
        `).join('')}
      </div>
    </div>
  `;
  return profile;
}

function renderResourceProfile() {
  const existing = document.getElementById('resource-investment-profile');
  const deliverable = deliverableById.get(currentDeliverableId());
  const project = projectById.get(currentProjectId());
  const route = document.getElementById('route-through');
  const projectDeliverablePanel = document.querySelector('.project-deliverable-panel');

  if (!deliverable && !project) {
    existing?.remove();
    return;
  }

  const signature = deliverable ? signatureForDeliverable(deliverable) : signatureForProject(project);
  if (existing?.dataset.resourceProfileSignature === signature) return;

  const wasOpen = Boolean(existing?.open);
  const profile = deliverable ? createDeliverableProfile(deliverable) : createProjectProfile(project);
  if (!profile) {
    existing?.remove();
    return;
  }

  profile.open = wasOpen;
  if (existing) existing.replaceWith(profile);
  else if (deliverable && route) route.insertAdjacentElement('afterend', profile);
  else if (project && projectDeliverablePanel) projectDeliverablePanel.insertAdjacentElement('beforebegin', profile);
}

let refreshScheduled = false;
function scheduleRefresh() {
  if (refreshScheduled) return;
  refreshScheduled = true;
  window.requestAnimationFrame(() => {
    refreshScheduled = false;
    renderResourceProfile();
  });
}

const observer = new MutationObserver(scheduleRefresh);
observer.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener('hashchange', scheduleRefresh);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleRefresh);
} else {
  scheduleRefresh();
}
