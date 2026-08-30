import { buildLookups, projects } from './plan-utils.js';

const { deliverables } = buildLookups(projects);
const deliverableById = new Map(deliverables.map((deliverable) => [deliverable.id, deliverable]));
const obsoleteSectionIds = ['decisions-dependencies', 'definition-of-done', 'components', 'dependencies', 'resources'];
const secondaryDisclosureIds = ['governance', 'decision-log', 'risks-decisions'];

let refreshScheduled = false;
let activeObserver = null;
let activeObserverKey = '';

function currentDeliverableId() {
  const match = String(window.location.hash || '').match(/#\/deliverables\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function currentDeliverable() {
  return deliverableById.get(currentDeliverableId()) || null;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function setText(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}

function setHtml(node, value) {
  if (node && node.innerHTML !== value) node.innerHTML = value;
}

function stepLabel(index) {
  return `Step ${String(index + 1).padStart(2, '0')}`;
}

function displayId(item) {
  return item?.displayId || item?.id || '';
}

function smoothScrollTo(target) {
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  target?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
}

function enhanceBreadcrumbs(page, deliverable) {
  const actions = page.querySelector('.deliverable-actions');
  if (!actions) return;

  actions.querySelector('.back-link')?.setAttribute('hidden', '');

  let breadcrumbs = actions.querySelector('.deliverable-breadcrumbs');
  if (!breadcrumbs) {
    breadcrumbs = document.createElement('nav');
    breadcrumbs.className = 'deliverable-breadcrumbs';
    breadcrumbs.setAttribute('aria-label', 'Breadcrumb');
    actions.insertAdjacentElement('afterbegin', breadcrumbs);
  }

  const project = deliverable.project;
  setHtml(breadcrumbs, `
    <ol>
      <li><a href="#/deliverables">Deliverables</a></li>
      <li><a href="#/projects/${escapeHtml(project.id)}">Project ${escapeHtml(displayId(project))}</a></li>
      <li><span aria-current="page">${escapeHtml(displayId(deliverable))}</span></li>
    </ol>
  `);

  setText(actions.querySelector('.print-a3-button'), 'Print / save A3');
}

function normaliseHero(page) {
  const hero = page.querySelector(':scope > .detail-hero, :scope > .dd-hero');
  if (!hero) return;
  hero.classList.remove('detail-hero');
  hero.classList.add('dd-hero');
}

function normalisePlanningStage(page) {
  const stage = page.querySelector('.planning-notice, .dd-planning-stage');
  if (!stage) return;
  stage.classList.remove('planning-notice', 'planning-notice-early-stage');
  stage.classList.add('dd-planning-stage');

  const main = stage.querySelector('.planning-notice-main, .dd-planning-main');
  main?.classList.remove('planning-notice-main');
  main?.classList.add('dd-planning-main');

  const label = stage.querySelector('.planning-notice-label, .dd-planning-label');
  label?.classList.remove('planning-notice-label');
  label?.classList.add('dd-planning-label');

  const next = stage.querySelector('.planning-notice-next, .dd-planning-next');
  next?.classList.remove('planning-notice-next');
  next?.classList.add('dd-planning-next');
}

function normaliseCoreSection(section, legacyClasses = []) {
  if (!section) return;
  section.classList.remove('panel', 'detail-accordion', 'dd-disclosure', ...legacyClasses);
  section.classList.add('dd-section');
}

function normaliseDisclosure(section) {
  if (!section) return;
  section.classList.remove('panel', 'detail-accordion');
  section.classList.add('dd-disclosure');

  const toggle = section.querySelector(':scope > .detail-accordion-header, :scope > .dd-disclosure-toggle');
  if (toggle) {
    toggle.classList.remove('detail-accordion-header');
    toggle.classList.add('dd-disclosure-toggle');
  }

  const body = section.querySelector(':scope > .detail-accordion-body, :scope > .dd-disclosure-body');
  if (body) {
    body.classList.remove('detail-accordion-body');
    body.classList.add('dd-disclosure-body');
  }
}

function simplifyPage(page) {
  obsoleteSectionIds.forEach((id) => {
    const section = page.querySelector(`#${CSS.escape(id)}`);
    if (section) section.hidden = true;
  });

  normaliseHero(page);
  normalisePlanningStage(page);

  const planningDetail = page.querySelector('.detailed-plan-control, .dd-planning-heading');
  if (planningDetail) {
    planningDetail.classList.remove('panel', 'detailed-plan-control');
    planningDetail.classList.add('dd-planning-heading');
    setText(planningDetail.querySelector('h2'), 'Governance and planning detail');
    setText(
      planningDetail.querySelector('p'),
      'Governance, consultation history and whole-route planning risks sit here. Step-specific detail stays with the Delivery timeline.'
    );
  }

  const propositionNote = page.querySelector('.proposition-stage-note, .dd-stage-note');
  if (propositionNote) {
    propositionNote.classList.remove('panel', 'proposition-stage-note');
    propositionNote.classList.add('dd-stage-note');
  }

  const riskSection = page.querySelector('#risks-decisions');
  const riskToggle = riskSection?.querySelector('.detail-accordion-header, .dd-disclosure-toggle');
  setText(riskToggle?.querySelector('span'), 'Planning risks, issues and assumptions');
  setText(
    riskToggle?.querySelector('em'),
    'Whole-route risks, issues and assumptions that need planning scrutiny.'
  );

  normaliseCoreSection(page.querySelector('#why-this-matters'), ['case-panel']);
  normaliseCoreSection(page.querySelector('#value-evidence'));
  normaliseCoreSection(page.querySelector('#route-through'), ['route-through-panel']);
  normaliseCoreSection(page.querySelector('#resource-investment-profile'));

  page.querySelectorAll('#why-this-matters .schema-card, #why-this-matters .dd-field-card').forEach((card) => {
    card.classList.remove('schema-card');
    card.classList.add('dd-card', 'dd-field-card');
  });

  page.querySelector('#resource-investment-profile .resource-profile-titlebar')?.classList.add('dd-section-heading');
  secondaryDisclosureIds.forEach((id) => normaliseDisclosure(page.querySelector(`#${CSS.escape(id)}`)));
}

function ensureCoreBenefitsOpen(page) {
  const section = page.querySelector('#value-evidence');
  const button = section?.querySelector(':scope > .detail-accordion-header, :scope > .dd-benefits-source-toggle');
  if (!section || !button) return;

  section.classList.add('dd-section', 'dd-benefits-section');
  if (button.getAttribute('aria-expanded') !== 'true') {
    button.click();
    return;
  }

  button.classList.remove('detail-accordion-header');
  button.classList.add('dd-benefits-source-toggle');
  button.hidden = true;

  const body = section.querySelector(':scope > .detail-accordion-body, :scope > .dd-section-body');
  if (body) {
    body.classList.remove('detail-accordion-body');
    body.classList.add('dd-section-body');
  }

  let heading = section.querySelector(':scope > .dd-section-heading');
  if (!heading) {
    heading = document.createElement('header');
    heading.className = 'dd-section-heading';
    button.insertAdjacentElement('afterend', heading);
  }
  setHtml(heading, `
    <h2>Benefits and evidence</h2>
    <p>The outcomes this deliverable should create, how we will know, and which delivery outputs enable them.</p>
  `);

  const benefitsBody = section.querySelector('.delivery-model-panel, .dd-benefits-body');
  if (benefitsBody) {
    benefitsBody.classList.remove('delivery-model-panel');
    benefitsBody.classList.add('dd-benefits-body');
  }
}

function linkedBenefitIds(measure) {
  return measure.supportsBenefits || measure.relatedBenefitIds || [];
}

function benefitLabel(benefit) {
  const match = String(benefit.id || '').match(/B(\d+)$/i);
  return match ? `Benefit ${Number(match[1])}` : 'Benefit';
}

function stepLabels(deliverable) {
  return new Map((deliverable.steps || []).map((step, index) => [step.id, stepLabel(index)]));
}

function renderMeta(items) {
  const values = items.filter(Boolean);
  return values.length ? `<p class="benefit-meta">${values.map(escapeHtml).join(' · ')}</p>` : '';
}

function renderBenefitContext(benefit) {
  const items = [
    benefit.beneficiary ? ['Who benefits', benefit.beneficiary] : null,
    benefit.realisationPeriod ? ['Realisation', benefit.realisationPeriod] : null
  ].filter(Boolean);
  if (!items.length) return '';
  return `<dl class="benefit-context">${items.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>`;
}

function renderEnabledBy(benefit, deliverable) {
  const items = benefit.enabledBy || benefit.linkedOutputs || [];
  if (!items.length) return '';
  const labels = stepLabels(deliverable);
  return `
    <div class="benefit-enabled-by">
      <h5>Enabled by</h5>
      <div class="benefit-enabled-by-list">
        ${items.map((item) => `<span class="benefit-enabled-chip"><strong>${escapeHtml(labels.get(item.stepId) || item.stepId)}</strong><span>${escapeHtml(item.outputTitle || item.outputId || item.note || 'Timeline output')}</span></span>`).join('')}
      </div>
    </div>
  `;
}

function renderMeasure(measure) {
  const thresholds = [
    measure.baseline ? `<div><h6>Baseline</h6><p>${escapeHtml(measure.baseline)}</p></div>` : '',
    measure.target ? `<div><h6>Success threshold</h6><p>${escapeHtml(measure.target)}</p></div>` : ''
  ].filter(Boolean).join('');
  return `
    <details class="benefit-measure">
      <summary>
        <span class="benefit-measure-summary-main"><span class="reference">${escapeHtml(measure.id)}</span><strong>${escapeHtml(measure.title)}</strong></span>
        ${measure.measureType ? `<span class="benefit-measure-type">${escapeHtml(measure.measureType)}</span>` : ''}
      </summary>
      <div class="benefit-measure-body">
        ${measure.questionAnswered ? `<p class="benefit-measure-question">${escapeHtml(measure.questionAnswered)}</p>` : ''}
        ${measure.measure ? `<div class="benefit-measure-method"><h6>Evidence examined</h6><p>${escapeHtml(measure.measure)}</p></div>` : ''}
        ${thresholds ? `<div class="benefit-measure-thresholds">${thresholds}</div>` : ''}
        ${renderMeta([measure.owner && `Owner: ${measure.owner}`, measure.cadence && `Cadence: ${measure.cadence}`, measure.confidence && `Confidence: ${measure.confidence}`])}
      </div>
    </details>
  `;
}

function renderBenefit(benefit, measures, deliverable) {
  return `
    <article class="benefit-realisation-card dd-card">
      <header class="benefit-card-header">
        <span class="benefit-label" title="${escapeHtml(benefit.id)}">${escapeHtml(benefitLabel(benefit))}</span>
        <h4>${escapeHtml(benefit.title)}</h4>
        <p class="benefit-value-statement">${escapeHtml(benefit.statement)}</p>
        ${renderBenefitContext(benefit)}
      </header>
      <div class="benefit-success-look"><h5>Success means</h5><p>${escapeHtml(benefit.successLooksLike || 'Success description not yet captured.')}</p></div>
      <div class="benefit-evidence-group">
        <div class="benefit-evidence-heading"><h5>How we will know</h5><span>${measures.length} ${measures.length === 1 ? 'measure' : 'measures'}</span></div>
        ${measures.length ? `<div class="benefit-measure-list">${measures.map(renderMeasure).join('')}</div>` : '<p>No benefit-realisation measure is linked yet.</p>'}
      </div>
      ${renderEnabledBy(benefit, deliverable)}
    </article>
  `;
}

function renderBenefits(page, deliverable) {
  const section = page.querySelector('#value-evidence');
  const panel = section?.querySelector('.dd-benefits-body, .delivery-model-panel');
  if (!section || !panel) return;

  panel.classList.remove('delivery-model-panel');
  panel.classList.add('dd-benefits-body');

  const signature = JSON.stringify({ benefits: deliverable.benefits, measures: deliverable.measures, steps: (deliverable.steps || []).map(({ id, title }) => ({ id, title })) });
  if (section.dataset.ddBenefitsSignature === signature) return;

  const benefits = deliverable.benefits || [];
  const measures = deliverable.measures || [];
  const mapped = new Set();
  const cards = benefits.map((benefit) => {
    const linked = measures.filter((measure) => linkedBenefitIds(measure).includes(benefit.id));
    linked.forEach((measure) => mapped.add(measure.id));
    return renderBenefit(benefit, linked, deliverable);
  });
  const unmapped = measures.filter((measure) => !mapped.has(measure.id));

  setHtml(panel, `
    <div class="benefit-realisation-list">${cards.join('') || '<p>No benefits captured yet.</p>'}</div>
    ${unmapped.length ? `<section class="unmapped-evidence-block"><h4>Cross-cutting or unmapped evidence</h4><p>These measures are not yet linked to a specific benefit.</p><div class="benefit-measure-list">${unmapped.map(renderMeasure).join('')}</div></section>` : ''}
  `);
  section.dataset.ddBenefitsSignature = signature;
}

function benefitOwners(deliverable) {
  const explicit = (deliverable.benefits || []).filter((benefit) => benefit.owner).map((benefit) => ({ title: benefit.title, owner: benefit.owner }));
  if (explicit.length) return explicit;
  return deliverable.ownership?.benefitOwner ? [{ title: 'All benefits', owner: deliverable.ownership.benefitOwner }] : [];
}

function renderGovernance(page, deliverable) {
  const section = page.querySelector('#governance');
  if (!section) return;

  const toggle = section.querySelector('.dd-disclosure-toggle, .detail-accordion-header');
  setText(toggle?.querySelector('span'), 'How this is governed');
  setText(toggle?.querySelector('em'), 'Decision route, benefit ownership, BAU ownership and essential delivery partners.');

  const body = section.querySelector('.dd-disclosure-body, .detail-accordion-body');
  if (!body) return;
  body.classList.remove('detail-accordion-body');
  body.classList.add('dd-disclosure-body');

  const signature = JSON.stringify({ ownership: deliverable.ownership, governance: deliverable.governance, benefits: (deliverable.benefits || []).map(({ id, title, owner }) => ({ id, title, owner })) });
  if (section.dataset.ddGovernanceSignature === signature) return;

  const governance = deliverable.governance || {};
  const owners = benefitOwners(deliverable);
  const ownerRows = owners.length
    ? owners.map((item) => `<li><span>${escapeHtml(item.title)}</span><strong>${escapeHtml(item.owner)}</strong></li>`).join('')
    : '<li><span>Benefit ownership has not yet been assigned.</span></li>';
  const forum = governance.decisionForum || deliverable.ownership?.decisionForum || 'TBC';
  const decisionScope = governance.decisionScope || 'Material choices and escalations that cannot be resolved within an individual delivery step.';
  const bauOwner = governance.businessAsUsualOwner || 'TBC';
  const bauNote = governance.businessAsUsualOwnershipNote || 'The enduring owner has not yet been confirmed.';
  const partnerGroups = governance.deliveryPartners?.length
    ? governance.deliveryPartners
    : (deliverable.ownership?.contributors || []).length
      ? [{ group: 'Current contributors', partners: deliverable.ownership.contributors, contribution: 'Roles currently identified as contributing to delivery.' }]
      : [];

  setHtml(body, `
    <div class="governance-refined">
      <p class="subtle governance-explainer">The accountable owner and delivery lead are shown at the top of the page. This section covers the governance needed to decide, realise benefits and sustain the capability.</p>
      <div class="governance-summary-grid">
        <section class="governance-block dd-card"><h3>Benefit ownership</h3><ul class="governance-benefit-owner-list">${ownerRows}</ul></section>
        <section class="governance-block dd-card"><h3>Decision and escalation route</h3><strong class="governance-primary-value">${escapeHtml(forum)}</strong><p>${escapeHtml(decisionScope)}</p></section>
        <section class="governance-block dd-card"><h3>Business-as-usual ownership</h3><strong class="governance-primary-value">${escapeHtml(bauOwner)}</strong><p>${escapeHtml(bauNote)}</p></section>
      </div>
      <section class="governance-partners">
        <div class="governance-section-heading"><h3>Key delivery partners</h3><p>The partner groups whose contribution is essential to delivery or sustained use.</p></div>
        ${partnerGroups.length ? `<div class="governance-partner-grid">${partnerGroups.map((group) => `<article class="governance-partner-card dd-card"><span>${escapeHtml(group.group || 'Partner group')}</span>${(group.partners || []).length ? `<strong>${group.partners.map(escapeHtml).join(' · ')}</strong>` : ''}${group.contribution ? `<p>${escapeHtml(group.contribution)}</p>` : ''}</article>`).join('')}</div>` : '<p>No essential partner groups have been captured yet.</p>'}
      </section>
    </div>
  `);
  section.dataset.ddGovernanceSignature = signature;
}

function outputItems(card) {
  const outputBlock = [...card.querySelectorAll('.step-extras .mini-block')].find((block) => block.querySelector('h4')?.textContent?.trim().toLowerCase() === 'outputs');
  return [...(outputBlock?.querySelectorAll('li') || [])]
    .map((item) => item.querySelector('strong')?.textContent?.trim() || item.textContent?.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function enhanceStepCard(card, index) {
  if (card.classList.contains('dd-step')) return;

  const periodNode = card.querySelector(':scope > .period-pill');
  const period = periodNode?.textContent?.trim() || 'Period TBC';
  const title = card.querySelector(':scope > h3');
  const summary = card.querySelector(':scope > p:not(.depends)');
  const depends = card.querySelector(':scope > .depends');
  const extras = card.querySelector(':scope > .step-extras');
  const outputs = outputItems(card);

  periodNode?.setAttribute('hidden', '');
  summary?.setAttribute('hidden', '');
  depends?.setAttribute('hidden', '');

  const header = document.createElement('div');
  header.className = 'dd-step-meta';
  setHtml(header, `<span>${stepLabel(index)}</span><strong>${escapeHtml(period)}</strong>`);
  card.insertAdjacentElement('afterbegin', header);

  const story = document.createElement('div');
  story.className = 'dd-step-story';
  setHtml(story, `
    <div><span>Purpose</span><p>${escapeHtml(summary?.textContent?.trim() || 'Purpose not yet captured.')}</p></div>
    <div><span>Produces</span>${outputs.length ? `<ul>${outputs.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '<p>No outputs captured yet.</p>'}</div>
  `);
  (extras || card).insertAdjacentElement(extras ? 'beforebegin' : 'beforeend', story);

  if (extras) {
    extras.classList.remove('step-extras');
    extras.classList.add('dd-step-detail');
    if (!extras.id) extras.id = `dd-step-${index + 1}-detail`;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'dd-step-toggle';
    toggle.setAttribute('aria-controls', extras.id);
    toggle.setAttribute('aria-expanded', 'false');
    setText(toggle, 'Show step detail');
    story.insertAdjacentElement('afterend', toggle);
    toggle.addEventListener('click', () => {
      const open = card.classList.toggle('dd-step-open');
      toggle.setAttribute('aria-expanded', String(open));
      setText(toggle, open ? 'Hide step detail' : 'Show step detail');
    });
  }

  card.classList.remove('step-card', 'indicative-step-card');
  card.classList.add('dd-step');
}

function enhanceTimeline(page) {
  const panel = page.querySelector('#route-through');
  if (!panel) return;
  setText(panel.querySelector(':scope > h2'), 'Delivery timeline');
  setText(panel.querySelector(':scope > .subtle'), 'The route from mobilisation to handover. Each step shows its purpose and principal outputs; open step detail for resources, decisions, risks, issues and assumptions.');

  const list = panel.querySelector('.steps-list, .dd-step-list');
  if (!list) return;
  list.classList.remove('steps-list');
  list.classList.add('dd-step-list');
  list.querySelectorAll(':scope > .step-card, :scope > .dd-step').forEach(enhanceStepCard);
}

function navigationItems(page) {
  return [
    ['Overview', page.querySelector(':scope > .dd-hero')],
    ['Why it matters', page.querySelector('#why-this-matters')],
    ['Benefits', page.querySelector('#value-evidence')],
    ['Delivery', page.querySelector('#route-through')],
    ['Resources', page.querySelector('#resource-investment-profile')],
    ['Governance', page.querySelector('#governance')]
  ].filter(([, target]) => target && !target.hidden);
}

function ensureNavigation(page) {
  const flow = page.querySelector('.deliverable-main-flow');
  const planning = flow?.querySelector('.dd-planning-stage');
  if (!flow || !planning) return;

  let nav = flow.querySelector(':scope > .deliverable-section-nav');
  if (!nav) {
    nav = document.createElement('nav');
    nav.className = 'deliverable-section-nav';
    nav.setAttribute('aria-label', 'On this deliverable');
    planning.insertAdjacentElement('afterend', nav);
  }

  const items = navigationItems(page);
  const signature = items.map(([label, target]) => `${label}:${target.id || target.className}`).join('|');
  if (nav.dataset.signature !== signature) {
    setHtml(nav, `<span>On this page</span><div>${items.map(([label], index) => `<button type="button" data-dd-nav-index="${index}">${escapeHtml(label)}</button>`).join('')}</div>`);
    nav.dataset.signature = signature;
    nav.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => {
        const [, target] = items[Number(button.dataset.ddNavIndex)] || [];
        if (!target) return;
        if (target.id === 'governance') {
          const disclosure = target.querySelector('.dd-disclosure-toggle, .detail-accordion-header');
          if (disclosure?.getAttribute('aria-expanded') !== 'true') disclosure.click();
          window.requestAnimationFrame(() => smoothScrollTo(target));
          return;
        }
        smoothScrollTo(target);
      });
    });
  }

  const key = `${window.location.hash}|${signature}`;
  if (activeObserverKey === key) return;
  activeObserver?.disconnect();
  activeObserverKey = key;

  const buttons = [...nav.querySelectorAll('button')];
  const targets = items.map(([, target]) => target);
  const setActive = (target) => {
    const index = targets.indexOf(target);
    buttons.forEach((button, buttonIndex) => {
      if (buttonIndex === index) button.setAttribute('aria-current', 'location');
      else button.removeAttribute('aria-current');
    });
  };
  setActive(targets[0]);

  activeObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    if (visible[0]) setActive(visible[0].target);
  }, { rootMargin: '-18% 0px -62% 0px', threshold: [0.01, 0.2, 0.5] });
  targets.forEach((target) => activeObserver.observe(target));
}

function enhancePage() {
  refreshScheduled = false;
  const page = document.querySelector('main.deliverable-detail-page');
  const deliverable = currentDeliverable();
  if (!page || !deliverable) {
    activeObserver?.disconnect();
    activeObserver = null;
    activeObserverKey = '';
    return;
  }

  page.classList.add('dd-page');
  enhanceBreadcrumbs(page, deliverable);
  simplifyPage(page);
  ensureCoreBenefitsOpen(page);
  renderBenefits(page, deliverable);
  renderGovernance(page, deliverable);
  enhanceTimeline(page);
  ensureNavigation(page);
}

function scheduleEnhancement() {
  if (refreshScheduled) return;
  refreshScheduled = true;
  window.requestAnimationFrame(enhancePage);
}

const root = document.getElementById('root');
const observer = new MutationObserver(scheduleEnhancement);
if (root) observer.observe(root, { childList: true, subtree: true });

window.addEventListener('hashchange', () => {
  activeObserver?.disconnect();
  activeObserver = null;
  activeObserverKey = '';
  scheduleEnhancement();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleEnhancement);
} else {
  scheduleEnhancement();
}
