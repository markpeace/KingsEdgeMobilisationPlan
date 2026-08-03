import theoryOfChange from './data/theory-of-change.json';

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

function list(items = [], className = '') {
  const node = element('ul', className);
  items.forEach((item) => node.appendChild(element('li', '', item)));
  return node;
}

function mechanismCard(mechanism) {
  const details = element('details', 'toc-mechanism');
  const summary = element('summary');
  const toggle = element('span', 'toc-toggle');
  toggle.setAttribute('aria-hidden', 'true');
  append(
    summary,
    element('span', 'toc-step', mechanism.id),
    element('span', 'toc-quality', mechanism.quality),
    element('strong', 'toc-card-title', mechanism.title),
    element('span', 'toc-card-hook', mechanism.hook),
    toggle
  );

  const depth = element('div', 'toc-mechanism-depth');
  append(
    depth,
    element('p', 'toc-formal-title', mechanism.formalTitle),
    element('p', 'toc-mechanism-summary', mechanism.summary)
  );

  const levers = element('div', 'toc-levers');
  mechanism.levers.forEach((lever) => {
    const card = element('article', 'toc-lever');
    append(card, element('h4', '', lever.title), element('p', '', lever.description));
    levers.appendChild(card);
  });
  depth.appendChild(levers);

  const claim = element('div', 'toc-causal-claim');
  append(claim, element('span', '', 'Causal claim'), element('p', '', mechanism.causalClaim));
  depth.appendChild(claim);

  const outcomes = element('div', 'toc-outcomes');
  append(outcomes, element('h4', '', 'If this works'), list(mechanism.outcomes));
  depth.appendChild(outcomes);

  append(details, summary, depth);
  return details;
}

function headingBlock() {
  const heading = element('div', 'toc-home-heading');
  const title = element('h2', '', theoryOfChange.headline);
  title.id = 'theory-of-change-title';
  append(
    heading,
    element('p', 'eyebrow', theoryOfChange.eyebrow),
    title,
    element('p', 'toc-intro', theoryOfChange.intro),
    element('p', 'toc-status', theoryOfChange.status)
  );
  return heading;
}

function problemBlock() {
  const problem = element('article', 'toc-problem');
  const body = element('div');
  append(
    body,
    element('h3', '', theoryOfChange.problem.summary),
    element('p', '', theoryOfChange.problem.detail)
  );
  return append(problem, element('span', '', theoryOfChange.problem.label), body);
}

function executiveOutcomesBlock() {
  const section = element('section', 'toc-executive-outcomes');
  section.appendChild(element('p', 'eyebrow', theoryOfChange.executiveOutcomes.eyebrow));
  const grid = element('div', 'toc-executive-outcomes-grid');
  theoryOfChange.executiveOutcomes.items.forEach((item) => {
    const card = element('article');
    append(card, element('h3', '', item.audience), element('p', '', item.statement));
    grid.appendChild(card);
  });
  section.appendChild(grid);
  return section;
}

function facultyEnablementBlock() {
  const details = element('details', 'toc-faculty');
  const summary = element('summary');
  const heading = element('div');
  append(
    heading,
    element('p', 'eyebrow', theoryOfChange.facultyEnablement.eyebrow),
    element('h3', '', theoryOfChange.facultyEnablement.title),
    element('p', '', theoryOfChange.facultyEnablement.summary)
  );
  const toggle = element('span', 'toc-toggle');
  toggle.setAttribute('aria-hidden', 'true');
  append(summary, heading, toggle);
  details.appendChild(summary);
  details.appendChild(element('p', 'toc-faculty-detail', theoryOfChange.facultyEnablement.detail));
  return details;
}

function equityBlock() {
  const equity = element('article', 'toc-equity');
  const heading = element('div');
  append(
    heading,
    element('p', 'eyebrow', theoryOfChange.equity.eyebrow),
    element('h3', '', theoryOfChange.equity.title)
  );
  const body = element('div');
  append(
    body,
    element('p', 'toc-equity-summary', theoryOfChange.equity.summary),
    element('p', '', theoryOfChange.equity.detail)
  );
  return append(equity, heading, body);
}

