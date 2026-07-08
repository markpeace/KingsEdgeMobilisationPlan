const readerModeLabels = [
  ['Headline view', 'Overview, route through, decisions and key dependencies.'],
  ['Institutional view', 'Headline view plus governance, value, evidence and handoffs.'],
  ['Project management view', 'Institutional view plus resources, components, risks and delivery detail.']
];

const readerModeSections = [
  [],
  ['governance', 'value-evidence', 'dependencies'],
  ['governance', 'value-evidence', 'definition-of-done', 'resources', 'components', 'risks-decisions', 'dependencies']
];

let refreshScheduled = false;

function setTextIfChanged(node, text) {
  if (node && node.textContent !== text) node.textContent = text;
}

function setAccordionState(sectionId, shouldOpen) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  const button = section.querySelector('.detail-accordion-header');
  if (!button) return;
  const isOpen = button.getAttribute('aria-expanded') === 'true';
  if (isOpen !== shouldOpen) button.click();
}

function applyReaderMode(index) {
  const openSections = new Set(readerModeSections[index] || []);
  document.querySelectorAll('.detail-accordion[id]').forEach((section) => {
    setAccordionState(section.id, openSections.has(section.id));
  });
}

function activeReaderModeIndex(buttons) {
  const index = buttons.findIndex((button) => button.classList.contains('active'));
  return index >= 0 ? index : 0;
}

function refreshReaderModes() {
  refreshScheduled = false;
  const buttons = [...document.querySelectorAll('.reader-mode-control button')];
  const accordions = document.querySelectorAll('.detail-accordion[id]');
  if (buttons.length < 3 || !accordions.length) return;

  buttons.slice(0, 3).forEach((button, index) => {
    const [label, help] = readerModeLabels[index];
    setTextIfChanged(button.querySelector('strong'), label);
    setTextIfChanged(button.querySelector('span'), help);

    if (!button.dataset.readerModeRefined) {
      button.dataset.readerModeRefined = 'true';
      button.addEventListener('click', () => {
        window.setTimeout(() => {
          const latestButtons = [...document.querySelectorAll('.reader-mode-control button')];
          const latestIndex = activeReaderModeIndex(latestButtons);
          document.body.dataset.readerModeAppliedKey = `${window.location.hash}:${latestIndex}`;
          applyReaderMode(latestIndex);
        }, 100);
      });
    }
  });

  const activeIndex = activeReaderModeIndex(buttons);
  const applyKey = `${window.location.hash}:${activeIndex}`;
  if (document.body.dataset.readerModeAppliedKey !== applyKey) {
    document.body.dataset.readerModeAppliedKey = applyKey;
    window.setTimeout(() => applyReaderMode(activeIndex), 60);
  }
}

function scheduleRefreshReaderModes() {
  if (refreshScheduled) return;
  refreshScheduled = true;
  window.requestAnimationFrame(refreshReaderModes);
}

const readerModeObserver = new MutationObserver(scheduleRefreshReaderModes);
readerModeObserver.observe(document.documentElement, { childList: true, subtree: true });

window.addEventListener('hashchange', () => {
  delete document.body.dataset.readerModeAppliedKey;
  scheduleRefreshReaderModes();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleRefreshReaderModes);
} else {
  scheduleRefreshReaderModes();
}
