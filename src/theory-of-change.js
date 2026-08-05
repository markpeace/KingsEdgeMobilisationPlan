import theory from './data/theory-of-change.json';

const SECTION_ID = 'theory-of-change';

function appendParagraphs(parent, paragraphs = []) {
  paragraphs.forEach((text) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    parent.append(paragraph);
  });
}

function createSection({ title, paragraphs }, className = '') {
  const section = document.createElement('section');
  section.className = ['theory-copy-section', className].filter(Boolean).join(' ');

  const heading = document.createElement('h3');
  heading.textContent = title;
  section.append(heading);
  appendParagraphs(section, paragraphs);

  return section;
}

function createInnovationAnchors() {
  const section = document.createElement('section');
  section.className = 'theory-copy-section theory-anchors';

  const heading = document.createElement('h3');
  heading.textContent = theory.innovationAnchors.title;
  section.append(heading);

  const introduction = document.createElement('p');
  introduction.className = 'theory-section-introduction';
  introduction.textContent = theory.innovationAnchors.introduction;
  section.append(introduction);

  const list = document.createElement('div');
  list.className = 'theory-anchor-list';

  theory.innovationAnchors.items.forEach((item, index) => {
    const article = document.createElement('article');
    article.className = 'theory-anchor';

    const itemHeading = document.createElement('h4');
    const number = document.createElement('span');
    number.textContent = String(index + 1).padStart(2, '0');
    itemHeading.append(number, document.createTextNode(item.title));
    article.append(itemHeading);
    appendParagraphs(article, item.paragraphs);
    list.append(article);
  });

  section.append(list);
  return section;
}

function createTransformations() {
  const section = document.createElement('section');
  section.className = 'theory-copy-section theory-transformations';

  const heading = document.createElement('h3');
  heading.textContent = theory.transformations.title;
  section.append(heading);

  const list = document.createElement('div');
  list.className = 'theory-transformation-list';

  theory.transformations.items.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'theory-transformation';

    const itemHeading = document.createElement('h4');
    const verb = document.createElement('strong');
    verb.textContent = item.verb;
    itemHeading.append(verb, document.createTextNode(` - ${item.title}`));
    article.append(itemHeading);
    appendParagraphs(article, item.paragraphs);
    list.append(article);
  });

  section.append(list);
  return section;
}

function createTheoryOfChange() {
  const section = document.createElement('section');
  section.id = SECTION_ID;
  section.className = 'theory-of-change';
  section.setAttribute('aria-labelledby', `${SECTION_ID}-title`);

  const header = document.createElement('header');
  header.className = 'theory-header';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = `Theory of change · ${theory.status} ${theory.approvedDate}`;

  const title = document.createElement('h2');
  title.id = `${SECTION_ID}-title`;
  title.textContent = theory.title;

  header.append(eyebrow, title);
  section.append(
    header,
    createSection(theory.strategicChallenge, 'theory-strategic-challenge'),
    createSection(theory.strategicProposition, 'theory-strategic-proposition'),
    createInnovationAnchors(),
    createSection(theory.causalHypothesis, 'theory-causal-hypothesis'),
    createTransformations()
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
