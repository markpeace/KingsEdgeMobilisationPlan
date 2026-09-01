import { buildLookups, getStepDependencies, projects } from './plan-utils.js';
import { allocateStepLanes } from './timeline-utils.js';

const STORAGE_KEY = 'kings-edge-timeline-period-width';
const DEFAULT_WIDTH = 112;
const MIN_WIDTH = 64;
const MAX_WIDTH = 176;
const STEP = 8;
const ROW_HEADER_WIDTH = 260;
const TIMELINE_STRUCTURE_SELECTOR = '.ke-timeline-page, .ke-timeline-toolbar, .ke-timeline-header, .ke-timeline-row, .ke-timeline-segment';
const { idMap: timelineIdMap } = buildLookups(projects);

let replayingStepClick = false;
let stepInteractionVersion = 0;

function storedWidth() {
  const value = Number(window.localStorage.getItem(STORAGE_KEY));
  return Number.isFinite(value) && value >= MIN_WIDTH && value <= MAX_WIDTH ? value : DEFAULT_WIDTH;
}

function positionTodayLabel(timeline, periodCount) {
  timeline.querySelector('.ke-timeline-today-label')?.remove();

  const todayLine = timeline.querySelector('.ke-timeline-today-line');
  const currentSegment = timeline.querySelector('.ke-timeline-segment.is-current');
  const label = currentSegment?.querySelector('strong');
  const percentage = Number.parseFloat(todayLine?.style.left || '');

  if (!todayLine || !currentSegment || !label || !Number.isFinite(percentage)) return;

  const segments = [...timeline.querySelectorAll('.ke-timeline-segment')];
  const currentIndex = segments.indexOf(currentSegment);
  if (currentIndex < 0) return;

  const positionAcrossPeriods = (percentage / 100) * periodCount;
  const fractionWithinCurrentPeriod = Math.max(0, Math.min(1, positionAcrossPeriods - currentIndex));
  label.style.left = `${fractionWithinCurrentPeriod * 100}%`;
}

function setGridWidth(width) {
  const timeline = document.querySelector('.ke-timeline-page');
  if (!timeline) return;

  const periodCount = timeline.querySelectorAll('.ke-timeline-segment').length;
  if (!periodCount) return;

  const outerColumns = `${ROW_HEADER_WIDTH}px repeat(${periodCount}, ${width}px)`;
  const laneColumns = `repeat(${periodCount}, ${width}px)`;
  const minimumWidth = `${ROW_HEADER_WIDTH + periodCount * width}px`;

  timeline.querySelectorAll('.ke-timeline-header-row, .ke-timeline-row').forEach((row) => {
    row.style.setProperty('grid-template-columns', outerColumns, 'important');
    row.style.setProperty('min-width', minimumWidth, 'important');
  });

  timeline.querySelectorAll('.ke-timeline-lane').forEach((lane) => {
    lane.style.setProperty('grid-template-columns', laneColumns, 'important');
  });

  positionTodayLabel(timeline, periodCount);
}

function visibleGridSpan(button) {
  const shorthand = button.style.gridColumn || '';
  const shorthandMatch = shorthand.match(/^\s*(\d+)\s*\/\s*span\s+(\d+)\s*$/i);
  if (shorthandMatch) {
    const startIndex = Number(shorthandMatch[1]);
    const span = Number(shorthandMatch[2]);
    return { startIndex, endIndex: startIndex + span - 1 };
  }

  const startIndex = Number.parseInt(button.style.gridColumnStart, 10);
  const spanMatch = String(button.style.gridColumnEnd || '').match(/^span\s+(\d+)$/i);
  const span = spanMatch ? Number(spanMatch[1]) : Number.NaN;
  if (!Number.isFinite(startIndex) || !Number.isFinite(span)) return null;
  return { startIndex, endIndex: startIndex + span - 1 };
}

