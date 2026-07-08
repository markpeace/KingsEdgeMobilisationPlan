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

function refreshReaderModes() {
  const buttons = [...document.querySelectorAll('.reader-mode-control button')];
  if (buttons.length < 3) return;

  buttons.slice(0, 3).forEach((button, index) => {
    const [label, help] = readerModeLabels[index];
    const strong = button.querySelector('strong');
    const span = button.querySelector('span');
    if (strong) strong.textContent = label;
    if (span) span.textContent = help;

    if (!button.dataset.readerModeRefined) {
      button.dataset.readerModeRefined = 'true';
      button.addEventListener('click', () => {
        window.setTimeout(() => {
          refreshReaderModes();
          applyReaderMode(index);
        }, 80);
      });
    }
  });

  if (!document.body.dataset.readerModeInitialised && document.querySelector('.detail-accordion')) {
    document.body.dataset.readerModeInitialised = 'true';
    const activeIndex = Math.max(0, buttons.findIndex((button) => button.classList.contains('active')));
    window.setTimeout(() => applyReaderMode(activeIndex), 80);
  }
}

const readerModeObserver = new MutationObserver(refreshReaderModes);
readerModeObserver.observe(document.documentElement, { childList: true, subtree: true });

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', refreshReaderModes);
} else {
  refreshReaderModes();
}
