import theory from './data/theory-of-change.json';

const SECTION_ID = 'theory-of-change';

function appendParagraphs(parent, paragraphs = []) {
  paragraphs.forEach((text) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    parent.append(paragraph);
  });
}

function createCue(text = 'Read more') {
  const cue = document.createElement('span');
  cue.className = 'theory-disclosure-cue';
  cue.textContent = text;
  return cue;
}

function createDisclosure({ label, title, tldr, paragraphs }, className = '') {
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
  summary.append(summaryCopy, createCue('Explore'));
  details.append(summary);

  const body = document.createElement('div');
  body.className = 'theory-disclosure-body';
  appendParagraphs(body, paragraphs);
  details.append(body);

  return details;
}

function createTransformationCard(item, index) {
  const details = document.createElement('details');
  details.className = 'theory-transformation-card';
  details.id = `theory-transformation-${item.verb.toLowerCase()}`;

  const summary = document.createElement('summary');

  const number = document.createElement('span');
  number.className = 'theory-transformation-number';
  number.textContent = String(index + 1).padStart(2, '0');

  const copy = document.createElement('span');
  copy.className = 'theory-transformation-summary-copy';

  const verb = document.createElement('strong');
  verb.className = 'theory-transformation-verb';
  verb.textContent = item.verb;

  const title = document.createElement('span');
  title.className = 'theory-transformation-title';
  title.textContent = item.title;

  const tldr = document.createElement('span');
  tldr.className = 'theory-transformation-tldr';
  tldr.textContent = item.tldr;

  copy.append(verb, title, tldr);
  summary.append(number, copy, createCue('Open'));
  details.append(summary);

  const body = document.createElement('div');
  body.className = 'theory-transformation-body';
  appendParagraphs(body, item.paragraphs);
  details.append(body);

  return details;
}

function createTransformations() {
  const section = document.createElement('section');
  section.className = 'theory-scan-section theory-transformations';
  section.setAttribute('aria-labelledby', 'theory-transformations-title');

  const header = document.createElement('header');
  header.className = 'theory-section-header';

  const label = document.createElement('p');
  label.className = 'eyebrow';
  label.textContent = theory.transformations.label;

  const title = document.createElement('h3');
  title.id = 'theory-transformations-title';
  title.textContent = theory.transformations.title;

  const introduction = document.createElement('p');
  introduction.className = 'theory-section-introduction';
  introduction.textContent = theory.transformations.introduction;

  const guidance = document.createElement('p');
  guidance.className = 'theory-open-guidance';
  guidance.textContent = 'The headlines give the whole story. Open any card to dig deeper.';

  header.append(label, title, introduction, guidance);

  const grid = document.createElement('div');
  grid.className = 'theory-transformation-grid';
  theory.transformations.items.forEach((item, index) => {
    grid.append(createTransformationCard(item, index));
  });

  section.append(header, grid);
  return section;
}

function createCaseInOneMinute() {
  const section = document.createElement('section');
  section.className = 'theory-scan-section theory-case';
  section.setAttribute('aria-labelledby', 'theory-case-title');

  const header = document.createElement('header');
  header.className = 'theory-section-header theory-section-header-compact';

  const label = document.createElement('p');
  label.className = 'eyebrow';
  label.textContent = 'The case in one minute';

  const title = document.createElement('h3');
  title.id = 'theory-case-title';
  title.textContent = 'Why King’s Edge, why now, and why it should work';

  header.append(label, title);

  const grid = document.createElement('div');
  grid.className = 'theory-case-grid';
  grid.append(
    createDisclosure(theory.strategicChallenge, 'theory-case-card theory-case-challenge'),
    createDisclosure(theory.strategicProposition, 'theory-case-card theory-case-proposition'),
    createDisclosure(theory.causalHypothesis, 'theory-case-card theory-case-hypothesis')
  );

  section.append(header, grid);
  return section;
}

function createInnovationAnchor(item, index) {
  return createDisclosure({
    label: String(index + 1).padStart(2, '0'),
    title: item.title,
    tldr: item.tldr,
    paragraphs: item.paragraphs
  }, 'theory-anchor-card');
}

function createInnovationAnchors() {
  const section = document.createElement('section');
  section.className = 'theory-scan-section theory-anchors';
  section.setAttribute('aria-labelledby', 'theory-anchors-title');

  const header = document.createElement('header');
  header.className = 'theory-section-header';

  const label = document.createElement('p');
  label.className = 'eyebrow';
  label.textContent = theory.innovationAnchors.label;

  const title = document.createElement('h3');
  title.id = 'theory-anchors-title';
  title.textContent = theory.innovationAnchors.title;

  const introduction = document.createElement('p');
  introduction.className = 'theory-section-introduction';
  introduction.textContent = theory.innovationAnchors.introduction;

  header.append(label, title, introduction);

  const grid = document.createElement('div');
  grid.className = 'theory-anchor-grid';
  theory.innovationAnchors.items.forEach((item, index) => {
    grid.append(createInnovationAnchor(item, index));
  });

  section.append(header, grid);
  return section;
}

function createTheoryOfChange() {
  const section = document.createElement('section');
  section.id = SECTION_ID;
  section.className = 'theory-of-change';
  section.setAttribute('aria-labelledby', `${SECTION_ID}-title`);

  const header = document.createElement('header');
  header.className = 'theory-header';

  const copy = document.createElement('div');
  copy.className = 'theory-header-copy';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = `Theory of change · ${theory.status} ${theory.approvedDate}`;

  const title = document.createElement('h2');
  title.id = `${SECTION_ID}-title`;
  title.textContent = theory.title;

  const standfirst = document.createElement('p');
  standfirst.className = 'theory-standfirst';
  standfirst.textContent = theory.standfirst;

  copy.append(eyebrow, title, standfirst);

  const motif = document.createElement('div');
  motif.className = 'theory-header-motif';
  motif.setAttribute('aria-hidden', 'true');
  motif.innerHTML = '<span>Build</span><span>Shape</span><span>Claim</span><span>Learn</span><span>Carry</span>';

  header.append(copy, motif);
  section.append(
    header,
    createTransformations(),
    createCaseInOneMinute(),
    createInnovationAnchors()
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
