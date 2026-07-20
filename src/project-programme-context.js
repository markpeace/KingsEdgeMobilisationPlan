import programmeContexts from './data/project-programme-contexts.json';

function currentProjectId() {
  const match = String(window.location.hash || '').match(/#\/projects\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function renderProjectProgrammeContext() {
  const programme = programmeContexts[currentProjectId()];
  if (!programme) return;

  const context = document.querySelector('.project-detail-hero .project-context');
  if (context && context.textContent !== programme) context.textContent = programme;
}

let refreshScheduled = false;
function scheduleRefresh() {
  if (refreshScheduled) return;
  refreshScheduled = true;
  window.requestAnimationFrame(() => {
    refreshScheduled = false;
    renderProjectProgrammeContext();
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
