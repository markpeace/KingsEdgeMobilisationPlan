const benefitEvidenceByDeliverable = {
  '2.1.1': {
    '2.1.1-B1': {
      successLooksLike: 'Programme and institutional narratives claim graduate futures value with confidence, nuance and evidence, while remaining context-sensitive, academically owned and appropriately caveated.',
      evidenceOfSuccess: [
        'Programme reflections, profiles or story materials explain what programmes enable for students using evidence, context and academic judgement.',
        'Programme teams recognise themselves in the story and feel able to use it with students, applicants, colleagues or external audiences.',
        'Student-facing, applicant-facing or institutional claims about graduate futures are evidence-linked, context-sensitive, appropriately caveated and agreed with the relevant programme teams.',
        "Programme and institutional stories feed recruitment, open day, programme review, graduate premium evidence or related King's Edge work without reducing programme value to a single metric."
      ],
      enabledBy: [
        { stepId: '2.1.1-step-1', label: 'Step 01: First working graduate futures evidence pack' },
        { stepId: '2.1.1-step-3', label: 'Step 03: Programme reflection and profile template' },
        { stepId: '2.1.1-step-5', label: 'Step 05: Examples of distinctive programme value' },
        { stepId: '2.1.1-step-7', label: 'Step 07: Institutional graduate futures synthesis' }
      ]
    },
    '2.1.1-B2': {
      successLooksLike: 'Programme and institutional conversations use graduate futures evidence to identify strengths, questions, support needs and focused opportunities for enhancement without treating the evidence as a deficit report, ranking or judgement on programme quality.',
      evidenceOfSuccess: [
        'Guided conversations capture agreed questions, practical local actions or areas for further support.',
        'Actions or focus areas are taken into normal programme, department or faculty planning routes rather than remaining as standalone project paperwork.',
        'Faculty-level learning and institutional synthesis draw out recurring strengths, questions, student pathways and support needs across contexts.',
        "Shared themes inform King's Edge work, faculty planning, curriculum enhancement, skills-related activity or support priorities without creating programme comparison or league-table logic."
      ],
      enabledBy: [
        { stepId: '2.1.1-step-3', label: 'Step 03: Guided programme conversation structure' },
        { stepId: '2.1.1-step-4', label: 'Step 04: Examples of programme insight and story' },
        { stepId: '2.1.1-step-5', label: 'Step 05: Practical local actions' },
        { stepId: '2.1.1-step-5', label: 'Step 05: Faculty-level learning' },
        { stepId: '2.1.1-step-7', label: 'Step 07: Institutional graduate futures synthesis' },
        { stepId: '2.1.1-step-7', label: "Step 07: Recommendations for related King's Edge work" }
      ]
    }
  }
};

function currentDeliverableIdForValueEvidence() {
  const match = String(window.location.hash || '').match(/#\/deliverables\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function escapeValueEvidenceHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function setValueEvidenceText(node, text) {
  if (node && node.textContent !== text) node.textContent = text;
}

function valueEvidenceSection() {
  return document.getElementById('value-evidence');
}

function findValueEvidenceColumn(panel, headingText) {
  return [...panel.querySelectorAll('.delivery-model-column')].find((column) => {
    return column.querySelector('h3')?.textContent?.trim().toLowerCase() === headingText.toLowerCase();
  });
}

function renderEnabledByLinks(items) {
  if (!items?.length) return '';
  return `<div class="benefit-enabled-by"><h5>Enabled by timeline outputs</h5><div class="benefit-enabled-by-list">${items.map((item) => `<a class="benefit-enabled-chip" href="#/deliverables/${encodeURIComponent(currentDeliverableIdForValueEvidence())}">${escapeValueEvidenceHtml(item.label || item.stepId)}</a>`).join('')}</div></div>`;
}

function renderBenefitEvidenceDetail(benefitId, evidence) {
  if (!evidence) return '';
  const evidenceItems = evidence.evidenceOfSuccess?.length
    ? `<ul>${evidence.evidenceOfSuccess.map((item) => `<li>${escapeValueEvidenceHtml(item)}</li>`).join('')}</ul>`
    : '<p>No evidence of success captured yet.</p>';
  return `
    <div class="benefit-evidence-detail" data-benefit-evidence-for="${escapeValueEvidenceHtml(benefitId)}">
      <div class="benefit-success-look">
        <h5>What success looks like</h5>
        <p>${escapeValueEvidenceHtml(evidence.successLooksLike || 'Success description not yet captured.')}</p>
      </div>
      <div class="benefit-evidence-list">
        <h5>Evidence of success</h5>
        ${evidenceItems}
      </div>
      ${renderEnabledByLinks(evidence.enabledBy)}
    </div>
  `;
}

function refineBenefitCards(section) {
  const deliverableId = currentDeliverableIdForValueEvidence();
  const evidenceMap = benefitEvidenceByDeliverable[deliverableId] || {};
  section.querySelectorAll('.benefit-card').forEach((card) => {
    const benefitId = card.querySelector('.reference')?.textContent?.trim();
    const existing = card.querySelector('.benefit-evidence-detail');
    const html = renderBenefitEvidenceDetail(benefitId, evidenceMap[benefitId]);
    if (!html) {
      existing?.remove();
      return;
    }
    if (existing) {
      if (existing.outerHTML !== html.trim()) existing.outerHTML = html;
    } else {
      card.insertAdjacentHTML('beforeend', html);
    }
  });
}

function refineValueEvidenceSection() {
  const section = valueEvidenceSection();
  if (!section) return;
  section.classList.add('value-evidence-refined');

  setValueEvidenceText(section.querySelector('.detail-accordion-header span'), 'Benefits and evidence of success');
  setValueEvidenceText(
    section.querySelector('.detail-accordion-header em'),
    'Benefits to realise, what success looks like, and evidence that the value is happening. Products and outputs are defined in the Delivery timeline.'
  );

  const panel = section.querySelector('.delivery-model-panel');
  if (!panel) return;

  const explainer = panel.querySelector(':scope > .subtle');
  setValueEvidenceText(
    explainer,
    'This section describes the benefits the deliverable is expected to create and how we will know they are being realised. Products and outputs are defined in the Delivery timeline and referenced here only as traceability links.'
  );

  const benefitsColumn = findValueEvidenceColumn(panel, 'Benefits to realise');
  const outputsColumn = findValueEvidenceColumn(panel, 'Outputs to produce');
  const measuresColumn = findValueEvidenceColumn(panel, 'Measures and evidence');

  setValueEvidenceText(benefitsColumn?.querySelector('h3'), 'Benefits');
  setValueEvidenceText(measuresColumn?.querySelector('h3'), 'Evidence of success');
  outputsColumn?.classList.add('value-evidence-output-column-hidden');

  refineBenefitCards(section);
}

let valueEvidenceRefreshScheduled = false;
function scheduleValueEvidenceRefresh() {
  if (valueEvidenceRefreshScheduled) return;
  valueEvidenceRefreshScheduled = true;
  window.requestAnimationFrame(() => {
    valueEvidenceRefreshScheduled = false;
    refineValueEvidenceSection();
  });
}

const valueEvidenceObserver = new MutationObserver(scheduleValueEvidenceRefresh);
valueEvidenceObserver.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener('hashchange', scheduleValueEvidenceRefresh);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleValueEvidenceRefresh);
} else {
  scheduleValueEvidenceRefresh();
}
