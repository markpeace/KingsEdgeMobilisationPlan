import { buildLookups, projects } from './plan-utils.js';

const { deliverables } = buildLookups(projects);
const deliverableById = new Map(deliverables.map((deliverable) => [deliverable.id, deliverable]));

function currentDeliverableId() {
  const match = String(window.location.hash || '').match(/#\/deliverables\/([^/?#]+)/);
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

function setText(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}

function benefitOwners(deliverable) {
  const explicit = (deliverable.benefits || [])
    .filter((benefit) => benefit.owner)
    .map((benefit) => ({ id: benefit.id, title: benefit.title, owner: benefit.owner }));

  if (explicit.length) return explicit;

  const legacyOwner = deliverable.ownership?.benefitOwner;
  return legacyOwner
    ? [{ id: '', title: 'All benefits', owner: legacyOwner }]
    : [];
}

function renderBenefitOwnership(deliverable) {
  const owners = benefitOwners(deliverable);
  const rows = owners.length
    ? owners.map((benefit) => `
        <li>
          <span>${escapeHtml(benefit.title)}</span>
          <strong>${escapeHtml(benefit.owner)}</strong>
        </li>
      `).join('')
    : '<li class="governance-empty-row"><span>Benefit ownership has not yet been assigned.</span></li>';

  return `
    <section class="governance-block governance-benefit-ownership">
      <h3>Benefit ownership</h3>
      <p>Who is responsible for ensuring each benefit is realised after the outputs are delivered.</p>
      <ul class="governance-benefit-owner-list">${rows}</ul>
    </section>
  `;
}

function renderDecisionRoute(deliverable) {
  const governance = deliverable.governance || {};
  const forum = governance.decisionForum || deliverable.ownership?.decisionForum || 'TBC';
  const scope = governance.decisionScope || 'Material choices and escalations that cannot be resolved within an individual delivery step.';

  return `
    <section class="governance-block governance-decision-route">
      <h3>Decision and escalation route</h3>
      <strong class="governance-primary-value">${escapeHtml(forum)}</strong>
      <p>${escapeHtml(scope)}</p>
    </section>
  `;
}

function renderBusinessAsUsualOwnership(deliverable) {
  const governance = deliverable.governance || {};
  const owner = governance.businessAsUsualOwner || 'TBC';
  const note = governance.businessAsUsualOwnershipNote || 'The enduring owner of the service, evidence resource, process or capability has not yet been confirmed.';
  const tbcClass = String(owner).trim().toLowerCase() === 'tbc' ? ' governance-value-tbc' : '';

  return `
    <section class="governance-block governance-bau-ownership">
      <h3>Business-as-usual ownership</h3>
      <strong class="governance-primary-value${tbcClass}">${escapeHtml(owner)}</strong>
      <p>${escapeHtml(note)}</p>
    </section>
  `;
}

function legacyPartnerGroup(deliverable) {
  const contributors = deliverable.ownership?.contributors || [];
  if (!contributors.length) return [];
  return [{
    group: 'Current contributors',
    partners: contributors,
    contribution: 'Roles currently identified as contributing to delivery. Refine these into a smaller set of essential partner groups as the deliverable matures.'
  }];
}

function renderDeliveryPartners(deliverable) {
  const groups = deliverable.governance?.deliveryPartners?.length
    ? deliverable.governance.deliveryPartners
    : legacyPartnerGroup(deliverable);

  if (!groups.length) {
    return `
      <section class="governance-partners governance-partners-empty">
        <div class="governance-section-heading">
          <h3>Key delivery partners</h3>
          <p>No essential partner groups have been captured yet.</p>
        </div>
      </section>
    `;
  }

  return `
    <section class="governance-partners">
      <div class="governance-section-heading">
        <h3>Key delivery partners</h3>
        <p>The small set of partner groups whose contribution is essential to delivery or sustained use.</p>
      </div>
      <div class="governance-partner-grid">
        ${groups.map((group) => `
          <article class="governance-partner-card">
            <span>${escapeHtml(group.group || 'Partner group')}</span>
            ${(group.partners || []).length ? `<strong>${group.partners.map(escapeHtml).join(' · ')}</strong>` : ''}
            ${group.contribution ? `<p>${escapeHtml(group.contribution)}</p>` : ''}
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function signatureFor(deliverable) {
  return JSON.stringify({
    id: deliverable.id,
    ownership: deliverable.ownership,
    governance: deliverable.governance,
    benefitOwners: (deliverable.benefits || []).map((benefit) => ({ id: benefit.id, title: benefit.title, owner: benefit.owner }))
  });
}

function renderGovernancePanel() {
  const section = document.getElementById('governance');
  if (!section) return;

  const deliverable = deliverableById.get(currentDeliverableId());
  if (!deliverable) return;

  setText(section.querySelector('.detail-accordion-header span'), 'How this is governed');
  setText(
    section.querySelector('.detail-accordion-header em'),
    'Where material decisions go, who owns the benefits and ongoing capability, and which partners are essential.'
  );

  const body = section.querySelector('.detail-accordion-body');
  if (!body) return;

  const signature = signatureFor(deliverable);
  if (section.dataset.governanceSignature === signature && body.querySelector('.governance-refined')) return;

  body.innerHTML = `
    <div class="governance-refined">
      <p class="subtle governance-explainer">The hero identifies the accountable owner and delivery lead. This section adds the governance information needed to make decisions, realise benefits and sustain the capability after mobilisation.</p>
      <div class="governance-summary-grid">
        ${renderBenefitOwnership(deliverable)}
        ${renderDecisionRoute(deliverable)}
        ${renderBusinessAsUsualOwnership(deliverable)}
      </div>
      ${renderDeliveryPartners(deliverable)}
    </div>
  `;

  section.classList.add('governance-refined-section');
  section.dataset.governanceSignature = signature;
}

let refreshScheduled = false;
function scheduleRefresh() {
  if (refreshScheduled) return;
  refreshScheduled = true;
  window.requestAnimationFrame(() => {
    refreshScheduled = false;
    renderGovernancePanel();
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
