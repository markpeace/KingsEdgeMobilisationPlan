const readerModeLabels = [
  ['Headline view', 'Delivery logic, delivery timeline, decisions and key dependencies.'],
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

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
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

function syncWhyThisMattersPosition() {
  const mainFlow = document.querySelector('.deliverable-main-flow');
  const casePanel = mainFlow?.querySelector('.case-panel');
  const firstAnchor = mainFlow?.querySelector('.planning-notice + .at-a-glance-panel, .at-a-glance-panel');
  if (!mainFlow || !casePanel || !firstAnchor || casePanel.nextElementSibling === firstAnchor) return;
  mainFlow.insertBefore(casePanel, firstAnchor);
}

function caseCardText(title) {
  const cards = [...document.querySelectorAll('.case-panel .schema-card')];
  const card = cards.find((item) => item.querySelector('h3')?.textContent?.trim() === title);
  return card?.querySelector('p')?.textContent?.trim() || '';
}

function heroSummaryText() {
  return document.querySelector('.detail-hero:not(.project-detail-hero) > p')?.textContent?.trim() || '';
}

function listItemsHtml(items, ordered = false) {
  if (!items.length) return '';
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${tag}>`;
}

function refineDeliveryLogicPanel() {
  const panel = document.querySelector('.at-a-glance-panel');
  if (!panel) return;

  panel.classList.add('delivery-logic-panel');
  setTextIfChanged(panel.querySelector('h2'), 'Delivery logic');
  const indexLink = document.querySelector('.deliverable-page-index a[href="#overview"]');
  setTextIfChanged(indexLink, 'Delivery logic');

  const changeText = caseCardText('Intended change') || caseCardText('Opportunity') || heroSummaryText();
  const stepCards = [...document.querySelectorAll('.route-through-panel .step-card')];
  const firstStep = stepCards[0];
  const lastStep = stepCards[stepCards.length - 1];
  const firstPeriod = firstStep?.querySelector('.period-pill')?.textContent?.trim();
  const lastPeriod = lastStep?.querySelector('.period-pill')?.textContent?.trim();
  const firstTitle = firstStep?.querySelector('h3')?.textContent?.trim();
  const lastTitle = lastStep?.querySelector('h3')?.textContent?.trim();
  const routeText = stepCards.length
    ? `${stepCards.length} sequenced delivery steps${firstPeriod && lastPeriod ? `, from ${firstPeriod} to ${lastPeriod}` : ''}.`
    : 'No delivery steps captured yet.';
  const routeDetail = firstTitle && lastTitle && firstTitle !== lastTitle ? `${firstTitle} → ${lastTitle}` : '';
  const criticalPath = stepCards.slice(0, 5).map((card) => card.querySelector('h3')?.textContent?.trim()).filter(Boolean);
  const dependencyLinks = [...document.querySelectorAll('.decision-dependency-panel .decision-dependency-grid > div:nth-child(2) .chip')]
    .filter((chip) => !chip.classList.contains('internal-dependency-hidden') && !chip.closest('.internal-dependency-hidden'))
    .map((chip) => chip.textContent?.trim())
    .filter(Boolean);
  const decisionCount = document.querySelectorAll('.decision-dependency-panel .decision-card-stack article').length;

  const handoffText = dependencyLinks.length
    ? 'Cross-deliverable links captured.'
    : 'No cross-deliverable handoffs captured yet.';
  const decisionText = decisionCount
    ? `${decisionCount} deliverable-level decision${decisionCount === 1 ? '' : 's'} captured.`
    : 'No deliverable-level decisions captured yet.';

  const html = `
    <p class="subtle delivery-logic-intro">A quick read of the change this deliverable is trying to make, how the work moves, and where it connects.</p>
    <div class="delivery-logic-grid">
      <article class="delivery-logic-card delivery-logic-card-wide">
        <span>Change to unlock</span>
        <p>${escapeHtml(changeText || 'No intended change captured yet.')}</p>
      </article>
      <article class="delivery-logic-card">
        <span>How it moves</span>
        <strong>${escapeHtml(routeText)}</strong>
        ${routeDetail ? `<p>${escapeHtml(routeDetail)}</p>` : ''}
      </article>
      <article class="delivery-logic-card">
        <span>Critical path</span>
        ${criticalPath.length ? listItemsHtml(criticalPath, true) : '<p>No delivery path captured yet.</p>'}
      </article>
      <article class="delivery-logic-card">
        <span>Decisions and handoffs</span>
        <strong>${escapeHtml(decisionText)}</strong>
        <p>${escapeHtml(handoffText)}</p>
        ${dependencyLinks.length ? listItemsHtml(dependencyLinks.slice(0, 4), false) : ''}
      </article>
    </div>
  `;

  const grid = panel.querySelector('.at-a-glance-grid');
  if (grid) {
    const container = document.createElement('div');
    container.innerHTML = html;
    grid.replaceWith(...container.childNodes);
  } else {
    const currentIntro = panel.querySelector('.delivery-logic-intro');
    const currentGrid = panel.querySelector('.delivery-logic-grid');
    const currentHtml = `${currentIntro?.outerHTML || ''}${currentGrid?.outerHTML || ''}`;
    if (currentHtml !== html.replace(/\n\s+/g, '')) {
      [...panel.children].forEach((child) => {
        if (child.tagName !== 'H2') child.remove();
      });
      panel.insertAdjacentHTML('beforeend', html);
    }
  }
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
  syncWhyThisMattersPosition();
  refineDeliveryTimeline();
  refineCrossDeliverableDependencies();
  refineDeliveryLogicPanel();

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
          syncWhyThisMattersPosition();
          refineDeliveryTimeline();
          refineCrossDeliverableDependencies();
          refineDeliveryLogicPanel();
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
      syncWhyThisMattersPosition();
      refineDeliveryTimeline();
      refineCrossDeliverableDependencies();
      refineDeliveryLogicPanel();
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
