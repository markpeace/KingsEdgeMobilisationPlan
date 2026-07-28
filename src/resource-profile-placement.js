function placeDeliverableResourceProfile() {
  const profileRoot = document.getElementById('resource-investment-profile-root');
  const deliveryTimeline = document.getElementById('route-through');

  if (!profileRoot || !deliveryTimeline) return false;

  const alreadyPlaced = profileRoot.parentElement === deliveryTimeline.parentElement
    && profileRoot.previousElementSibling === deliveryTimeline;
  if (alreadyPlaced) return true;

  deliveryTimeline.insertAdjacentElement('afterend', profileRoot);
  return true;
}

function schedulePlacement(attempt = 0) {
  window.requestAnimationFrame(() => {
    if (!placeDeliverableResourceProfile() && attempt < 10) {
      schedulePlacement(attempt + 1);
    }
  });
}

window.addEventListener('hashchange', () => schedulePlacement());
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => schedulePlacement(), { once: true });
} else {
  schedulePlacement();
}