function applyDependencyAwareLanes() {
  const timeline = document.querySelector('.ke-timeline-page');
  if (!timeline) return;

  timeline.querySelectorAll('.ke-timeline-lane').forEach((lane) => {
    const buttons = [...lane.querySelectorAll('.ke-timeline-step')];
    const entries = buttons.map((button, sourceOrder) => {
      const id = button.dataset.stepId;
      const span = visibleGridSpan(button);
      const stepEntry = timelineIdMap.get(id);
      if (!id || !span) return null;

      return {
        id,
        ...span,
        sourceOrder,
        dependencyIds: stepEntry?.type === 'step' ? getStepDependencies(stepEntry.item) : []
      };
    }).filter(Boolean);

    if (!entries.length) return;

    const allocation = allocateStepLanes(entries);
    buttons.forEach((button) => {
      const laneIndex = allocation.laneById[button.dataset.stepId];
      if (laneIndex === undefined) return;
      button.style.setProperty('grid-row', String(laneIndex + 1), 'important');
    });
    lane.style.setProperty('grid-template-rows', `repeat(${allocation.laneCount}, 62px)`, 'important');
  });
}

function scaleDescription(width) {
  if (width <= 80) return 'Compact';
  if (width >= 152) return 'Expanded';
  return 'Working view';
}

function installScaleControl() {
  const toolbar = document.querySelector('.ke-timeline-page .ke-timeline-toolbar');
  if (!toolbar) return;

  let control = toolbar.querySelector('.ke-timeline-scale-control');
  if (!control) {
    control = document.createElement('label');
    control.className = 'ke-timeline-scale-control';
    control.innerHTML = `
      <span>Timeline scale <output class="ke-timeline-scale-output"></output></span>
      <div class="ke-timeline-scale-input-row">
        <small>Compact</small>
        <input type="range" min="${MIN_WIDTH}" max="${MAX_WIDTH}" step="${STEP}" aria-label="Timeline column width" />
        <small>Expanded</small>
      </div>
    `;
    toolbar.append(control);
  }

  const input = control.querySelector('input[type="range"]');
  const output = control.querySelector('.ke-timeline-scale-output');
  if (!input || !output) return;

  const apply = (value) => {
    const width = Number(value);
    input.value = String(width);
    output.value = scaleDescription(width);
    output.textContent = scaleDescription(width);
    setGridWidth(width);
  };

  if (!input.dataset.bound) {
    input.dataset.bound = 'true';
    input.addEventListener('input', () => {
      window.localStorage.setItem(STORAGE_KEY, input.value);
      apply(input.value);
    });
  }

  apply(storedWidth());
}