function feedbackBlock() {
  const feedback = element('article', 'toc-feedback-loop');
  const marker = element('span', 'toc-feedback-marker', '↺');
  marker.setAttribute('aria-hidden', 'true');
  const body = element('div');
  append(
    body,
    element('p', 'eyebrow', theoryOfChange.feedback.eyebrow),
    element('h3', '', theoryOfChange.feedback.title),
    element('p', '', theoryOfChange.feedback.summary)
  );
  return append(feedback, marker, body);
}

function northStarBlock() {
  const northStar = element('article', 'toc-north-star');
  return append(
    northStar,
    element('p', 'eyebrow', theoryOfChange.northStar.eyebrow),
    element('h3', '', theoryOfChange.northStar.statement)
  );
}

function deliveryCtaBlock() {
  const cta = element('article', 'toc-delivery-cta');
  const body = element('div');
  append(
    body,
    element('p', 'eyebrow', theoryOfChange.deliveryCta.eyebrow),
    element('h3', '', theoryOfChange.deliveryCta.title),
    element('p', '', theoryOfChange.deliveryCta.summary)
  );
  const link = element('a', 'toc-delivery-link', theoryOfChange.deliveryCta.label);
  link.href = theoryOfChange.deliveryCta.href;
  link.appendChild(element('span', '', '→'));
  return append(cta, body, link);
}

function hypothesisRow(label, text) {
  const row = element('div');
  return append(row, element('strong', '', label), element('p', '', text));
}

function hypothesisBlock() {
  const details = element('details', 'toc-hypothesis');
  const summary = element('summary');
  const toggle = element('span', 'toc-toggle');
  toggle.setAttribute('aria-hidden', 'true');
  append(summary, element('span', '', 'Read the full programme-level causal hypothesis'), toggle);

  const body = element('div', 'toc-hypothesis-body');
  append(
    body,
    hypothesisRow('If', theoryOfChange.hypothesis.if),
    hypothesisRow('Then', theoryOfChange.hypothesis.then),
    hypothesisRow('While', theoryOfChange.hypothesis.while)
  );

  return append(details, summary, body);
}

function buildTheorySection() {
  const section = element('section', 'toc-home');
  section.id = 'theory-of-change-home';
  section.setAttribute('aria-labelledby', 'theory-of-change-title');

  const flow = element('div', 'toc-flow');
  flow.setAttribute('aria-label', "Four mechanisms in the King's Edge theory of change");
  theoryOfChange.mechanisms.forEach((mechanism) => flow.appendChild(mechanismCard(mechanism)));

  return append(
    section,
    headingBlock(),
    problemBlock(),
    flow,
    executiveOutcomesBlock(),
    facultyEnablementBlock(),
    equityBlock(),
    feedbackBlock(),
    northStarBlock(),
    deliveryCtaBlock(),
    hypothesisBlock()
  );
}

function addHeroPrompt(hero, theorySection) {
  if (hero.querySelector('.toc-hero-bridge')) return;
  const button = element('button', 'toc-hero-bridge');
  button.type = 'button';
  button.setAttribute('aria-controls', theorySection.id);
  append(
    button,
    element('span', '', theoryOfChange.heroPrompt),
    element('strong', '', '↓')
  );
  button.addEventListener('click', () => theorySection.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  hero.appendChild(button);
}

function renderTheoryOfChange() {
  const landing = document.querySelector('.landing-main');
  const hero = landing?.querySelector('.landing-hero');
  if (!landing || !hero) return;

  let section = document.getElementById('theory-of-change-home');
  if (!section) {
    section = buildTheorySection();
    hero.insertAdjacentElement('afterend', section);
  }
  addHeroPrompt(hero, section);
}

let refreshScheduled = false;
function scheduleRefresh() {
  if (refreshScheduled) return;
  refreshScheduled = true;
  window.requestAnimationFrame(() => {
    refreshScheduled = false;
    renderTheoryOfChange();
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
