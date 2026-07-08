const readerModeLabels = [
  ['Headline view', 'Why this matters, delivery timeline, decisions and key dependencies.'],
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

function setHtmlIfChanged(node, html) {
  if (node && node.innerHTML !== html) node.innerHTML = html;
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

function syncPlanningStagePosition() {
  const hero = document.querySelector('.detail-hero:not(.project-detail-hero)');
  const source = document.querySelector('.deliverable-main-flow > .planning-notice');
  const existing = document.querySelector('.planning-notice-clone');

  if (!hero || !source) {
    existing?.remove();
    return;
  }

  if (!source.classList.contains('planning-notice-inline-hidden')) {
    source.classList.add('planning-notice-inline-hidden');
  }

  let clone = existing;
  if (!clone) {
    clone = source.cloneNode(true);
    clone.classList.add('planning-notice-clone');
    clone.classList.remove('planning-notice-inline-hidden');
    hero.insertAdjacentElement('beforebegin', clone);
  } else if (clone.nextElementSibling !== hero) {
    hero.insertAdjacentElement('beforebegin', clone);
  }

  const sourceHtml = source.innerHTML;
  if (clone.innerHTML !== sourceHtml) clone.innerHTML = sourceHtml;
  const cloneClassName = `${source.className.replace('planning-notice-inline-hidden', '').trim()} planning-notice-clone`.trim();
  if (clone.className !== cloneClassName) clone.className = cloneClassName;
}

function removeOverviewPanel() {
  document.querySelector('.at-a-glance-panel')?.remove();
  document.querySelector('.deliverable-page-index a[href="#overview"]')?.remove();
}

function syncWhyThisMattersPosition() {
  const mainFlow = document.querySelector('.deliverable-main-flow');
  const casePanel = mainFlow?.querySelector('.case-panel');
  const routePanel = mainFlow?.querySelector('.route-through-panel');
  if (!mainFlow || !casePanel || !routePanel || casePanel.nextElementSibling === routePanel) return;
  mainFlow.insertBefore(casePanel, routePanel);
}

function refineDeliveryTimeline() {
  const panel = document.querySelector('.route-through-panel');
  if (!panel) return;

  setTextIfChanged(panel.querySelector('h2'), 'Delivery timeline');
  setTextIfChanged(
    panel.querySelector(':scope > .subtle'),
    'The main delivery route for this deliverable. Scroll across to see the full sequence; switch to Project management view to reveal step-level outputs, resources, risks and decisions.'
  );

  const indexLink = document.querySelector('.deliverable-page-index a[href="#route-through"]');
  setTextIfChanged(indexLink, 'Delivery timeline');

  panel.querySelectorAll('.step-card').forEach((card) => {
    const period = card.querySelector('.period-pill')?.textContent?.trim();
    const hasDependency = Boolean(card.querySelector('.depends'));
    const hasDetail = Boolean(card.querySelector('.step-extras'));
    let signals = card.querySelector('.step-card-signals');
    if (!signals) {
      signals = document.createElement('div');
      signals.className = 'step-card-signals';
      const depends = card.querySelector('.depends');
      const summary = card.querySelector('p:not(.depends)');
      (depends || summary || card).insertAdjacentElement('afterend', signals);
    }

    const html = [
      period ? `<span>${period}</span>` : '',
      hasDependency ? '<span>Internal sequencing</span>' : '<span>No internal prerequisite</span>',
      hasDetail ? '<span>Step detail shown</span>' : '<span>PM detail hidden</span>'
    ].filter(Boolean).join('');
    setHtmlIfChanged(signals, html);
  });
}

function linkPointsToCurrentDeliverable(link) {
  if (!link?.href || !window.location.hash) return false;
  try {
    return new URL(link.href, window.location.href).hash === window.location.hash;
  } catch {
    return false;
  }
}

function hideInternalDependencyLinks(container) {
  container.querySelectorAll('.link-list .chip').forEach((chip) => {
    const isInternal = chip.matches('a') && linkPointsToCurrentDeliverable(chip);
    chip.classList.toggle('internal-dependency-hidden', isInternal);
  });

  container.querySelectorAll('.compact-list li').forEach((item) => {
    const link = item.querySelector('a.chip');
    item.classList.toggle('internal-dependency-hidden', linkPointsToCurrentDeliverable(link));
  });
}

function visibleDependencyLinks(container) {
  return [...container.querySelectorAll('.chip')].filter((chip) => !chip.classList.contains('internal-dependency-hidden') && !chip.closest('.internal-dependency-hidden'));
}

function ensureCrossDependencyMessage(container) {
  let message = container.querySelector(':scope > .cross-dependency-empty');
  if (!message) {
    message = document.createElement('p');
    message.className = 'cross-dependency-empty';
    const heading = container.querySelector('h2, h3');
    (heading || container).insertAdjacentElement(heading ? 'afterend' : 'afterbegin', message);
  }
  setTextIfChanged(message, 'No cross-deliverable dependencies captured yet. Internal step sequencing is shown in Delivery timeline.');
  message.hidden = visibleDependencyLinks(container).length > 0;
}

function refineCrossDeliverableDependencies() {
  const dependencyContainers = [
    ...document.querySelectorAll('.decision-dependency-panel .decision-dependency-grid > div:nth-child(2)'),
    ...document.querySelectorAll('.dependency-detail-grid .panel')
  ];

  dependencyContainers.forEach((container) => {
    hideInternalDependencyLinks(container);
    ensureCrossDependencyMessage(container);
  });
}

function refreshReaderModes() {
  refreshScheduled = false;
  syncPlanningStagePosition();
  removeOverviewPanel();
  syncWhyThisMattersPosition();
  refineDeliveryTimeline();
  refineCrossDeliverableDependencies();

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
          removeOverviewPanel();
          syncWhyThisMattersPosition();
          refineDeliveryTimeline();
          refineCrossDeliverableDependencies();
        }, 100);
      });
    }
  });

  const activeIndex = activeReaderModeIndex(buttons);
  const applyKey = `${window.location.hash}:${activeIndex}`;
  if (document.body.dataset.readerModeAppliedKey !== applyKey) {
    document.body.dataset.readerModeAppliedKey = applyKey;
    window.setTimeout(() => {
      applyReaderMode(activeIndex);
      removeOverviewPanel();
      syncWhyThisMattersPosition();
      refineDeliveryTimeline();
      refineCrossDeliverableDependencies();
    }, 60);
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
  document.querySelector('.planning-notice-clone')?.remove();
  scheduleRefreshReaderModes();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleRefreshReaderModes);
} else {
  scheduleRefreshReaderModes();
}
