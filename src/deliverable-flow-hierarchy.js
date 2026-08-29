function deliverableIdFromHash() {
  const match = String(window.location.hash || '').match(/^#\/deliverables\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function placeBenefitsBeforeTimeline() {
  if (!deliverableIdFromHash()) return;

  const route = document.getElementById('route-through');
  const benefits = document.getElementById('value-evidence');
  if (!route || !benefits) return;

  benefits.classList.add('main-flow-benefits');

  const timelineHeading = route.querySelector(':scope > h2');
  if (benefits.parentElement !== route || benefits.nextElementSibling !== timelineHeading) {
    route.insertBefore(benefits, timelineHeading || route.firstChild);
  }

  const benefitsToggle = benefits.querySelector('.detail-accordion-header');
  if (benefitsToggle?.getAttribute('aria-expanded') === 'false') {
    benefitsToggle.click();
  }
}

let scheduled = false;
function schedulePlace() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    placeBenefitsBeforeTimeline();
  });
}

const observer = new MutationObserver(schedulePlace);
observer.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener('hashchange', schedulePlace);

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedulePlace);
else schedulePlace();
