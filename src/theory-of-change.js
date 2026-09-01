import theory from './data/theory-of-change.json';

const SECTION_ID = 'theory-of-change';

function appendParagraphs(parent, paragraphs = []) {
  paragraphs.forEach((text) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    parent.append(paragraph);
  });
}

function createCue(label = 'Explore') {
  const cue = document.createElement('span');
  cue.className = 'theory-disclosure-cue';

  const text = document.createElement('span');
  text.textContent = label;

  const mark = document.createElement('span');
  mark.className = 'theory-disclosure-mark';
  mark.setAttribute('aria-hidden', 'true');

  cue.append(text, mark);
  return cue;
}

function createSectionHeader({ label, title, introduction, id, compact = false }) {
  const header = document.createElement('header');
  header.className = `theory-section-header${compact ? ' theory-section-header-compact' : ''}`;

  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = label;

  const heading = document.createElement('h3');
  heading.id = id;
  heading.textContent = title;

  header.append(eyebrow, heading);

  if (introduction) {
    const copy = document.createElement('p');
    copy.className = 'theory-section-introduction';
    copy.textContent = introduction;
    header.append(copy);
  }

  return header;
}

function createDisclosure({ label, title, tldr, paragraphs, formalTitle }, className = '') {
  const details = document.createElement('details');
  details.className = ['theory-disclosure', className].filter(Boolean).join(' ');

  const summary = document.createElement('summary');
  const summaryCopy = document.createElement('span');
  summaryCopy.className = 'theory-disclosure-summary-copy';

  if (label) {
    const eyebrow = document.createElement('span');
    eyebrow.className = 'theory-card-label';
    eyebrow.textContent = label;
    summaryCopy.append(eyebrow);
  }

  const heading = document.createElement('span');
  heading.className = 'theory-card-title';
  heading.textContent = title;

  const tldrCopy = document.createElement('span');
  tldrCopy.className = 'theory-card-tldr';
  tldrCopy.textContent = tldr;

  summaryCopy.append(heading, tldrCopy);
  summary.append(summaryCopy, createCue());
  details.append(summary);

  const body = document.createElement('div');
  body.className = 'theory-disclosure-body';

  if (formalTitle) {
    const formal = document.createElement('p');
    formal.className = 'theory-formal-title';
    formal.textContent = formalTitle;
    body.append(formal);
  }

  appendParagraphs(body, paragraphs);
  details.append(body);

  return details;
}

function createTransformationRow(item, index) {
  const details = document.createElement('details');
  details.className = 'theory-transformation-row';
  details.id = `theory-transformation-${item.verb.toLowerCase()}`;

  const summary = document.createElement('summary');

  const number = document.createElement('span');
  number.className = 'theory-transformation-number';
  number.textContent = String(index + 1).padStart(2, '0');

  const verb = document.createElement('strong');
  verb.className = 'theory-transformation-verb';
  verb.textContent = item.verb;

  const title = document.createElement('span');
  title.className = 'theory-transformation-title';
  title.textContent = item.title;

  const tldr = document.createElement('span');
  tldr.className = 'theory-transformation-tldr';
  tldr.textContent = item.tldr;

  summary.append(number, verb, title, tldr, createCue());
  details.append(summary);

  const body = document.createElement('div');
  body.className = 'theory-transformation-body';
  appendParagraphs(body, item.paragraphs);
  details.append(body);

  return details;
}

function createJourneyNavigation() {
  const nav = document.createElement('nav');
  nav.className = 'theory-journey-nav';
  nav.setAttribute('aria-label', 'Jump to a King’s Edge transformation');

  const label = document.createElement('p');
  label.className = 'theory-journey-label';
  label.textContent = 'Five transformations';
  nav.append(label);

  theory.transformations.items.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'theory-journey-link';

    const number = document.createElement('span');
    number.textContent = String(index + 1).padStart(2, '0');

    const verb = document.createElement('strong');
    verb.textContent = item.verb;

    button.append(number, verb);
    button.addEventListener('click', () => {
      const target = document.getElementById(`theory-transformation-${item.verb.toLowerCase()}`);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => target?.querySelector('summary')?.focus({ preventScroll: true }), 450);
    });

    nav.append(button);
  });

  return nav;
}

function createTheoryHeader() {
  const header = document.createElement('header');
  header.className = 'theory-header';

  const copy = document.createElement('div');
  copy.className = 'theory-header-copy';

  const meta = document.createElement('p');
  meta.className = 'theory-meta';
  meta.textContent = `Theory of change · ${theory.status} · ${theory.approvedDate}`;

  const title = document.createElement('h2');
  title.id = `${SECTION_ID}-title`;
  title.textContent = theory.title;

  const standfirst = document.createElement('p');
  standfirst.className = 'theory-standfirst';
  standfirst.textContent = theory.standfirst;

  copy.append(meta, title, standfirst);
  header.append(copy, createJourneyNavigation());
  return header;
}

function createTransformations() {
  const section = document.createElement('section');
  section.className = 'theory-scan-section theory-transformations';
  section.setAttribute('aria-labelledby', 'theory-transformations-title');

  section.append(createSectionHeader({
    label: theory.transformations.label,
    title: theory.transformations.title,
    introduction: theory.transformations.introduction,
    id: 'theory-transformations-title'
  }));

  const list = document.createElement('div');
  list.className = 'theory-transformation-list';
  theory.transformations.items.forEach((item, index) => {
    list.append(createTransformationRow(item, index));
  });

  section.append(list);
  return section;
}

