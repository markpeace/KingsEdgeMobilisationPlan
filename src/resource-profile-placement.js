let placementScheduled = false;

function currentDeliverableId() {
  const match = String(window.location.hash || '').match(/#\/deliverables\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function placeDeliverableResourceProfile() {
  if (!currentDeliverableId()) return false;

  const profileRoot = document.getElementById('resource-investment-profile-root');
  const governanceSection = document.getElementById('governance');

  if (!profileRoot || !governanceSection) return false;

  // The deliverable page is an ordered CSS grid. Without an explicit order,
  // this dynamically mounted panel is visually promoted above the authored
  // sections even when its DOM position is correct. Order 6 places it after
  // the Delivery timeline (4) and before proposition/governance detail (7+).
  profileRoot.style.order = '6';

  const alreadyPlaced = profileRoot.parentElement === governanceSection.parentElement
    && profileRoot.nextElementSibling === governanceSection;
  if (alreadyPlaced) return true;

  governanceSection.insertAdjacentElement('beforebegin', profileRoot);
  return true;
}

function schedulePlacement() {
  if (placementScheduled) return;
  placementScheduled = true;
  window.requestAnimationFrame(() => {
    placementScheduled = false;
    placeDeliverableResourceProfile();
  });
}

const observer = new MutationObserver(schedulePlacement);
observer.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener('hashchange', schedulePlacement);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', schedulePlacement, { once: true });
} else {
  schedulePlacement();
}
