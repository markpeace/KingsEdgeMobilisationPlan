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

function eyebrow(text) {
  return element('p', 'toc-eyebrow', text);
}

function sectionHeading(content, className = 'toc-section-heading') {
  const heading = element('div', className);
  append(
    heading,
    eyebrow(content.eyebrow),
    element('h3', '', content.title),
    content.intro || content.summary
      ? element('p', 'toc-section-intro', content.intro || content.summary)
      : null
  );
  return heading;
}

function makeDetailsToggle(details, closedLabel = 'View details') {
  const toggle = element('span', 'toc-toggle', closedLabel);
  details.addEventListener('toggle', () => {
    toggle.textContent = details.open ? 'Close details' : closedLabel;
  });
  return toggle;
}

function headingBlock() {
  const heading = element('header', 'toc-home-heading');
  const meta = element('div', 'toc-heading-meta');
  append(meta, eyebrow(theoryOfChange.eyebrow), element('span', 'toc-status', theoryOfChange.status));

  const title = element('h2');
  title.id = 'theory-of-change-title';
  append(
    title,
    element('span', 'toc-headline-primary', theoryOfChange.headline.primary),
    element('span', 'toc-headline-secondary', theoryOfChange.headline.secondary)
  );

  append(heading, meta, title, element('p', 'toc-intro', theoryOfChange.intro));
  return heading;
}

function strategicPremiseBlock() {
  const section = element('section', 'toc-strategic-premise');
  section.setAttribute('aria-label', 'Why now and the King’s ambition');

  theoryOfChange.strategicPremise.items.forEach((item) => {
    const card = element('article');
    append(card, eyebrow(item.eyebrow), element('h3', '', item.title), element('p', '', item.statement));
    section.appendChild(card);
  });

  return section;
}

function problemBlock() {
  const problem = element('article', 'toc-problem');
  const label = element('div', 'toc-problem-label');
  append(label, eyebrow(theoryOfChange.problem.label));

  const body = element('div', 'toc-problem-body');
  append(body, element('h3', '', theoryOfChange.problem.summary), element('p', '', theoryOfChange.problem.detail));
  return append(problem, label, body);
}

function leadershipBlock() {
  const section = element('section', 'toc-leadership');
  section.id = 'toc-leadership';
  section.appendChild(sectionHeading(theoryOfChange.leadership, 'toc-leadership-heading'));

  const grid = element('div', 'toc-leadership-grid');
  theoryOfChange.leadership.items.forEach((item, index) => {
    const card = element('article');
    append(
      card,
      element('span', 'toc-card-number', String(index + 1).padStart(2, '0')),
      element('h4', '', item.title),
      element('p', '', item.statement)
    );
    grid.appendChild(card);
  });

  append(section, grid, element('p', 'toc-leadership-claim', theoryOfChange.leadership.claim));
  return section;
}

