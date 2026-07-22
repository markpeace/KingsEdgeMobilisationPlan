const STORAGE_KEY = 'kings-edge-timeline-period-width';
const DEFAULT_WIDTH = 112;
const MIN_WIDTH = 64;
const MAX_WIDTH = 176;
const STEP = 8;
const ROW_HEADER_WIDTH = 260;
const TIMELINE_STRUCTURE_SELECTOR = '.ke-timeline-page, .ke-timeline-toolbar, .ke-timeline-header, .ke-timeline-row, .ke-timeline-segment';

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

let scheduled = false;
function refreshTimelineScale() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    installScaleControl();
    setGridWidth(storedWidth());
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
