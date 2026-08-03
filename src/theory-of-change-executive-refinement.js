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

function scopeTestBlock() {
  const section = element('section', 'toc-scope-test');
  section.id = 'toc-scope-test';

  const heading = element('div', 'toc-section-heading');
  append(
    heading,
    element('p', 'eyebrow', refinement.scopeTest.eyebrow),
    element('h3', '', refinement.scopeTest.title),
    element('p', '', refinement.scopeTest.summary)
  );

  const criteria = element('div', 'toc-scope-criteria');
  refinement.scopeTest.criteria.forEach((criterion, index) => {
    const card = element('article');
    append(
      card,
      element('span', '', String(index + 1).padStart(2, '0')),
      element('p', '', criterion)
    );
    criteria.appendChild(card);
  });

  const exclusion = element('p', 'toc-scope-exclusion');
  exclusion.appendChild(element('strong', '', 'If it cannot show a contribution: '));
  exclusion.appendChild(document.createTextNode(refinement.scopeTest.exclusion));

  return append(section, heading, criteria, exclusion);
}

function updateExecutiveOutcomes(theorySection) {
  const section = theorySection.querySelector('.toc-executive-outcomes');
  if (!section) return;

  const eyebrow = section.querySelector(':scope > .eyebrow');
  if (eyebrow) eyebrow.textContent = refinement.executiveOutcomes.eyebrow;

  const cards = section.querySelectorAll('.toc-executive-outcomes-grid article');
  refinement.executiveOutcomes.items.forEach((item, index) => {
    const card = cards[index];
    if (!card) return;
    const heading = card.querySelector('h3');
    const statement = card.querySelector('p');
    if (heading) heading.textContent = item.audience;
    if (statement) statement.textContent = item.statement;
  });
}

function addStrategicPremise(theorySection) {
  if (document.getElementById('toc-strategic-premise')) return;
  const problem = theorySection.querySelector('.toc-problem');
  if (problem) problem.insertAdjacentElement('beforebegin', strategicPremiseBlock());
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

function addScopeTest(theorySection) {
  if (document.getElementById('toc-scope-test')) return;
  const principles = document.getElementById('toc-operating-principles');
  if (principles) principles.insertAdjacentElement('afterend', scopeTestBlock());
}

function renderExecutiveRefinement() {
  const theorySection = document.getElementById('theory-of-change-home');
  if (!theorySection) return;

  updateExecutiveOutcomes(theorySection);
  addStrategicPremise(theorySection);
  addProofPoints(theorySection);
  addOperatingPrinciples(theorySection);
  addScopeTest(theorySection);
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
