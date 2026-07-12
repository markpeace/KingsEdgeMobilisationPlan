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

function linkedBenefitIds(measure) {
  return measure.supportsBenefits || measure.relatedBenefitIds || [];
}

function stepLabels(deliverable) {
  return new Map((deliverable.steps || []).map((step, index) => [
    step.id,
    `Step ${String(index + 1).padStart(2, '0')}`
  ]));
}

function benefitLabel(benefit) {
  const match = String(benefit.id || '').match(/B(\d+)$/i);
  return match ? `Benefit ${Number(match[1])}` : 'Benefit';
}

function renderMeta(items) {
  const values = items.filter(Boolean);
  return values.length ? `<p class="benefit-meta">${values.map(escapeHtml).join(' · ')}</p>` : '';
}

function renderBenefitContext(benefit) {
  const items = [
    benefit.beneficiary ? ['Who benefits', benefit.beneficiary] : null,
    benefit.realisationPeriod ? ['Realisation', benefit.realisationPeriod] : null
  ].filter(Boolean);

  if (!items.length) return '';

  return `
    <dl class="benefit-context">
      ${items.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}
    </dl>
  `;
}

function renderEnabledBy(benefit, deliverable) {
  const items = benefit.enabledBy || benefit.linkedOutputs || [];
  if (!items.length) return '';
  const labels = stepLabels(deliverable);
  return `
    <div class="benefit-enabled-by">
      <h5>Enabled by</h5>
      <div class="benefit-enabled-by-list">
        ${items.map((item) => {
          const stepLabel = labels.get(item.stepId) || item.stepId;
          const outputLabel = item.outputTitle || item.outputId || item.note || 'Timeline output';
          return `<span class="benefit-enabled-chip"><strong>${escapeHtml(stepLabel)}</strong><span>${escapeHtml(outputLabel)}</span></span>`;
        }).join('')}
      </div>
    </div>
  `;
}

function renderMeasure(measure) {
  const type = measure.measureType ? `<span class="benefit-measure-type">${escapeHtml(measure.measureType)}</span>` : '';
  const question = measure.questionAnswered ? `<p class="benefit-measure-question">${escapeHtml(measure.questionAnswered)}</p>` : '';
  const method = measure.measure ? `<div class="benefit-measure-method"><h6>Evidence examined</h6><p>${escapeHtml(measure.measure)}</p></div>` : '';
  const thresholds = [
    measure.baseline ? `<div><h6>Baseline</h6><p>${escapeHtml(measure.baseline)}</p></div>` : '',
    measure.target ? `<div><h6>Success threshold</h6><p>${escapeHtml(measure.target)}</p></div>` : ''
  ].filter(Boolean).join('');
  const thresholdBlock = thresholds ? `<div class="benefit-measure-thresholds">${thresholds}</div>` : '';
  const metadata = renderMeta([
    measure.owner && `Owner: ${measure.owner}`,
    measure.cadence && `Cadence: ${measure.cadence}`,
    measure.confidence && `Confidence: ${measure.confidence}`
  ]);

  return `
    <details class="benefit-measure">
      <summary>
        <span class="benefit-measure-summary-main">
          <span class="reference">${escapeHtml(measure.id)}</span>
          <strong>${escapeHtml(measure.title)}</strong>
        </span>
        ${type}
      </summary>
      <div class="benefit-measure-body">
        ${question}
        ${method}
        ${thresholdBlock}
        ${metadata}
      </div>
    </details>
  `;
}

function renderEvidence(measures) {
  if (!measures.length) {
    return `
      <div class="benefit-evidence-empty">
        <h5>How we will know</h5>
        <p>No benefit-realisation measure is linked yet.</p>
      </div>
    `;
  }

  const countLabel = `${measures.length} ${measures.length === 1 ? 'measure' : 'measures'}`;
  return `
    <div class="benefit-evidence-group">
      <div class="benefit-evidence-heading">
        <h5>How we will know</h5>
        <span>${countLabel}</span>
      </div>
      <div class="benefit-measure-list">
        ${measures.map(renderMeasure).join('')}
      </div>
    </div>
  `;
}

function renderBenefit(benefit, measures, deliverable) {
  return `
    <article class="benefit-realisation-card">
      <header class="benefit-card-header">
        <span class="benefit-label" title="${escapeHtml(benefit.id)}">${escapeHtml(benefitLabel(benefit))}</span>
        <h4>${escapeHtml(benefit.title)}</h4>
        <p class="benefit-value-statement">${escapeHtml(benefit.statement)}</p>
        ${renderBenefitContext(benefit)}
      </header>
      <div class="benefit-success-look">
        <h5>Success means</h5>
        <p>${escapeHtml(benefit.successLooksLike || 'Success description not yet captured.')}</p>
      </div>
      ${renderEvidence(measures)}
      ${renderEnabledBy(benefit, deliverable)}
    </article>
  `;
}

function signatureFor(deliverable) {
  return JSON.stringify({
    id: deliverable.id,
    benefits: deliverable.benefits,
    measures: deliverable.measures,
    steps: (deliverable.steps || []).map((step) => ({ id: step.id, title: step.title }))
  });
}

function renderValueEvidenceSection() {
  const section = document.getElementById('value-evidence');
  if (!section) return;

  const deliverable = deliverableById.get(currentDeliverableId());
  if (!deliverable) return;

  setText(section.querySelector('.detail-accordion-header span'), 'Benefits and evidence');
  setText(
    section.querySelector('.detail-accordion-header em'),
    'The outcomes this deliverable should create, how we will know, and which timeline outputs enable them.'
  );

  const panel = section.querySelector('.delivery-model-panel');
  if (!panel) return;

  const signature = signatureFor(deliverable);
  if (section.dataset.valueEvidenceSignature === signature && panel.querySelector('.benefit-realisation-list')) return;

  const benefits = deliverable.benefits || [];
  const measures = deliverable.measures || [];
  const mappedMeasureIds = new Set();

  const benefitCards = benefits.map((benefit) => {
    const linked = measures.filter((measure) => linkedBenefitIds(measure).includes(benefit.id));
    linked.forEach((measure) => mappedMeasureIds.add(measure.id));
    return renderBenefit(benefit, linked, deliverable);
  }).join('');

  const unmapped = measures.filter((measure) => !mappedMeasureIds.has(measure.id));
  const unmappedBlock = unmapped.length ? `
    <section class="unmapped-evidence-block">
      <h4>Cross-cutting or unmapped evidence</h4>
      <p>These measures are not yet linked to a benefit. They should be mapped through <code>supportsBenefits</code> or moved to the Delivery timeline if they are delivery controls.</p>
      <div class="benefit-measure-list">${unmapped.map(renderMeasure).join('')}</div>
    </section>
  ` : '';

  panel.innerHTML = `
    <p class="subtle value-evidence-explainer">Each benefit shows the outcome we want, how we will know it is happening, and the timeline outputs that make it possible.</p>
    <div class="benefit-realisation-list">
      ${benefitCards || '<p>No benefits captured yet.</p>'}
    </div>
    ${unmappedBlock}
  `;

  section.classList.add('value-evidence-refined');
  section.dataset.valueEvidenceSignature = signature;
}

let refreshScheduled = false;
function scheduleRefresh() {
  if (refreshScheduled) return;
  refreshScheduled = true;
  window.requestAnimationFrame(() => {
    refreshScheduled = false;
    renderValueEvidenceSection();
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
