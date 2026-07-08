let refreshScheduled = false;
let accordionsInitialised = false;

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
}

function removeReaderNavigation() {
  document.querySelector('.deliverable-page-index')?.remove();
  document.querySelector('.deliverable-layout')?.classList.add('deliverable-layout-single-column');
}

function syncWhyThisMattersPosition() {
  const mainFlow = document.querySelector('.deliverable-main-flow');
  const casePanel = mainFlow?.querySelector('.case-panel');
  const routePanel = mainFlow?.querySelector('.route-through-panel');
  if (!mainFlow || !casePanel || !routePanel || casePanel.nextElementSibling === routePanel) return;
  mainFlow.insertBefore(casePanel, routePanel);
}

function initialiseAccordionDisclosure() {
  const key = window.location.hash;
  if (accordionsInitialised === key) return;
  const accordions = [...document.querySelectorAll('.detail-accordion[id]')];
  if (!accordions.length) return;
  accordions.forEach((section) => setAccordionState(section.id, false));
  accordionsInitialised = key;
}

function refineDeliveryTimeline() {
  const panel = document.querySelector('.route-through-panel');
  if (!panel) return;

  setTextIfChanged(panel.querySelector('h2'), 'Delivery timeline');
  setTextIfChanged(
    panel.querySelector(':scope > .subtle'),
    'The main delivery route for this deliverable. Scroll across to see the full sequence; expand Project management detail below for step-level outputs, resources, risks and decisions.'
  );

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

function refreshDeliverablePage() {
  refreshScheduled = false;
  syncPlanningStagePosition();
  removeOverviewPanel();
  removeReaderNavigation();
  syncWhyThisMattersPosition();
  refineDeliveryTimeline();
  refineCrossDeliverableDependencies();
  initialiseAccordionDisclosure();
}

function scheduleRefreshDeliverablePage() {
  if (refreshScheduled) return;
  refreshScheduled = true;
  window.requestAnimationFrame(refreshDeliverablePage);
}

const deliverablePageObserver = new MutationObserver(scheduleRefreshDeliverablePage);
deliverablePageObserver.observe(document.documentElement, { childList: true, subtree: true });

window.addEventListener('hashchange', () => {
  accordionsInitialised = false;
  document.querySelector('.planning-notice-clone')?.remove();
  scheduleRefreshDeliverablePage();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleRefreshDeliverablePage);
} else {
  scheduleRefreshDeliverablePage();
}