function replaceTrailingLabel(container, label) {
  if (!container) return;
  const textNode = [...container.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
  if (textNode) textNode.textContent = ` ${label}`;
  else container.append(` ${label}`);
}

function updateDependencyLabels() {
  const timeline = document.querySelector('.ke-timeline-page');
  const onwardKey = timeline?.querySelector('.ke-key-box.is-onward')?.parentElement;
  replaceTrailingLabel(onwardKey, 'Enables');

  document.querySelectorAll('.ke-timeline-modal-grid h3').forEach((heading) => {
    if (heading.textContent.trim() === 'Feeds into') heading.textContent = 'Enables';
  });
}

function dependencyHistoryFor(stepId) {
  const history = new Set();

  const visit = (id) => {
    const entry = timelineIdMap.get(id);
    if (entry?.type !== 'step') return;

    getStepDependencies(entry.item).forEach((dependencyId) => {
      if (!dependencyId || dependencyId === stepId || history.has(dependencyId)) return;
      history.add(dependencyId);
      visit(dependencyId);
    });
  };

  visit(stepId);
  return history;
}

function directOnwardFor(stepId) {
  const onward = new Set();
  for (const [id, entry] of timelineIdMap.entries()) {
    if (entry?.type !== 'step') continue;
    if (getStepDependencies(entry.item).includes(stepId)) onward.add(id);
  }
  return onward;
}

function ensureDependencyLens(timeline) {
  let lens = timeline?.querySelector('.ke-timeline-dependency-lens');
  if (lens) return lens;

  const key = timeline?.querySelector('.ke-timeline-key');
  if (!timeline || !key) return null;

  lens = document.createElement('section');
  lens.className = 'ke-timeline-dependency-lens';
  lens.setAttribute('aria-live', 'polite');
  lens.innerHTML = `
    <div class="ke-timeline-dependency-lens-copy">
      <span class="ke-timeline-dependency-lens-kicker">Dependency lens</span>
      <strong class="ke-timeline-dependency-lens-title">Trace a delivery step</strong>
      <p class="ke-timeline-dependency-lens-context"></p>
      <p class="ke-timeline-dependency-lens-help">Select a step to show what it relies on and what it enables. Double-click a step for full detail.</p>
    </div>
    <div class="ke-timeline-dependency-lens-stats" aria-label="Selected step dependency summary">
      <span class="ke-timeline-dependency-lens-stat"><strong data-ke-lens-prerequisites>0</strong><span>Prerequisites</span></span>
      <span class="ke-timeline-dependency-lens-stat"><strong data-ke-lens-enables>0</strong><span>Directly enables</span></span>
    </div>
  `;
  key.before(lens);
  return lens;
}

function updateDependencyLens(timeline = document.querySelector('.ke-timeline-page')) {
  if (!timeline) return;

  const lens = ensureDependencyLens(timeline);
  if (!lens) return;

  const title = lens.querySelector('.ke-timeline-dependency-lens-title');
  const context = lens.querySelector('.ke-timeline-dependency-lens-context');
  const help = lens.querySelector('.ke-timeline-dependency-lens-help');
  const prerequisiteCount = lens.querySelector('[data-ke-lens-prerequisites]');
  const enablesCount = lens.querySelector('[data-ke-lens-enables]');
  const selectedButton = timeline.querySelector('.ke-timeline-step[aria-pressed="true"], .ke-timeline-step.is-selected');
  const selectedStepId = selectedButton?.dataset.stepId;

  if (!selectedStepId) {
    lens.classList.remove('is-active');
    if (title) title.textContent = 'Trace a delivery step';
    if (context) context.textContent = '';
    if (help) help.textContent = 'Select a step to show what it relies on and what it enables. Double-click a step for full detail.';
    if (prerequisiteCount) prerequisiteCount.textContent = '0';
    if (enablesCount) enablesCount.textContent = '0';
    return;
  }

  const entry = timelineIdMap.get(selectedStepId);
  const selectedTitle = selectedButton.querySelector('.ke-timeline-step-title')?.textContent?.trim() || entry?.item?.title || selectedStepId;
  const parentLabel = [entry?.parent?.displayId || entry?.parent?.id, entry?.parent?.title].filter(Boolean).join(' ');

  lens.classList.add('is-active');
  if (title) title.textContent = selectedTitle;
  if (context) context.textContent = parentLabel;
  if (help) help.textContent = 'Click the selected step again or clear the highlight to return to the full plan. Double-click for full detail.';
  if (prerequisiteCount) prerequisiteCount.textContent = String(dependencyHistoryFor(selectedStepId).size);
  if (enablesCount) enablesCount.textContent = String(directOnwardFor(selectedStepId).size);
}

function clearTransitiveDependencyHighlight(timeline) {
  timeline?.querySelectorAll('[data-ke-transitive-dependency="true"]').forEach((button) => {
    button.classList.remove('is-prerequisite');
    delete button.dataset.keTransitiveDependency;
  });
}

function applyDependencyHistory() {
  const timeline = document.querySelector('.ke-timeline-page');
  if (!timeline) return;

  const selectedButton = timeline.querySelector('.ke-timeline-step[aria-pressed="true"], .ke-timeline-step.is-selected');
  const selectedStepId = selectedButton?.dataset.stepId;
  if (!selectedStepId) return;

  const history = dependencyHistoryFor(selectedStepId);
  timeline.querySelectorAll('[data-step-id]').forEach((button) => {
    if (!history.has(button.dataset.stepId) || button.classList.contains('is-prerequisite')) return;
    button.classList.remove('is-dimmed');
    button.classList.add('is-prerequisite');
    button.dataset.keTransitiveDependency = 'true';
  });
}

function replayStepClick(button) {
  replayingStepClick = true;
  button.click();
  replayingStepClick = false;
}

function clearHighlight(timeline) {
  clearTransitiveDependencyHighlight(timeline);
  const clearButton = timeline?.querySelector('.ke-timeline-key .ke-text-button');
  clearButton?.click();
  window.requestAnimationFrame(() => updateDependencyLens(timeline));
}

function selectStepWithoutModal(button, timeline) {
  const interactionVersion = ++stepInteractionVersion;
  clearTransitiveDependencyHighlight(timeline);
  replayStepClick(button);

  window.requestAnimationFrame(() => {
    if (interactionVersion !== stepInteractionVersion) return;
    document.querySelector('.ke-timeline-modal-close')?.click();
    applyDependencyHistory();
    updateDependencyLens(timeline);
  });
}

function toggleStepHighlight(button, timeline) {
  const isSelected = button.getAttribute('aria-pressed') === 'true' || button.classList.contains('is-selected');
  if (isSelected) {
    stepInteractionVersion += 1;
    clearHighlight(timeline);
    return;
  }

  selectStepWithoutModal(button, timeline);
}

function openStepModal(button, timeline) {
  stepInteractionVersion += 1;
  clearTransitiveDependencyHighlight(timeline);
  replayStepClick(button);
  window.requestAnimationFrame(() => {
    updateDependencyLabels();
    applyDependencyHistory();
    updateDependencyLens(timeline);
  });
}

function installStepClickBehaviour() {
  const timeline = document.querySelector('.ke-timeline-page');
  if (!timeline || timeline.dataset.stepClickBehaviourBound === 'true') return;

  timeline.dataset.stepClickBehaviourBound = 'true';
  timeline.addEventListener('click', (event) => {
    const button = event.target.closest('.ke-timeline-step');
    if (!button || replayingStepClick) return;

    // Keyboard activation has no click count, so retain the existing accessible modal behaviour.
    if (event.detail === 0) {
      window.requestAnimationFrame(() => {
        updateDependencyLabels();
        applyDependencyHistory();
        updateDependencyLens(timeline);
      });
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (event.detail >= 2) {
      openStepModal(button, timeline);
      return;
    }

    toggleStepHighlight(button, timeline);
  }, true);

  timeline.querySelectorAll('.ke-timeline-step').forEach((button) => {
    button.title = 'Click to toggle highlight · double-click for details';
  });
}

function installEmptySpaceDeselect() {
  const timeline = document.querySelector('.ke-timeline-page');
  if (!timeline || timeline.dataset.emptySpaceDeselectBound === 'true') return;

  timeline.dataset.emptySpaceDeselectBound = 'true';
  timeline.addEventListener('click', (event) => {
    const lane = event.target.closest('.ke-timeline-lane');
    if (!lane || event.target.closest('.ke-timeline-step')) return;
    clearHighlight(timeline);
  });
}

let scheduled = false;
function refreshTimelineScale() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    installScaleControl();
    installStepClickBehaviour();
    installEmptySpaceDeselect();
    updateDependencyLabels();
    setGridWidth(storedWidth());
    applyDependencyAwareLanes();
    applyDependencyHistory();
    updateDependencyLens();
  });
}

function nodeAffectsTimelineStructure(node) {
  if (!(node instanceof Element)) return false;
  return node.matches(TIMELINE_STRUCTURE_SELECTOR) || Boolean(node.querySelector(TIMELINE_STRUCTURE_SELECTOR));
}

const observer = new MutationObserver((mutations) => {
  const timelineStructureChanged = mutations.some((mutation) => (
    [...mutation.addedNodes, ...mutation.removedNodes].some(nodeAffectsTimelineStructure)
  ));

  if (timelineStructureChanged) refreshTimelineScale();
});

observer.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener('hashchange', refreshTimelineScale);
window.addEventListener('DOMContentLoaded', refreshTimelineScale);
refreshTimelineScale();
