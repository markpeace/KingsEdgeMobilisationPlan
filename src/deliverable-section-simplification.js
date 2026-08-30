const obsoleteSectionIds = [
  'decisions-dependencies',
  'definition-of-done',
  'components',
  'dependencies',
  'resources'
];

function setText(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}

function ensureCoreSectionOpen(sectionId) {
  const section = document.getElementById(sectionId);
  const button = section?.querySelector('.detail-accordion-header');
  if (!button || button.getAttribute('aria-expanded') === 'true') return;
  button.click();
}

function simplifyDeliverableSections() {
  obsoleteSectionIds.forEach((id) => document.getElementById(id)?.remove());

  // Benefits and evidence is part of the core public story of a deliverable,
  // so it should be visible without requiring the reader to understand the
  // planning-detail disclosure model first.
  ensureCoreSectionOpen('value-evidence');

  const planningRiskSection = document.getElementById('risks-decisions');
  if (!planningRiskSection) return;

  setText(
    planningRiskSection.querySelector('.detail-accordion-header span'),
    'Planning risks, issues and assumptions'
  );
  setText(
    planningRiskSection.querySelector('.detail-accordion-header em'),
    'Whole-route risks, issues and assumptions that need planning scrutiny.'
  );
}

let refreshScheduled = false;
function scheduleRefresh() {
  if (refreshScheduled) return;
  refreshScheduled = true;
  window.requestAnimationFrame(() => {
    refreshScheduled = false;
    simplifyDeliverableSections();
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
