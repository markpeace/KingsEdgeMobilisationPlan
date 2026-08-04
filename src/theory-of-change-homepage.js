import splash from './data/theory-of-change.json';

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

function eyebrow(text) {
  return element('p', 'edge-splash-eyebrow', text);
}

function headingBlock(eyebrowText, title, intro) {
  const heading = element('div', 'edge-splash-section-heading');
  append(heading, eyebrow(eyebrowText), element('h3', '', title));
  if (intro) heading.appendChild(element('p', 'edge-splash-section-intro', intro));
  return heading;
}

function introBlock() {
  const section = element('section', 'edge-splash-intro');
  const title = element('h2', '', splash.headline);
  title.id = 'edge-splash-title';

  const copy = element('div', 'edge-splash-intro-copy');
  append(copy, element('p', 'edge-splash-lead', splash.intro), element('p', 'edge-splash-note', splash.purposeNote));

  return append(section, eyebrow(splash.eyebrow), title, copy);
}

function whyBlock() {
  const section = element('section', 'edge-splash-why');
  const heading = element('div');
  append(heading, eyebrow(splash.why.eyebrow), element('h3', '', splash.why.title));
  return append(section, heading, element('p', '', splash.why.statement));
}

function comparisonCard(data, className) {
  const card = element('article', `edge-splash-comparison-card ${className}`);
  append(card, element('p', 'edge-splash-comparison-label', data.label), element('h4', '', data.title));

  if (data.centre) card.appendChild(element('p', 'edge-splash-centre', data.centre));

  const list = element('ul');
  data.items.forEach((item) => list.appendChild(element('li', '', item)));
  card.appendChild(list);
  return card;
}

function differenceBlock() {
  const section = element('section', 'edge-splash-difference');
  section.id = 'edge-splash-difference';

  const comparison = element('div', 'edge-splash-comparison');
  const arrow = element('span', 'edge-splash-comparison-arrow', '→');
  arrow.setAttribute('aria-hidden', 'true');
  append(
    comparison,
    comparisonCard(splash.difference.conventional, 'edge-splash-comparison-before'),
    arrow,
    comparisonCard(splash.difference.kings, 'edge-splash-comparison-after')
  );

  return append(
    section,
    headingBlock(splash.difference.eyebrow, splash.difference.title, splash.difference.intro),
    comparison
  );
}

function mechanismsBlock() {
  const section = element('section', 'edge-splash-mechanisms');
  const grid = element('div', 'edge-splash-mechanism-grid');

  splash.mechanisms.items.forEach((item) => {
    const card = element('article', 'edge-splash-mechanism');
    append(
      card,
      element('span', 'edge-splash-number', item.id),
      element('h4', '', item.title),
      element('p', '', item.statement)
    );
    grid.appendChild(card);
  });

  return append(
    section,
    headingBlock(splash.mechanisms.eyebrow, splash.mechanisms.title, splash.mechanisms.intro),
    grid
  );
}

function outcomesBlock() {
  const section = element('section', 'edge-splash-outcomes');
  section.appendChild(eyebrow(splash.outcomes.eyebrow));

  const grid = element('div', 'edge-splash-outcome-grid');
  splash.outcomes.items.forEach((item) => {
    const card = element('article');
    append(card, element('h4', '', item.audience), element('p', '', item.statement));
    grid.appendChild(card);
  });

  section.appendChild(grid);
  return section;
}

function principlesBlock() {
  const section = element('section', 'edge-splash-principles');
  section.appendChild(eyebrow(splash.principles.eyebrow));

  const list = element('div', 'edge-splash-principle-list');
  splash.principles.items.forEach((item, index) => {
    const row = element('article');
    append(
      row,
      element('span', 'edge-splash-number', String(index + 1).padStart(2, '0')),
      element('h4', '', item.title),
      element('p', '', item.statement)
    );
    list.appendChild(row);
  });

  section.appendChild(list);
  return section;
}

function closingBlock() {
  const section = element('section', 'edge-splash-closing');

  const aim = element('article', 'edge-splash-aim');
  append(aim, eyebrow(splash.aim.eyebrow), element('h3', '', splash.aim.statement));

  const delivery = element('article', 'edge-splash-delivery');
  const copy = element('div');
  append(
    copy,
    eyebrow(splash.delivery.eyebrow),
    element('h3', '', splash.delivery.title),
    element('p', '', splash.delivery.statement)
  );

  const link = element('a', 'edge-splash-delivery-link', splash.delivery.label);
  link.href = splash.delivery.href;
  link.appendChild(element('span', '', '→'));
  append(delivery, copy, link);

  return append(section, aim, delivery);
}

function buildSplash() {
  const section = element('section', 'edge-splash');
  section.id = 'edge-splash';
  section.setAttribute('aria-labelledby', 'edge-splash-title');

  return append(
    section,
    introBlock(),
    whyBlock(),
    differenceBlock(),
    mechanismsBlock(),
    outcomesBlock(),
    principlesBlock(),
    closingBlock()
  );
}

function renderSplash() {
  const landing = document.querySelector('.landing-main');
  const hero = landing?.querySelector('.landing-hero');
  if (!landing || !hero) return;

  document.querySelector('.toc-home')?.remove();
  hero.querySelector('.toc-hero-bridge')?.remove();

  if (document.getElementById('edge-splash')) return;
  hero.insertAdjacentElement('afterend', buildSplash());
}

let refreshScheduled = false;
function scheduleRefresh() {
  if (refreshScheduled) return;
  refreshScheduled = true;
  window.requestAnimationFrame(() => {
    refreshScheduled = false;
    renderSplash();
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
