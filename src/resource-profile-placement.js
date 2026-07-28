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