function createCausalChain() {
  const section = document.createElement('section');
  section.className = 'theory-scan-section theory-causal-chain';
  section.setAttribute('aria-labelledby', 'theory-causal-chain-title');

  section.append(createSectionHeader({
    label: 'The theory in one minute',
    title: 'How the change is meant to happen',
    introduction: theory.causalHypothesis.tldr,
    id: 'theory-causal-chain-title'
  }));

  const chain = document.createElement('div');
  chain.className = 'theory-chain';

  theory.causalHypothesis.chain.forEach((text, index) => {
    const step = document.createElement('article');
    step.className = 'theory-chain-step ds-sequence-card';

    const number = document.createElement('span');
    number.textContent = String(index + 1).padStart(2, '0');

    const copy = document.createElement('p');
    copy.textContent = text;

    step.append(number, copy);
    chain.append(step);
  });

  const detail = createDisclosure({
    label: theory.causalHypothesis.label,
    title: 'Read the full causal hypothesis',
    tldr: theory.causalHypothesis.tldr,
    formalTitle: theory.causalHypothesis.title,
    paragraphs: theory.causalHypothesis.paragraphs
  }, 'theory-causal-detail');

  section.append(chain, detail);
  return section;
}

function createWhyNow() {
  const section = document.createElement('section');
  section.className = 'theory-scan-section theory-why-now';
  section.setAttribute('aria-labelledby', 'theory-why-now-title');

  section.append(createSectionHeader({
    label: 'Why now',
    title: 'The challenge and the proposition',
    introduction: 'King’s starts from considerable strength, but the value of its education needs to be more consistently experienced, understood and carried into the world.',
    id: 'theory-why-now-title'
  }));

  const grid = document.createElement('div');
  grid.className = 'theory-why-grid';
  grid.append(
    createDisclosure({
      label: theory.strategicChallenge.label,
      title: theory.strategicChallenge.displayTitle,
      tldr: theory.strategicChallenge.tldr,
      formalTitle: theory.strategicChallenge.title,
      paragraphs: theory.strategicChallenge.paragraphs
    }, 'theory-why-card theory-challenge-card'),
    createDisclosure({
      label: theory.strategicProposition.label,
      title: theory.strategicProposition.displayTitle,
      tldr: theory.strategicProposition.tldr,
      formalTitle: theory.strategicProposition.title,
      paragraphs: theory.strategicProposition.paragraphs
    }, 'theory-why-card theory-proposition-card')
  );

  section.append(grid);
  return section;
}

function createInnovationAnchors() {
  const section = document.createElement('section');
  section.className = 'theory-scan-section theory-anchors';
  section.setAttribute('aria-labelledby', 'theory-anchors-title');

  section.append(createSectionHeader({
    label: theory.innovationAnchors.label,
    title: theory.innovationAnchors.title,
    introduction: theory.innovationAnchors.introduction,
    id: 'theory-anchors-title'
  }));

  const grid = document.createElement('div');
  grid.className = 'theory-anchor-grid';

  theory.innovationAnchors.items.forEach((item, index) => {
    grid.append(createDisclosure({
      label: String(index + 1).padStart(2, '0'),
      title: item.title,
      tldr: item.tldr,
      paragraphs: item.paragraphs
    }, 'theory-anchor-card'));
  });

  section.append(grid);
  return section;
}

function createClosingStatement() {
  const section = document.createElement('section');
  section.className = 'theory-closing';

  const marker = document.createElement('p');
  marker.className = 'eyebrow';
  marker.textContent = 'The intended result';

  const title = document.createElement('h3');
  title.textContent = theory.closing.title;

  const copy = document.createElement('p');
  copy.className = 'theory-closing-copy';
  copy.textContent = theory.closing.text;

  section.append(marker, title, copy);
  return section;
}

function createTheoryOfChange() {
  const section = document.createElement('section');
  section.id = SECTION_ID;
  section.className = 'theory-of-change';
  section.setAttribute('aria-labelledby', `${SECTION_ID}-title`);

  section.append(
    createTheoryHeader(),
    createTransformations(),
    createCausalChain(),
    createWhyNow(),
    createInnovationAnchors(),
    createClosingStatement()
  );

  return section;
}

function currentPath() {
  return window.location.hash.replace(/^#/, '') || '/';
}

function renderTheoryOfChange() {
  const existing = document.getElementById(SECTION_ID);
  const landingMain = document.querySelector('.landing-main');

  if (currentPath() !== '/' || !landingMain) {
    existing?.remove();
    document.querySelector('.landing-main--with-theory')?.classList.remove('landing-main--with-theory');
    return;
  }

  landingMain.classList.add('landing-main--with-theory');
  if (!existing) landingMain.append(createTheoryOfChange());
}

window.addEventListener('hashchange', () => requestAnimationFrame(renderTheoryOfChange));

const observer = new MutationObserver(() => requestAnimationFrame(renderTheoryOfChange));
observer.observe(document.body, { childList: true, subtree: true });

requestAnimationFrame(renderTheoryOfChange);