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

function renderMeta(items) {
  const values = items.filter(Boolean);
  return values.length ? `<p class="benefit-meta">${values.map(escapeHtml).join(' · ')}</p>` : '';
}

function renderEnabledBy(benefit, deliverable) {
  const items = benefit.enabledBy || benefit.linkedOutputs || [];
  if (!items.length) return '';
  const labels = stepLabels(deliverable);
  return `
    <div class="benefit-enabled-by">
      <h5>Enabled by timeline outputs</h5>
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
  const method = measure.measure ? `<div class="benefit-measure-method"><h6>What we will examine</h6><p>${escapeHtml(measure.measure)}</p></div>` : '';
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
        <h5>Evidence of success</h5>
        <p>No benefit-realisation measure is linked yet.</p>
      </div>
    `;
  }

  const countLabel = `${measures.length} ${measures.length === 1 ? 'measure' : 'measures'}`;
  return `
    <div class="benefit-evidence-group">
      <div class="benefit-evidence-heading">
        <h5>Evidence of success</h5>
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
        <span class="reference">${escapeHtml(benefit.id)}</span>
        <h4>${escapeHtml(benefit.title)}</h4>
        <p>${escapeHtml(benefit.statement)}</p>
        ${renderMeta([benefit.beneficiary, benefit.benefitType, benefit.realisationPeriod])}
      </header>
      <div class="benefit-success-look">
        <h5>What success looks like</h5>
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
    'The value this deliverable should create, what success looks like, and the measures that will show whether it is being realised.'
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
    <p class="subtle value-evidence-explainer">This section describes the benefits the deliverable is expected to create and how we will know they are being realised. Products, outputs and delivery controls remain in the Delivery timeline.</p>
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