function mechanismCard(mechanism) {
  const details = element('details', 'toc-mechanism');
  const summary = element('summary');

  append(
    summary,
    element('span', 'toc-step', mechanism.id),
    element('span', 'toc-quality', mechanism.quality),
    element('strong', 'toc-card-title', mechanism.title),
    element('span', 'toc-card-hook', mechanism.hook),
    makeDetailsToggle(details, 'View mechanism')
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

  const claim = element('div', 'toc-causal-claim');
  append(claim, element('span', '', 'Causal claim'), element('p', '', mechanism.causalClaim));

  const outcomes = element('div', 'toc-outcomes');
  append(outcomes, element('h4', '', 'If this works'), list(mechanism.outcomes));

  append(depth, levers, claim, outcomes);
  append(details, summary, depth);
  return details;
}

function mechanismsBlock() {
  const section = element('section', 'toc-mechanisms');
  section.id = 'toc-mechanisms';
  section.appendChild(sectionHeading(theoryOfChange.mechanismIntro));

  const flow = element('div', 'toc-flow');
  flow.setAttribute('aria-label', "Four mechanisms in the King's Edge theory of change");
  theoryOfChange.mechanisms.forEach((mechanism) => flow.appendChild(mechanismCard(mechanism)));

  section.appendChild(flow);
  return section;
}

function executiveOutcomesBlock() {
  const section = element('section', 'toc-executive-outcomes');
  section.appendChild(sectionHeading(theoryOfChange.executiveOutcomes));

  const grid = element('div', 'toc-executive-outcomes-grid');
  theoryOfChange.executiveOutcomes.items.forEach((item) => {
    const card = element('article');
    append(card, element('h4', '', item.audience), element('p', '', item.statement));
    grid.appendChild(card);
  });

  section.appendChild(grid);
  return section;
}

function proofPointsBlock() {
  const section = element('section', 'toc-proof-points');
  section.appendChild(sectionHeading(theoryOfChange.proofPoints));

  const grid = element('ol', 'toc-proof-grid');
  theoryOfChange.proofPoints.items.forEach((item, index) => {
    const card = element('li');
    const copy = element('div', 'toc-proof-copy');
    append(copy, element('h4', '', item.title), element('p', '', item.statement));
    append(card, element('span', 'toc-card-number', String(index + 1).padStart(2, '0')), copy);
    grid.appendChild(card);
  });

  section.appendChild(grid);
  return section;
}

function principleCard(content, className) {
  const details = element('details', className);
  const summary = element('summary');
  const copy = element('div');
  append(copy, eyebrow(content.eyebrow), element('h3', '', content.title), element('p', '', content.summary));
  append(summary, copy, makeDetailsToggle(details));
  append(details, summary, element('p', 'toc-principle-detail', content.detail));
  return details;
}

function operatingPrinciplesBlock() {
  const section = element('section', 'toc-operating');
  section.appendChild(sectionHeading(theoryOfChange.operatingPrinciplesIntro));

  const grid = element('div', 'toc-operating-grid');
  append(
    grid,
    principleCard(theoryOfChange.facultyEnablement, 'toc-principle toc-faculty'),
    principleCard(theoryOfChange.deliveryPrinciple, 'toc-principle toc-delivery-principle')
  );

  section.appendChild(grid);
  return section;
}

function systemConditionsBlock() {
  const section = element('section', 'toc-system-conditions');

  const equity = element('article', 'toc-equity');
  append(
    equity,
    eyebrow(theoryOfChange.equity.eyebrow),
    element('h3', '', theoryOfChange.equity.title),
    element('p', 'toc-condition-lead', theoryOfChange.equity.summary),
    element('p', '', theoryOfChange.equity.detail)
  );

  const feedback = element('article', 'toc-feedback-loop');
  const marker = element('span', 'toc-feedback-marker', '↺');
  marker.setAttribute('aria-hidden', 'true');
  const body = element('div');
  append(
    body,
    eyebrow(theoryOfChange.feedback.eyebrow),
    element('h3', '', theoryOfChange.feedback.title),
    element('p', '', theoryOfChange.feedback.summary)
  );
  append(feedback, marker, body);

  append(section, equity, feedback);
  return section;
}

function northStarBlock() {
  const northStar = element('article', 'toc-north-star');
  return append(
    northStar,
    eyebrow(theoryOfChange.northStar.eyebrow),
    element('h3', '', theoryOfChange.northStar.statement)
  );
}

function deliveryCtaBlock() {
  const cta = element('article', 'toc-delivery-cta');
  const body = element('div');
  append(
    body,
    eyebrow(theoryOfChange.deliveryCta.eyebrow),
    element('h3', '', theoryOfChange.deliveryCta.title),
    element('p', '', theoryOfChange.deliveryCta.summary)
  );

  const link = element('a', 'toc-delivery-link');
  link.href = theoryOfChange.deliveryCta.href;
  append(link, element('span', '', theoryOfChange.deliveryCta.label), element('strong', '', '→'));
  return append(cta, body, link);
}

function hypothesisRow(label, text) {
  const row = element('div');
  return append(row, element('strong', '', label), element('p', '', text));
}

function hypothesisBlock() {
  const details = element('details', 'toc-hypothesis');
  const summary = element('summary');
  append(summary, element('span', '', 'Read the full programme-level causal hypothesis'), makeDetailsToggle(details, 'Open hypothesis'));

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

  return append(
    section,
    headingBlock(),
    strategicPremiseBlock(),
    problemBlock(),
    leadershipBlock(),
    mechanismsBlock(),
    executiveOutcomesBlock(),
    proofPointsBlock(),
    operatingPrinciplesBlock(),
    systemConditionsBlock(),
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
  append(button, element('span', '', theoryOfChange.heroPrompt), element('strong', '', '↓'));
  button.addEventListener('click', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    theorySection.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });
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
