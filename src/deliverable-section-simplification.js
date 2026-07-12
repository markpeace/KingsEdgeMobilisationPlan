const obsoleteSectionIds = [
  'decisions-dependencies',
  'definition-of-done',
  'components',
  'dependencies'
];

function setText(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}

function simplifyDeliverableSections() {
  obsoleteSectionIds.forEach((id) => document.getElementById(id)?.remove());

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
