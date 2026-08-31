let projectRefreshScheduled = false;

function setProjectTextIfChanged(node, text) {
  if (node && node.textContent !== text) node.textContent = text;
}

function refineProjectProposition() {
  const hero = document.querySelector('.project-detail-hero');
  const source = hero?.querySelector(':scope > .detail-summary');
  if (!hero || !source) return;

  let details = hero.querySelector(':scope > .hero-proposition-detail');
  if (!details) {
    details = document.createElement('details');
    details.className = 'hero-proposition-detail project-proposition-detail';

    const summary = document.createElement('summary');
    summary.textContent = 'Read full project proposition';

    const body = document.createElement('p');
    details.append(summary, body);

    const meta = hero.querySelector(':scope > .detail-meta');
    (meta || hero).insertAdjacentElement(meta ? 'beforebegin' : 'beforeend', details);
  }

  setProjectTextIfChanged(details.querySelector('p'), source.textContent?.trim() || '');
  source.hidden = true;
}

function updateProjectResourceDisclosure(details) {
  const action = details?.querySelector(':scope > summary .ds-disclosure-action');
  if (!action) return;
  setProjectTextIfChanged(action, details.open ? 'Hide' : 'Show');
}

function projectResourceDetailNodes(body, details) {
  return [...body.children].filter((node) => {
    if (node === details) return false;
    return node.classList.contains('resource-profile-section') || node.classList.contains('resource-secondary-detail');
  });
}

function refineProjectResourceProfile() {
  if (!document.querySelector('.project-detail-hero')) return;

  const profile = document.querySelector('#resource-investment-profile');
  const body = profile?.querySelector(':scope > .resource-profile-body');
  if (!profile || !body) return;

  let details = body.querySelector(':scope > .project-resource-detail');
  const nodes = projectResourceDetailNodes(body, details);
  if (!details && !nodes.length) return;

  if (!details) {
    details = document.createElement('details');
    details.className = 'ds-disclosure project-resource-detail';

    const summary = document.createElement('summary');
    summary.className = 'ds-disclosure-trigger';
    summary.innerHTML = `
      <span class="ds-disclosure-title">Full resource plan</span>
      <em class="ds-disclosure-summary">People, capacity, BAU destination, other investment and supporting planning detail.</em>
      <strong class="ds-disclosure-action">Show</strong>
    `;

    const detailBody = document.createElement('div');
    detailBody.className = 'ds-disclosure-body project-resource-detail-body';
    details.append(summary, detailBody);

    const firstDetailedNode = nodes[0];
    body.insertBefore(details, firstDetailedNode || null);
    details.addEventListener('toggle', () => updateProjectResourceDisclosure(details));
  }

  const detailBody = details.querySelector(':scope > .project-resource-detail-body');
  projectResourceDetailNodes(body, details).forEach((node) => detailBody?.appendChild(node));
  updateProjectResourceDisclosure(details);
}

function refreshProjectPage() {
  projectRefreshScheduled = false;
  refineProjectProposition();
  refineProjectResourceProfile();
}

function scheduleRefreshProjectPage() {
  if (projectRefreshScheduled) return;
  projectRefreshScheduled = true;
  window.requestAnimationFrame(refreshProjectPage);
}

const projectPageObserver = new MutationObserver(scheduleRefreshProjectPage);
projectPageObserver.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener('hashchange', scheduleRefreshProjectPage);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleRefreshProjectPage);
} else {
  scheduleRefreshProjectPage();
}
