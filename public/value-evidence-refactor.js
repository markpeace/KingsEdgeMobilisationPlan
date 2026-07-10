const benefitEvidenceByDeliverable = {
  '2.1.1': {
    '2.1.1-B1': {
      successLooksLike: 'Programme teams can make confident, nuanced and evidence-informed claims about what their programmes enable.',
      evidenceOfSuccess: [
        'Programme Graduate Futures Profiles or equivalent story materials are used in programme review, recruitment, open days or student-facing contexts.',
        'Programme teams report that the evidence helps them explain distinctive strengths with greater confidence.',
        'Claims made in student-facing or applicant-facing contexts are linked to evidence and agreed with relevant programme teams.'
      ],
      enabledBy: [
        { stepId: '2.1.1-step-1', label: 'Step 01: First working graduate futures evidence pack' },
        { stepId: '2.1.1-step-3', label: 'Step 03: Programme reflection and profile template' },
        { stepId: '2.1.1-step-5', label: 'Step 05: Programme Graduate Futures Profiles' }
      ]
    },
    '2.1.1-B2': {
      successLooksLike: 'Teams identify credible areas for development without reducing the evidence to deficit, ranking or compliance reporting.',
      evidenceOfSuccess: [
        'Guided conversations capture agreed questions, actions or focus areas for programme, department or faculty follow-up.',
        'Graduate Futures Action Plans or equivalent local action sets are taken into normal department or faculty planning routes.',
        'Programme teams can distinguish between strengths to celebrate, questions to investigate and areas where additional support may be useful.'
      ],
      enabledBy: [
        { stepId: '2.1.1-step-3', label: 'Step 03: Guided programme conversation structure' },
        { stepId: '2.1.1-step-4', label: 'Step 04: Examples of programme insight and story' },
        { stepId: '2.1.1-step-5', label: 'Step 05: Graduate Futures Action Plans' }
      ]
    },
    '2.1.1-B3': {
      successLooksLike: "King's can see patterns across programme stories and graduate futures evidence while preserving local context and academic judgement.",
      evidenceOfSuccess: [
        "Institutional synthesis informs King's Edge work, faculty planning, graduate premium evidence and related curriculum or skills activity.",
        'Shared themes are discussed as learning and support needs, not as programme league tables.',
        'Faculty and institutional planning can see where graduate futures strengths, questions and infrastructure needs recur across contexts.'
      ],
      enabledBy: [
        { stepId: '2.1.1-step-2', label: 'Step 02: Early institutional summary' },
        { stepId: '2.1.1-step-6', label: 'Step 06: Institutional synthesis' },
        { stepId: '2.1.1-step-8', label: 'Step 08: Ongoing learning loop' }
      ]
    },
    '2.1.1-B4': {
      successLooksLike: 'Programme-facing use of evidence is fair, interpretable and developmental, avoiding ranking, league-table or punitive readings.',
      evidenceOfSuccess: [
        'Feedback suggests that the evidence is useful, fair and interpretable when caveats and context are visible.',
        'Programme teams use academic judgement to interpret the evidence and challenge over-simple readings.',
        'Pack, profile and story materials include appropriate caveats and avoid unsupported claims.'
      ],
      enabledBy: [
        { stepId: '2.1.1-step-1', label: 'Step 01: Interpretation approach' },
        { stepId: '2.1.1-step-2', label: 'Step 02: Short user guide' },
        { stepId: '2.1.1-step-3', label: 'Step 03: Responsible-use guidance' }
      ]
    },
    '2.1.1-B5': {
      successLooksLike: 'Distinctive programme strengths are surfaced, agreed with programme teams and used responsibly in student-facing, applicant-facing or institutional contexts.',
      evidenceOfSuccess: [
        'Examples of distinctive programme value are captured through programme conversations and reflected in profile or story materials.',
        'Story materials are used in appropriate recruitment, open day, advising, programme review or student-facing contexts.',
        'Programme teams recognise themselves in the story and feel able to use it confidently.'
      ],
      enabledBy: [
        { stepId: '2.1.1-step-4', label: 'Step 04: Examples of programme insight and story' },
        { stepId: '2.1.1-step-5', label: 'Step 05: Programme Graduate Futures Story Materials' },
        { stepId: '2.1.1-step-6', label: 'Step 06: Institutional synthesis' }
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
