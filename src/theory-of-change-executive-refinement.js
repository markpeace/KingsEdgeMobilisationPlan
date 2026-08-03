import refinement from './data/theory-of-change-executive-refinement.json';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function append(parent, ...children) {
  children.filter(Boolean).forEach((child) => parent.appendChild(child));
  return parent;
}

function setText(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}

function strategicPremiseBlock() {
  const section = element('section', 'toc-strategic-premise');
  section.id = 'toc-strategic-premise';

  refinement.strategicPremise.items.forEach((item) => {
    const card = element('article');
    append(
      card,
      element('p', 'eyebrow', item.eyebrow),
      element('h3', '', item.title),
      element('p', '', item.statement)
    );
    section.appendChild(card);
  });

  return section;
}

function leadershipBlock() {
  const section = element('section', 'toc-leadership');
  section.id = 'toc-leadership';

  const heading = element('div', 'toc-leadership-heading');
  append(
    heading,
    element('p', 'eyebrow', refinement.leadership.eyebrow),
    element('h3', '', refinement.leadership.title),
    element('p', '', refinement.leadership.intro)
  );

  const grid = element('div', 'toc-leadership-grid');
  refinement.leadership.items.forEach((item, index) => {
    const card = element('article');
    append(
      card,
      element('span', 'toc-leadership-number', String(index + 1).padStart(2, '0')),
      element('h4', '', item.title),
      element('p', '', item.statement)
    );
    grid.appendChild(card);
  });

  const claim = element('p', 'toc-leadership-claim', refinement.leadership.claim);
  return append(section, heading, grid, claim);
}

function mechanismIntroBlock() {
  const section = element('section', 'toc-mechanism-intro');
  section.id = 'toc-mechanism-intro';
  append(
    section,
    element('p', 'eyebrow', refinement.mechanismIntro.eyebrow),
    element('h3', '', refinement.mechanismIntro.title),
    element('p', '', refinement.mechanismIntro.summary)
  );
  return section;
}

function proofPointsBlock() {
  const section = element('section', 'toc-proof-points');
  section.id = 'toc-proof-points';

  const heading = element('div', 'toc-section-heading');
  append(
    heading,
    element('p', 'eyebrow', refinement.proofPoints.eyebrow),
    element('h3', '', refinement.proofPoints.title),
    element('p', '', refinement.proofPoints.intro)
  );

  const grid = element('ol', 'toc-proof-grid');
  refinement.proofPoints.items.forEach((item, index) => {
    const card = element('li');
    append(
      card,
      element('span', '', String(index + 1).padStart(2, '0')),
      element('p', '', item)
    );
    grid.appendChild(card);
  });

  return append(section, heading, grid);
}

function deliveryPrincipleBlock() {
  const details = element('details', 'toc-delivery-principle');
  details.id = 'toc-delivery-principle';

  const summary = element('summary');
  const heading = element('div');
  append(
    heading,
    element('p', 'eyebrow', refinement.deliveryPrinciple.eyebrow),
    element('h3', '', refinement.deliveryPrinciple.title),
    element('p', '', refinement.deliveryPrinciple.summary)
  );

  const toggle = element('span', 'toc-toggle');
  toggle.setAttribute('aria-hidden', 'true');
  append(summary, heading, toggle);

  details.appendChild(summary);
  details.appendChild(element('p', 'toc-delivery-principle-detail', refinement.deliveryPrinciple.detail));
  return details;
}

function updateExecutiveOutcomes(theorySection) {
  const section = theorySection.querySelector('.toc-executive-outcomes');
  if (!section) return;

  setText(section.querySelector(':scope > .eyebrow'), refinement.executiveOutcomes.eyebrow);

  const cards = section.querySelectorAll('.toc-executive-outcomes-grid article');
  refinement.executiveOutcomes.items.forEach((item, index) => {
    const card = cards[index];
    if (!card) return;
    setText(card.querySelector('h3'), item.audience);
    setText(card.querySelector('p'), item.statement);
  });
}

function addStrategicPremise(theorySection) {
  if (document.getElementById('toc-strategic-premise')) return;
  const problem = theorySection.querySelector('.toc-problem');
  if (problem) problem.insertAdjacentElement('beforebegin', strategicPremiseBlock());
}

function addLeadership(theorySection) {
  if (document.getElementById('toc-leadership')) return;
  const premise = document.getElementById('toc-strategic-premise');
  if (premise) premise.insertAdjacentElement('afterend', leadershipBlock());
}

function addMechanismIntro(theorySection) {
  if (document.getElementById('toc-mechanism-intro')) return;
  const flow = theorySection.querySelector('.toc-flow');
  if (flow) flow.insertAdjacentElement('beforebegin', mechanismIntroBlock());
}

function addProofPoints(theorySection) {
  if (document.getElementById('toc-proof-points')) return;
  const outcomes = theorySection.querySelector('.toc-executive-outcomes');
  if (outcomes) outcomes.insertAdjacentElement('afterend', proofPointsBlock());
}

function addOperatingPrinciples(theorySection) {
  if (document.getElementById('toc-operating-principles')) return;

  const faculty = theorySection.querySelector('.toc-faculty');
  if (!faculty) return;

  const wrapper = element('section', 'toc-operating-principles');
  wrapper.id = 'toc-operating-principles';
  faculty.insertAdjacentElement('beforebegin', wrapper);
  wrapper.appendChild(faculty);
  wrapper.appendChild(deliveryPrincipleBlock());
}

function removeBenchedContent() {
  document.getElementById('toc-scope-test')?.remove();
}

function renderExecutiveRefinement() {
  const theorySection = document.getElementById('theory-of-change-home');
  if (!theorySection) return;

  removeBenchedContent();
  updateExecutiveOutcomes(theorySection);
  addStrategicPremise(theorySection);
  addLeadership(theorySection);
  addMechanismIntro(theorySection);
  addProofPoints(theorySection);
  addOperatingPrinciples(theorySection);
}

let refreshScheduled = false;
function scheduleRefresh() {
  if (refreshScheduled) return;
  refreshScheduled = true;
  window.requestAnimationFrame(() => {
    refreshScheduled = false;
    renderExecutiveRefinement();
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
