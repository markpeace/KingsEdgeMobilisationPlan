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

function enableStepDetailsMode() {
  const routePanel = document.querySelector('.route-through-panel');
  const buttons = [...document.querySelectorAll('.reader-mode-control button')];
  if (!routePanel || buttons.length < 2) return;
  if (routePanel.querySelector('.step-extras')) return;
  const key = window.location.hash;
  if (document.body.dataset.stepDetailsEnabledKey === key) return;
  document.body.dataset.stepDetailsEnabledKey = key;
  buttons[1].click();
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

function moveValueEvidencePanel() {
  const mainFlow = document.querySelector('.deliverable-main-flow');
  const casePanel = mainFlow?.querySelector('.case-panel');
  const valuePanel = document.getElementById('value-evidence');
  const routePanel = mainFlow?.querySelector('.route-through-panel');
  if (!mainFlow || !casePanel || !valuePanel || !routePanel) return;
  if (casePanel.nextElementSibling === valuePanel && valuePanel.nextElementSibling === routePanel) return;
  mainFlow.insertBefore(valuePanel, routePanel);
}

function initialiseAccordionDisclosure() {
  const key = window.location.hash;
  if (accordionsInitialised === key) return;
  const accordions = [...document.querySelectorAll('.detail-accordion[id]')];
  if (!accordions.length) return;
  accordions.forEach((section) => setAccordionState(section.id, false));
  accordionsInitialised = key;
}

function stepDetailLabel(card) {
  const sections = [...card.querySelectorAll('.step-extras .mini-block > h4, .step-extras .resources-panel > h3')]
    .map((heading) => heading.textContent?.trim())
    .filter(Boolean);
  return sections.length ? `Step detail: ${sections.join(', ')}` : 'Step detail';
}

function refineStepDetailDisclosure() {
  document.querySelectorAll('.route-through-panel .step-card').forEach((card) => {
    const extras = card.querySelector('.step-extras');
    if (!extras) return;

    if (!extras.id) {
      extras.id = `${card.getAttribute('data-step-id') || card.querySelector('h3')?.textContent?.trim()?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'step'}-details`;
    }

    let button = card.querySelector(':scope > .step-detail-toggle');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'step-detail-toggle';
      button.setAttribute('aria-controls', extras.id);
      extras.insertAdjacentElement('beforebegin', button);
      button.addEventListener('click', () => {
        const open = !card.classList.contains('step-card-detail-open');
        card.classList.toggle('step-card-detail-open', open);
        button.setAttribute('aria-expanded', String(open));
        setTextIfChanged(button, open ? 'Hide step detail' : 'Show step detail');
      });
    }

    const open = card.classList.contains('step-card-detail-open');
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('title', stepDetailLabel(card));
    setTextIfChanged(button, open ? 'Hide step detail' : 'Show step detail');
  });
}

function refinePlanningDetailCopy() {
  const copy = document.querySelector('.detailed-plan-control p');
  setTextIfChanged(
    copy,
    'Use the concertina sections below for cross-cutting planning detail. Step-specific outputs, decisions, resources, risks, issues and assumptions are available inside the Delivery timeline cards above.'
  );
}

function refineDeliveryTimeline() {
  const panel = document.querySelector('.route-through-panel');
  if (!panel) return;

  setTextIfChanged(panel.querySelector('h2'), 'Delivery timeline');
  setTextIfChanged(
    panel.querySelector(':scope > .subtle'),
    'The main delivery route for this deliverable. Scroll across to see the sequence; use Show step detail on a card to reveal its outputs, decisions, resources, risks, issues and assumptions.'
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
      hasDetail ? '<span>Step detail available</span>' : '<span>No step detail yet</span>'
    ].filter(Boolean).join('');
    setHtmlIfChanged(signals, html);
  });

  refineStepDetailDisclosure();
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
  enableStepDetailsMode();
  removeReaderNavigation();
  syncWhyThisMattersPosition();
  moveValueEvidencePanel();
  refineDeliveryTimeline();
  refinePlanningDetailCopy();
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
  delete document.body.dataset.stepDetailsEnabledKey;
  document.querySelector('.planning-notice-clone')?.remove();
  scheduleRefreshDeliverablePage();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleRefreshDeliverablePage);
} else {
  scheduleRefreshDeliverablePage();
}
