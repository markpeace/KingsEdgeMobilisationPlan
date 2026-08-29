function moveResourceProfileIntoMainFlow() {
  const root = document.getElementById('resource-investment-profile-root');
  const mainFlow = document.querySelector('.deliverable-main-flow');
  if (!root || !mainFlow) return;

  if (root.parentElement !== mainFlow) {
    mainFlow.appendChild(root);
  }

  root.style.order = '5';
  root.style.minWidth = '0';
}

let refreshScheduled = false;
function scheduleRefresh() {
  if (refreshScheduled) return;
  refreshScheduled = true;
  window.requestAnimationFrame(() => {
    refreshScheduled = false;
    moveResourceProfileIntoMainFlow();
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
