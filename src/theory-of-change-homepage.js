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
  append(
    summary,
    element('span', 'toc-step', mechanism.id),
    element('span', 'toc-quality', mechanism.quality),
    element('strong', 'toc-card-title', mechanism.title),
    element('span', 'toc-card-hook', mechanism.hook),
    element('span', 'toc-toggle')
  );
  summary.querySelector('.toc-toggle').setAttribute('aria-hidden', 'true');

  const depth = element('div', 'toc-mechanism-depth');
  depth.appendChild(element('p', 'toc-mechanism-summary', mechanism.summary));

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
  const eyebrow = element('p', 'eyebrow', theoryOfChange.eyebrow);
  const status = element('p', 'toc-status', theoryOfChange.status);
  const title = element('h2', '', theoryOfChange.headline);
  title.id = 'theory-of-change-title';
  const intro = element('p', 'toc-intro', theoryOfChange.intro);
  return append(heading, eyebrow, status, title, intro);
}

function problemBlock() {
  const problem = element('article', 'toc-problem');
  const label = element('span', '', theoryOfChange.problem.label);
  const body = element('div');
  append(
    body,
    element('h3', '', theoryOfChange.problem.summary),
    element('p', '', theoryOfChange.problem.detail)
  );
  return append(problem, label, body);
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

function northStarBlock() {
  const northStar = element('article', 'toc-north-star');
  return append(
    northStar,
    element('p', 'eyebrow', theoryOfChange.northStar.eyebrow),
    element('h3', '', theoryOfChange.northStar.statement)
  );
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
  append(summary, element('span', '', 'Read the programme-level causal hypothesis'), toggle);

  const body = element('div', 'toc-hypothesis-body');
  append(
    body,
    hypothesisRow('If', theoryOfChange.hypothesis.if),
    hypothesisRow('Then', theoryOfChange.hypothesis.then),
    hypothesisRow('While', theoryOfChange.hypothesis.while)
  );

  const feedback = element('p', 'toc-feedback');
  feedback.appendChild(element('strong', '', 'Learning loop: '));
  feedback.appendChild(document.createTextNode(theoryOfChange.feedback));
  body.appendChild(feedback);

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
    equityBlock(),
    northStarBlock(),
    hypothesisBlock()
  );
}

function renderTheoryOfChange() {
  const landing = document.querySelector('.landing-main');
  const hero = landing?.querySelector('.landing-hero');
  if (!landing || !hero || document.getElementById('theory-of-change-home')) return;
  hero.insertAdjacentElement('afterend', buildTheorySection());
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
