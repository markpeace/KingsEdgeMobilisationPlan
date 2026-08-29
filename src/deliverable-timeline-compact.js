import './styles/deliverable-timeline-compact.css';

function currentDeliverableKey() {
  return String(window.location.hash || '');
}

function ensureToggle(panel) {
  let toggle = panel.querySelector(':scope > .delivery-timeline-toggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'delivery-timeline-toggle';
    toggle.innerHTML = `
      <span class="delivery-timeline-toggle-copy">
        <strong>Delivery timeline</strong>
        <em></em>
      </span>
      <span class="delivery-timeline-toggle-action">Show</span>
    `;
    panel.insertAdjacentElement('afterbegin', toggle);
    toggle.addEventListener('click', () => {
      const collapsed = panel.classList.toggle('timeline-collapsed');
      toggle.setAttribute('aria-expanded', String(!collapsed));
      const action = toggle.querySelector('.delivery-timeline-toggle-action');
      if (action) action.textContent = collapsed ? 'Show' : 'Hide';
    });
  }
  return toggle;
}

function refineDeliverableTimeline() {
  const panel = document.getElementById('route-through');
  if (!panel) return;

  panel.classList.remove('reader-flow-source-route', 'route-composite-flow');
  panel.classList.add('timeline-collapsible');

  const key = currentDeliverableKey();
  if (panel.dataset.timelineInitialisedFor !== key) {
    panel.classList.add('timeline-collapsed');
    panel.dataset.timelineInitialisedFor = key;
  }

  const toggle = ensureToggle(panel);
  const count = panel.querySelectorAll('.steps-list > .step-card').length;
  const explainer = toggle.querySelector('.delivery-timeline-toggle-copy em');
  if (explainer) explainer.textContent = `${count} chronological ${count === 1 ? 'stage' : 'stages'} · open to see the route through this deliverable`;
  const collapsed = panel.classList.contains('timeline-collapsed');
  toggle.setAttribute('aria-expanded', String(!collapsed));
  const action = toggle.querySelector('.delivery-timeline-toggle-action');
  if (action) action.textContent = collapsed ? 'Show' : 'Hide';
}

let scheduled = false;
function scheduleRefine() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    refineDeliverableTimeline();
  });
}

const observer = new MutationObserver(scheduleRefine);
observer.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener('hashchange', scheduleRefine);

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleRefine);
else scheduleRefine();
