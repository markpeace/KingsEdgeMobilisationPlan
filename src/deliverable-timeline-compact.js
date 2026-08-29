import './styles/deliverable-timeline-compact.css';

function setText(node, text) {
  if (node && node.textContent !== text) node.textContent = text;
}

function refineDeliverableTimeline() {
  const panel = document.getElementById('route-through');
  if (!panel) return;

  panel.classList.add('compact-delivery-timeline');
  setText(panel.querySelector(':scope > h2'), 'Delivery timeline');
  setText(
    panel.querySelector(':scope > .subtle'),
    'The chronological route through this deliverable. Scan the stages here; open a step when you need its full purpose, outputs, resources, decisions, risks and assumptions.'
  );
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
