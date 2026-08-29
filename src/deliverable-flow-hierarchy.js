function deliverableIdFromHash() {
  const match = String(window.location.hash || '').match(/^#\/deliverables\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function promoteBenefitsAndWorkstreams() {
  if (!deliverableIdFromHash()) return;

  const mainFlow = document.querySelector('.deliverable-main-flow');
  const route = document.getElementById('route-through');
  const benefits = document.getElementById('value-evidence');
  if (!mainFlow || !route || !benefits) return;

  benefits.classList.add('main-flow-benefits');

  if (benefits.parentElement !== mainFlow || benefits.nextElementSibling !== route) {
    mainFlow.insertBefore(benefits, route);
  }

  const benefitsToggle = benefits.querySelector('.detail-accordion-header');
  if (benefitsToggle?.getAttribute('aria-expanded') === 'false') {
    benefitsToggle.click();
    return;
  }

  const workstreams = document.getElementById('workstreams');
  if (workstreams) {
    workstreams.classList.add('main-flow-workstreams');
    if (workstreams.parentElement !== mainFlow || workstreams.previousElementSibling !== benefits) {
      benefits.insertAdjacentElement('afterend', workstreams);
    }
  }
}

let scheduled = false;
function schedulePromote() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    promoteBenefitsAndWorkstreams();
  });
}

const observer = new MutationObserver(schedulePromote);
observer.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener('hashchange', schedulePromote);

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedulePromote);
else schedulePromote();
