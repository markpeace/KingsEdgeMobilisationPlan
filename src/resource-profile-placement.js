let placementScheduled = false;

function currentDeliverableId() {
  const match = String(window.location.hash || '').match(/#\/deliverables\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function placeDeliverableResourceProfile() {
  if (!currentDeliverableId()) return false;

  const profileRoot = document.getElementById('resource-investment-profile-root');
  const deliveryTimeline = document.getElementById('route-through');
  const governanceSection = document.getElementById('governance');

  if (!profileRoot || !deliveryTimeline || !governanceSection) return false;

  /*
   * The deliverable main flow is an ordered CSS grid and the detailed-plan
   * wrapper uses display: contents. DOM placement alone is therefore not
   * enough: an unnumbered dynamic item receives order 0 and is rendered near
   * the top of the page.
   *
   * Give the profile the same order as the Delivery timeline. Because the
   * profile occurs later in source order, the browser renders it immediately
   * after the timeline, before decision, proposition and governance sections.
   */
  const timelineOrder = window.getComputedStyle(deliveryTimeline).order;
  profileRoot.style.order = timelineOrder === 'auto' ? '4' : timelineOrder;

  const correctlyPlaced = profileRoot.parentElement === governanceSection.parentElement
    && profileRoot.nextElementSibling === governanceSection;
  if (!correctlyPlaced) governanceSection.insertAdjacentElement('beforebegin', profileRoot);

  return profileRoot.parentElement === governanceSection.parentElement
    && profileRoot.nextElementSibling === governanceSection
    && window.getComputedStyle(profileRoot).order === profileRoot.style.order;
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
