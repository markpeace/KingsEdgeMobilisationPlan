import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  plan,
  projects,
  edgeProjects,
  outOfProgramme,
  timelinePeriods,
  buildLookups,
  buildDependencyIndex,
  getStepDependencies,
  getStepPeriodSpan,
  resolveLabel,
  periodLabel
} from './plan-utils.js';
import { getStatus, labelStatus, labelConfidence, statusClass, confidenceClass } from './status-utils.js';
import './styles.css';

const hasItems = (items) => Array.isArray(items) && items.length > 0;
const asText = (item) => typeof item === 'string' ? item : item?.title || item?.label || item?.item || item?.role || item?.condition || 'Item';
const desc = (item) => typeof item === 'string' ? '' : item?.description || item?.summary || item?.notes || item?.mitigation || item?.validationNeeded || item?.statement || item?.rationale || item?.riskIfMissing || item?.contribution || '';
const meta = (items) => items.filter(Boolean).join(' · ');
const displayId = (item) => item?.displayId || item?.id;
const planningStatus = (item) => item?.planningStatus || 'pre-draft';
const planningStatusOptions = [
  ['draft', 'Draft'],
  ['validated-draft', 'Validated draft'],
  ['decision-ready', 'Decision-ready'],
  ['mobilising', 'Mobilising'],
  ['in-delivery', 'In delivery']
];
const planningStatusLabel = (status) => ({
  'pre-draft': 'Pre-draft',
  draft: 'Draft',
  'validated-draft': 'Validated draft',
  'decision-ready': 'Decision-ready',
  mobilising: 'Mobilising',
  'in-delivery': 'In delivery'
}[status] || status || 'Pre-draft');
const planningStatusClass = (item) => `planning-status planning-status-${planningStatus(item)}`;
const isPreDraft = (item) => planningStatus(item) === 'pre-draft';
const isBeyondPreDraft = (item) => !isPreDraft(item);
const hasDistinctDetail = (item) => Boolean(item?.detailSummary && item.detailSummary !== item.summary);

function useHashRoute() {
  const getPath = () => window.location.hash.replace(/^#/, '') || '/';
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const onHashChange = () => setPath(getPath());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return path;
}

function hasResources(resources = {}) {
  return ['existingCapacity', 'newInvestment', 'enablingConditions', 'people', 'cashCosts', 'dataAndSystems', 'governance', 'engagementNeeds', 'nonCashNeeds'].some((key) => hasItems(resources[key])) || Boolean(resources.resourceSummary || resources.fundingSummary || resources.fundingStatus || resources.investmentAsk);
}

function formatMoney(cost = {}) {
  return typeof cost.amount === 'number' ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: cost.currency || 'GBP', maximumFractionDigits: 0 }).format(cost.amount) : null;
}

function DetailSummary({ item }) {
  if (!hasDistinctDetail(item)) return null;
  return <p className="detail-summary">{item.detailSummary}</p>;
}

function ProjectTransformationClaim({ project }) {
  if (!project?.transformationClaim) return null;
  return <section className="panel transformation-claim-panel"><p className="eyebrow">Transformation claim</p><p>{project.transformationClaim}</p></section>;
}

function Nav() {
  return <header className="site-header"><a href="#/" className="brand">King's Edge Mobilisation Plan</a><nav><a href="#/">Home</a><a href="#/projects">Projects</a><a href="#/deliverables">Deliverables</a><a href="#/measures">Measures</a><a href="#/timeline">Timeline</a></nav></header>;
}

function StatusPills({ id, compact = false }) {
  const status = getStatus(id);
  return <div className={`status-pills ${compact ? 'compact' : ''}`} title={status.note}><span className={`status-pill ${statusClass(status.status)}`}>{labelStatus(status.status)}</span><span className={`status-pill ${confidenceClass(status.confidence)}`}>{labelConfidence(status.confidence)}</span>{status.decisionNeeded && <span className="status-pill decision-needed">Decision needed</span>}</div>;
}

function PlanningStatusTag({ item }) {
  return <span className={planningStatusClass(item)}>{planningStatusLabel(planningStatus(item))}</span>;
}

function DeliverableContextLine({ deliverable, showProject = false }) {
  return <div className="deliverable-context-line"><span className="reference">{displayId(deliverable)}</span>{showProject && <span className="project-context">Project {displayId(deliverable.project)} {deliverable.project.title}</span>}<PlanningStatusTag item={deliverable} /></div>;
}

function PlanningNotice({ deliverable }) {
  const predraft = isPreDraft(deliverable);
  return <section className={`planning-notice ${predraft ? 'planning-notice-predraft' : ''}`} aria-label="Planning stage"><div className="planning-notice-main"><span className="planning-notice-label">Planning stage</span><PlanningStatusTag item={deliverable} /><p>{predraft ? 'Included in the mobilisation map, but not yet scrutinised against the full planning schema. Detailed planning assumptions are hidden below.' : 'This deliverable has moved beyond pre-draft and is shown in the delivery, measures and timeline views.'}</p></div>{predraft && <p className="planning-notice-next"><strong>Next scrutiny:</strong> Confirm case for change, ownership, benefits, measures, resources and dependencies before moving to draft.</p>}</section>;
}

function SmartLink({ id, idMap }) {
  const result = idMap.get(id);
  if (!result) return <span className="chip">{id}</span>;
  if (result.type === 'project') return <a className="chip" href={`#/projects/${id}`}>{displayId(result.item)} {result.item.title}</a>;
  if (result.type === 'deliverable') return <a className="chip" href={`#/deliverables/${id}`}>{displayId(result.item)} {result.item.title}</a>;
  if (result.type === 'step') return <a className="chip" href={`#/deliverables/${result.parent.id}`}>{displayId(result.parent)}: {result.item.title}</a>;
  return <span className="chip">{resolveLabel(id, idMap)}</span>;
}

function Landing() {
  return <main className="landing-main"><section className="hero landing-hero"><p className="eyebrow">Interactive delivery map</p><h1>{plan.programme.title}</h1><p>{plan.programme.purpose}</p><div className="landing-links"><a href="#/projects"><span>01</span><strong>Projects view</strong><em>Browse the core projects and the related out of programme work.</em></a><a href="#/deliverables"><span>02</span><strong>Deliverables index</strong><em>Search and filter deliverables that have moved beyond pre-draft.</em></a><a href="#/measures"><span>03</span><strong>Measures</strong><em>Track benefit measures for draft or later deliverables.</em></a><a href="#/timeline"><span>04</span><strong>Timeline</strong><em>View sequencing and step-to-step dependencies for draft or later deliverables.</em></a></div></section></main>;
}

function ProjectsPage() {
  return <main><section className="section-heading projects-heading"><h1>Projects View</h1><p>Projects are shown in source order. Planning status is shown at deliverable level. Current deliverables default to pre-draft until they have been scrutinised.</p></section><div className="project-board"><div className="project-scroll">{edgeProjects.map((project) => <ProjectColumn key={project.id} project={project} />)}<div className="programme-divider"><span>→ → →</span></div>{outOfProgramme.map((project) => <ProjectColumn key={project.id} project={project} />)}</div></div></main>;
}

function ProjectColumn({ project }) {
  const isOut = project.deliveryContext === 'out-of-programme';
  return <section className={`project-column ${isOut ? 'related-project-column' : ''}`}><a className={`project-column-header project-header-link ${isOut ? 'related-project-header' : ''}`} href={`#/projects/${project.id}`}><span className="reference">{isOut ? 'Out' : displayId(project)}</span><h2>{project.title}</h2><p>{project.summary}</p><p className="owner">Owner: {project.owner}</p></a><div className="deliverable-stack">{project.deliverables.map((deliverable) => <a className="deliverable-card" href={`#/deliverables/${deliverable.id}`} key={deliverable.id}><DeliverableContextLine deliverable={deliverable} /><h3>{deliverable.title}</h3><p>{deliverable.summary}</p><StatusPills id={deliverable.id} compact /><p className="lead">Lead: {deliverable.lead}</p></a>)}</div></section>;
}

function ProjectDetail({ project }) {
  if (!project) return <main><section className="section-heading"><h1>Project not found</h1><p><a href="#/projects">Return to Projects View</a></p></section></main>;
  const isOut = project.deliveryContext === 'out-of-programme';
  return <main><a className="back-link" href="#/projects">Back to Projects View</a><section className={`detail-hero project-detail-hero ${isOut ? 'related-project-detail-hero' : ''}`}><div className="project-context-line hero-context-line"><span className="reference hero-reference">{displayId(project)}</span><span className="project-context">{isOut ? 'Out of programme' : 'Edge programme'}</span></div><h1><span className="hero-title-text">{project.title}</span></h1><p>{project.summary}</p><DetailSummary item={project} />{project.edgeRole && <p>{project.edgeRole}</p>}<div className="detail-meta"><span>Project owner: {project.owner}</span><span>{project.deliverables.length} deliverables</span></div></section><ProjectTransformationClaim project={project} /><section className="panel project-deliverable-panel"><h2>Deliverables</h2><p className="subtle">Each column shows a deliverable and its indicative delivery steps. Detailed planning is available inside each deliverable.</p><div className="project-deliverable-board"><div className="project-deliverable-columns">{project.deliverables.map((deliverable) => <ProjectDeliverableColumn key={deliverable.id} deliverable={deliverable} />)}</div></div></section></main>;
}

function ProjectDeliverableColumn({ deliverable }) {
  return <section className="project-deliverable-column"><a className="project-deliverable-header" href={`#/deliverables/${deliverable.id}`}><DeliverableContextLine deliverable={deliverable} /><h3>{deliverable.title}</h3><p>{deliverable.summary}</p><p className="lead">Lead: {deliverable.lead}</p></a><div className="project-step-stack">{deliverable.steps.map((step) => <a className={`project-step-card ${isPreDraft(deliverable) ? 'indicative-step-card' : ''}`} href={`#/deliverables/${deliverable.id}`} key={step.id}><span className="period-pill">{periodLabel(step.period)}</span>{isPreDraft(deliverable) && <span className="indicative-label">Indicative</span>}<h4>{step.title}</h4><p>{step.summary}</p>{getStepDependencies(step).length > 0 && <p className="depends">{getStepDependencies(step).length} dependencies</p>}</a>)}</div></section>;
}

function EmptyState({ title, children }) {
  return <section className="panel empty-state-panel"><h2>{title}</h2>{children}</section>;
}

function projectOptionsFor(deliverables) {
  const ids = new Set(deliverables.map((deliverable) => deliverable.project.id));
  return projects.filter((project) => ids.has(project.id));
}

function DeliverablesIndex({ deliverables }) {
  const [query, setQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const eligible = deliverables.filter(isBeyondPreDraft);
  const projectOptions = projectOptionsFor(eligible);
  const filtered = eligible.filter((deliverable) => {
    const matchesProject = projectFilter === 'all' || deliverable.project.id === projectFilter;
    const matchesStatus = statusFilter === 'all' || planningStatus(deliverable) === statusFilter;
    const text = [deliverable.id, displayId(deliverable), displayId(deliverable.project), deliverable.project.title, deliverable.title, deliverable.lead, deliverable.summary, deliverable.detailSummary, planningStatusLabel(planningStatus(deliverable)), ...(deliverable.tags || [])].join(' ').toLowerCase();
    return matchesProject && matchesStatus && text.includes(query.toLowerCase());
  });
  return <main><section className="section-heading"><h1>Deliverables index</h1><p>Search or filter deliverables that have moved beyond pre-draft. Pre-draft deliverables stay in the project map and individual detail pages, but are not listed here.</p></section><div className="toolbar"><input type="search" placeholder="Search deliverables, owners or themes" value={query} onChange={(event) => setQuery(event.target.value)} /><select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}><option value="all">All projects</option>{projectOptions.map((project) => <option key={project.id} value={project.id}>{displayId(project)} {project.title}</option>)}</select><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All visible planning statuses</option>{planningStatusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>{filtered.length === 0 ? <EmptyState title="No draft or later deliverables to show"><p>{eligible.length === 0 ? 'Deliverables will appear here once they have moved beyond pre-draft.' : 'No visible deliverables match the current filters.'}</p></EmptyState> : <div className="index-list">{filtered.map((deliverable) => <a href={`#/deliverables/${deliverable.id}`} className="index-row deliverable-index-row" key={deliverable.id}><div className="index-row-main"><DeliverableContextLine deliverable={deliverable} showProject /><h3>{deliverable.title}</h3><p>{deliverable.summary}</p><div className="index-owner-line"><span>Accountable owner: {deliverable.ownership?.accountableOwner || deliverable.project.owner}</span><span>Delivery lead: {deliverable.ownership?.deliveryLead || deliverable.lead}</span></div></div></a>)}</div>}</main>;
}

function MeasuresView({ deliverables }) {
  const [projectFilter, setProjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const eligible = deliverables.filter(isBeyondPreDraft);
  const measures = eligible.flatMap((deliverable) => (deliverable.measures || []).map((measure, index) => ({ id: measure.id || `${deliverable.id}-measure-${index}`, deliverable, measure })));
  const types = [...new Set(measures.map((entry) => entry.measure.measureType).filter(Boolean))].sort();
  const projectOptions = projectOptionsFor(eligible);
  const filtered = measures.filter((entry) => (projectFilter === 'all' || entry.deliverable.project.id === projectFilter) && (typeFilter === 'all' || entry.measure.measureType === typeFilter));
  const projectsWithMeasures = new Set(measures.map((entry) => entry.deliverable.project.id)).size;
  return <main><section className="section-heading"><h1>Measures</h1><p>Track benefit measures and evidence questions for deliverables that have moved beyond pre-draft.</p></section><div className="measure-summary"><article className="measure-card"><span>{measures.length}</span><strong>Measures shown</strong></article><article className="measure-card"><span>{projectsWithMeasures}</span><strong>Projects represented</strong></article><article className="measure-card"><span>{eligible.length}</span><strong>Visible deliverables</strong></article></div><div className="toolbar"><select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}><option value="all">All projects</option>{projectOptions.map((project) => <option key={project.id} value={project.id}>{displayId(project)} {project.title}</option>)}</select><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="all">All measure types</option>{types.map((type) => <option key={type} value={type}>{type}</option>)}</select></div>{filtered.length === 0 ? <EmptyState title="No measures to show yet"><p>{measures.length === 0 ? 'Measures will appear here once deliverables have moved beyond pre-draft and have associated measures.' : 'No measures match the current filters.'}</p></EmptyState> : <div className="index-list measure-list">{filtered.map(({ id, deliverable, measure }) => <a href={`#/deliverables/${deliverable.id}`} className="index-row measure-row" key={id}><div><DeliverableContextLine deliverable={deliverable} showProject /><h3>{measure.title}</h3><p>{[measure.questionAnswered, measure.measure, measure.target ? `Target: ${measure.target}` : null, measure.baseline ? `Baseline: ${measure.baseline}` : null, measure.dataSource ? `Source: ${measure.dataSource}` : null].filter(Boolean).join(' · ')}</p></div><div className="index-meta"><strong>{measure.measureType || 'measure'}</strong><span>{measure.confidence || 'Confidence TBC'}</span></div></a>)}</div>}</main>;
}

function FieldCard({ title, children }) {
  return <article className="schema-card"><h3>{title}</h3>{children}</article>;
}

function CaseForChangePanel({ deliverable }) {
  const c = deliverable.caseForChange || {};
  const entries = [['Problem / need', c.problem], ['Opportunity', c.opportunity], ['Why now', c.whyNow], ['Intended change', c.intendedChange]].filter(([, value]) => value);
  if (!entries.length) return null;
  return <section className="panel case-panel"><h2>Case for change</h2><div className="case-grid">{entries.map(([title, value]) => <FieldCard title={title} key={title}><p>{value}</p></FieldCard>)}</div></section>;
}

function OwnershipPanel({ deliverable }) {
  const o = deliverable.ownership || {};
  return <section className="panel ownership-panel"><h2>Ownership and maturity</h2><div className="ownership-grid"><FieldCard title="Accountable owner"><p>{o.accountableOwner}</p></FieldCard><FieldCard title="Delivery lead"><p>{o.deliveryLead}</p></FieldCard><FieldCard title="Benefit owner"><p>{o.benefitOwner}</p></FieldCard><FieldCard title="Decision forum"><p>{o.decisionForum}</p></FieldCard><FieldCard title="Planning maturity"><p>{deliverable.planningMaturity || 'TBC'}</p></FieldCard>{hasItems(o.contributors) && <FieldCard title="Contributors"><ul>{o.contributors.map((item, index) => <li key={index}>{item}</li>)}</ul></FieldCard>}</div></section>;
}

function DeliveryModelPanel({ deliverable }) {
  const { benefits = [], outputs = [], measures = [] } = deliverable;
  if (!benefits.length && !outputs.length && !measures.length) return null;
  return <section className="panel delivery-model-panel"><h2>Benefits, outputs and measures</h2><p className="subtle">This separates the value to realise, the things to produce and the evidence that will tell us whether the benefit is happening.</p><div className="delivery-model-grid">{benefits.length > 0 && <div className="delivery-model-column"><h3>Benefits to realise</h3>{benefits.map((benefit) => <article className="schema-card benefit-card" key={benefit.id}><span className="reference">{benefit.id}</span><h4>{benefit.title}</h4><p>{benefit.statement}</p>{benefit.desiredChange && <p><strong>Desired change:</strong> {benefit.desiredChange}</p>}<p className="schema-meta">{meta([benefit.beneficiary, benefit.benefitType, benefit.realisationPeriod])}</p></article>)}</div>}{outputs.length > 0 && <div className="delivery-model-column"><h3>Outputs to produce</h3>{outputs.map((output) => <article className="schema-card output-card" key={output.id}><span className="reference">{output.id}</span><h4>{output.title}</h4><p>{output.description}</p><p className="schema-meta">{meta([output.type, output.owner, output.duePeriod])}</p>{hasItems(output.acceptanceCriteria) && <ul className="schema-mini-list">{output.acceptanceCriteria.map((item, index) => <li key={index}>{item}</li>)}</ul>}</article>)}</div>}{measures.length > 0 && <div className="delivery-model-column"><h3>Measures and evidence</h3>{measures.map((measure) => <article className="schema-card measure-card-small" key={measure.id}><span className="reference">{measure.id}</span><h4>{measure.title}</h4>{measure.questionAnswered && <p><strong>Question:</strong> {measure.questionAnswered}</p>}<p>{measure.measure}</p><p className="schema-meta">{meta([measure.measureType, measure.owner, measure.cadence, measure.confidence])}</p>{measure.target && <p><strong>Target:</strong> {measure.target}</p>}{measure.baseline && <p><strong>Baseline:</strong> {measure.baseline}</p>}</article>)}</div>}</div></section>;
}

function DefinitionPanel({ deliverable }) {
  return hasItems(deliverable.definitionOfDone) ? <section className="panel definition-panel"><h2>Definition of done</h2><ul className="definition-list">{deliverable.definitionOfDone.map((item, index) => <li key={index}>{asText(item)}</li>)}</ul></section> : null;
}

function RaidPanel({ deliverable }) {
  const sections = [['Risks', deliverable.risks], ['Issues', deliverable.issues], ['Assumptions', deliverable.assumptions], ['Decisions', deliverable.decisions]].filter(([, items]) => hasItems(items));
  return sections.length ? <section className="panel raid-panel"><h2>Risks, issues, assumptions and decisions</h2><div className="raid-grid">{sections.map(([title, items]) => <div className="raid-column" key={title}><h3>{title}</h3>{items.map((item, index) => <article className="schema-card" key={index}><h4>{asText(item)}</h4>{desc(item) && <p>{desc(item)}</p>}<p className="schema-meta">{meta([item.likelihood && `Likelihood: ${item.likelihood}`, item.impact && `Impact: ${item.impact}`, item.owner, item.decisionMaker, item.decisionNeededBy || item.neededBy, item.confidence])}</p></article>)}</div>)}</div></section> : null;
}

function MiniList({ title, items }) {
  return <div className="mini-block"><h4>{title}</h4><ul>{items.map((item, index) => <li key={index}><strong>{asText(item)}</strong>{desc(item) && <p>{desc(item)}</p>}</li>)}</ul></div>;
}

function ResourceList({ title, items, type }) {
  if (!hasItems(items)) return null;
  return <div className={`mini-block resource-block resource-block-${type}`}><h4>{title}</h4><ul>{items.map((item, index) => <li key={index}><strong>{item.role || item.team || item.item || item.condition || 'Resource'}{formatMoney(item) ? ` · ${formatMoney(item)}` : ''}</strong><p>{meta([item.contribution, item.type, item.fte ? `${item.fte} FTE` : null, item.owner, item.sourceTeam, item.category, item.period || item.periodNeeded, item.recurrence, item.fundingRoute, item.confidence, item.rationale, item.whatItUnlocks, item.riskIfMissing])}</p></li>)}</ul></div>;
}

function ResourcesBlock({ resources = {} }) {
  const fallbackList = [...(resources.people || []), ...(resources.cashCosts || []), ...(resources.dataAndSystems || []), ...(resources.governance || []), ...(resources.engagementNeeds || []), ...(resources.nonCashNeeds || [])];
  return <div className="resources-panel"><h3>Resources</h3>{(resources.fundingSummary || resources.resourceSummary) && <p>{resources.fundingSummary || resources.resourceSummary}</p>}{resources.fundingStatus && <p><strong>Funding:</strong> {resources.fundingStatus}</p>}<ResourceList title="Existing capacity to align" items={resources.existingCapacity} type="capacity" /><ResourceList title="New investment required" items={resources.newInvestment} type="investment" /><ResourceList title="Enabling conditions" items={resources.enablingConditions} type="conditions" />{resources.investmentAsk?.required && <div className="mini-block investment-ask-block"><h4>Investment ask</h4><p>{meta([resources.investmentAsk.fundingRoute, resources.investmentAsk.priority, resources.investmentAsk.decisionNeededBy, resources.investmentAsk.confidence])}</p>{resources.investmentAsk.rationale && <p>{resources.investmentAsk.rationale}</p>}</div>}{!hasItems(resources.existingCapacity) && !hasItems(resources.newInvestment) && !hasItems(resources.enablingConditions) && hasItems(fallbackList) && <ResourceList title="Resource assumptions" items={fallbackList} type="fallback" />}</div>;
}

function StepExtras({ step }) {
  const extras = [];
  if (hasItems(step.outputs)) extras.push(<MiniList title="Outputs" items={step.outputs} key="outputs" />);
  if (hasResources(step.resources)) extras.push(<ResourcesBlock resources={step.resources} key="resources" />);
  if (hasItems(step.decisions)) extras.push(<MiniList title="Decisions" items={step.decisions} key="decisions" />);
  if (hasItems(step.issues)) extras.push(<MiniList title="Issues" items={step.issues} key="issues" />);
  if (hasItems(step.assumptions)) extras.push(<MiniList title="Assumptions" items={step.assumptions} key="assumptions" />);
  if (hasItems(step.risks)) extras.push(<MiniList title="Risks" items={step.risks} key="risks" />);
  return extras.length ? <div className="step-extras">{extras}</div> : null;
}

function DeliverableDetail({ deliverable, idMap, dependencyIndex }) {
  const [showDetailedPlan, setShowDetailedPlan] = useState(false);
  if (!deliverable) return <main><section className="section-heading"><h1>Deliverable not found</h1></section></main>;
  const stepDeps = [...new Set(deliverable.steps.flatMap((step) => getStepDependencies(step)))];
  const onward = deliverable.steps.flatMap((step) => dependencyIndex.get(step.id) || []);
  const detailIntro = showDetailedPlan ? 'Detailed planning fields are shown below.' : isPreDraft(deliverable) ? 'Detailed project-management fields are hidden by default so pre-draft material is not presented as settled.' : 'Detailed project-management fields are hidden by default to keep the page scannable.';
  return <main><a className="back-link" href="#/deliverables">Back to deliverables</a><section className="detail-hero"><div className="deliverable-context-line hero-context-line"><span className="reference hero-reference">{displayId(deliverable)}</span><span className="project-context">Project {displayId(deliverable.project)} {deliverable.project.title}</span><PlanningStatusTag item={deliverable} /></div><h1><span className="hero-title-text">{deliverable.title}</span></h1><p>{deliverable.summary}</p><DetailSummary item={deliverable} /><div className="detail-meta"><span>Accountable owner: {deliverable.ownership?.accountableOwner || deliverable.project.owner}</span><span>Delivery lead: {deliverable.ownership?.deliveryLead || deliverable.lead}</span></div></section><PlanningNotice deliverable={deliverable} /><CaseForChangePanel deliverable={deliverable} /><section className="panel detailed-plan-control"><h2>Detailed plan</h2><p>{detailIntro}</p><button type="button" className="detail-toggle-button" onClick={() => setShowDetailedPlan((value) => !value)}>{showDetailedPlan ? 'Hide detailed plan' : 'Reveal detailed plan'}</button></section>{showDetailedPlan && <div className="detailed-plan-reveal">{isPreDraft(deliverable) && <section className="panel pre-draft-note"><h2>Pre-draft planning detail</h2><p>This deliverable is currently pre-draft. Detailed planning fields are working assumptions and will be refined through deliverable-level scrutiny.</p></section>}<OwnershipPanel deliverable={deliverable} /><DeliveryModelPanel deliverable={deliverable} /><DefinitionPanel deliverable={deliverable} />{hasResources(deliverable.resources) && <section className="panel"><ResourcesBlock resources={deliverable.resources} /></section>}<section className="panel"><h2>Components</h2><div className="component-grid">{(deliverable.components || []).map((component) => <article className="component-card" key={component.title}><h3>{component.title}</h3><p>{component.summary}</p></article>)}</div></section><section className="panel"><h2>Delivery steps</h2><div className="steps-list">{deliverable.steps.map((step) => <article className={`step-card ${isPreDraft(deliverable) ? 'indicative-step-card' : ''}`} key={step.id}><span className="period-pill">{periodLabel(step.period)}</span>{isPreDraft(deliverable) && <span className="indicative-label">Indicative</span>}<h3>{step.title}</h3><p>{step.summary}</p>{getStepDependencies(step).length > 0 && <p className="depends">Depends on: {getStepDependencies(step).map((id) => resolveLabel(id, idMap)).join('; ')}</p>}<StepExtras step={step} /></article>)}</div></section><RaidPanel deliverable={deliverable} /><div className="detail-grid"><section className="panel"><h2>Step dependencies</h2>{stepDeps.length ? <div className="link-list">{stepDeps.map((id) => <SmartLink key={id} id={id} idMap={idMap} />)}</div> : <p>No step-level dependencies captured yet.</p>}</section><section className="panel"><h2>Feeds into</h2>{onward.length ? <ul className="compact-list">{onward.map((entry, index) => <li key={`${entry.parent.id}-${entry.step.id}-${index}`}><SmartLink id={entry.step.id} idMap={idMap} /></li>)}</ul> : <p>No onward step dependencies captured yet.</p>}</section></div></div>}</main>;
}

function TimelineView({ timelineItems, idMap, dependencyIndex }) {
  const periods = [...timelinePeriods].sort((a, b) => a.order - b.order);
  const [projectFilter, setProjectFilter] = useState('all');
  const [selectedStepId, setSelectedStepId] = useState(null);
  const [modalStepId, setModalStepId] = useState(null);
  const eligible = timelineItems.filter(isBeyondPreDraft);
  const availableProjectIds = new Set(eligible.map((item) => item.project?.id).filter(Boolean));
  const projectOptions = projects.filter((project) => availableProjectIds.has(project.id));
  const selectedEntry = selectedStepId ? idMap.get(selectedStepId) : null;
  const selectedStep = selectedEntry?.type === 'step' ? selectedEntry.item : null;
  const selectedDeps = selectedStep ? getStepDependencies(selectedStep) : [];
  const selectedOnward = selectedStepId ? dependencyIndex.get(selectedStepId) || [] : [];
  const modalEntry = modalStepId ? idMap.get(modalStepId) : null;
  const modalStep = modalEntry?.type === 'step' ? modalEntry.item : null;
  const modalParent = modalEntry?.type === 'step' ? modalEntry.parent : null;
  const modalDeps = modalStep ? getStepDependencies(modalStep) : [];
  const modalOnward = modalStepId ? dependencyIndex.get(modalStepId) || [] : [];
  const onwardIds = new Set(selectedOnward.map((entry) => entry.step.id));
  const rows = eligible.filter((item) => projectFilter === 'all' || item.project?.id === projectFilter);
  const gridTemplate = { gridTemplateColumns: `300px repeat(${periods.length}, minmax(132px, 1fr))` };
  const laneTemplate = { gridTemplateColumns: `repeat(${periods.length}, minmax(132px, 1fr))` };
  const blockClass = (item, step) => ['timeline-block', statusClass(getStatus(step.id).status), selectedStepId === step.id ? 'selected' : '', selectedDeps.includes(step.id) ? 'dependency-highlight' : '', onwardIds.has(step.id) ? 'dependent-highlight' : '', selectedStepId && selectedStepId !== step.id && !selectedDeps.includes(step.id) && !onwardIds.has(step.id) ? 'dimmed' : ''].join(' ');
  const stepStyle = (step) => ({ gridColumn: `${getStepPeriodSpan(step.period).startIndex} / span ${getStepPeriodSpan(step.period).span}` });
  return <main className="timeline-page"><section className="section-heading"><h1>Timeline</h1><p>Click a step to highlight dependencies. Only deliverables that have moved beyond pre-draft are shown.</p></section><div className="timeline-controls"><select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}><option value="all">All projects</option>{projectOptions.map((project) => <option key={project.id} value={project.id}>{displayId(project)} {project.title}</option>)}</select>{selectedStepId && <button type="button" className="secondary-button" onClick={() => setSelectedStepId(null)}>Clear selection</button>}</div><div className="timeline-key"><span><i className="key-box selected-key" /> Selected</span><span><i className="key-box dependency-key" /> Depends on</span><span><i className="key-box dependent-key" /> Feeds into</span></div>{rows.length === 0 ? <EmptyState title="No timeline items to show yet"><p>{eligible.length === 0 ? 'Timeline items will appear here once deliverables have moved beyond pre-draft.' : 'No timeline items match the current filters.'}</p></EmptyState> : <div className="timeline timeline-refresh"><div className="timeline-header timeline-grid" style={gridTemplate}><div>Project / deliverable</div>{periods.map((period) => <div key={period.id}>{period.shortLabel}</div>)}</div>{rows.map((item) => <div className={`timeline-row timeline-grid ${item.project.deliveryContext === 'out-of-programme' ? 'enabling-row' : ''}`} style={gridTemplate} key={item.id}><a className="timeline-title" href={`#/deliverables/${item.id}`}><DeliverableContextLine deliverable={item} /><strong>{item.title}</strong><span>{item.ownerLabel}</span></a><div className="timeline-lane" style={laneTemplate}>{item.steps.map((step) => <button type="button" className={blockClass(item, step)} style={stepStyle(step)} key={step.id} title={`${periodLabel(step.period)}. Double-click for details.`} onClick={() => setSelectedStepId(step.id)} onDoubleClick={() => { setSelectedStepId(step.id); setModalStepId(step.id); }}><span>{step.title}</span>{getStepDependencies(step).length > 0 && <span className="dependency-dot">↳</span>}</button>)}</div></div>)}</div>}<TimelineStepModal step={modalStep} parent={modalParent} deps={modalDeps} onward={modalOnward} idMap={idMap} onClose={() => setModalStepId(null)} /></main>;
}

function TimelineStepModal({ step, parent, deps, onward, idMap, onClose }) {
  useEffect(() => {
    if (!step) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [step, onClose]);
  if (!step || !parent) return null;
  return <div className="timeline-modal-backdrop" role="presentation" onClick={onClose}><section className="timeline-modal" role="dialog" aria-modal="true" aria-labelledby="timeline-modal-title" onClick={(event) => event.stopPropagation()}><button type="button" className="timeline-modal-close" onClick={onClose}>Close</button><div className="timeline-modal-main"><h2 id="timeline-modal-title">{displayId(parent)}: {step.title}</h2><PlanningStatusTag item={parent} /><p>{step.summary}</p><span className="period-pill">{periodLabel(step.period)}</span></div><div className="timeline-modal-grid"><div><h3>Depends on</h3>{deps.length ? <div className="link-list">{deps.map((id) => <SmartLink key={id} id={id} idMap={idMap} />)}</div> : <p>No step-level dependencies captured.</p>}</div><div><h3>Feeds into</h3>{onward.length ? <ul className="compact-list">{onward.map((entry, index) => <li key={`${entry.parent.id}-${entry.step.id}-${index}`}><SmartLink id={entry.step.id} idMap={idMap} /></li>)}</ul> : <p>No onward dependencies captured yet.</p>}</div></div></section></div>;
}

function Site() {
  const path = useHashRoute();
  const { deliverables, timelineItems, idMap } = useMemo(() => buildLookups(projects), []);
  const dependencyIndex = useMemo(() => buildDependencyIndex(timelineItems), [timelineItems]);
  const detailMatch = path.match(/^\/deliverables\/(.+)$/);
  const projectMatch = path.match(/^\/projects\/(.+)$/);
  const detailDeliverable = detailMatch ? deliverables.find((deliverable) => deliverable.id === detailMatch[1]) : null;
  const detailProject = projectMatch ? projects.find((project) => project.id === projectMatch[1]) : null;
  let page;
  if (detailMatch) page = <DeliverableDetail deliverable={detailDeliverable} idMap={idMap} dependencyIndex={dependencyIndex} />;
  else if (projectMatch) page = <ProjectDetail project={detailProject} />;
  else if (path === '/projects' || path === '/enabling-projects' || path === '/dependencies') page = <ProjectsPage />;
  else if (path === '/deliverables') page = <DeliverablesIndex deliverables={deliverables} />;
  else if (path === '/measures') page = <MeasuresView deliverables={deliverables} />;
  else if (path === '/timeline') page = <TimelineView timelineItems={timelineItems} idMap={idMap} dependencyIndex={dependencyIndex} />;
  else page = <Landing />;
  return <><Nav />{page}<footer className="site-footer"><p>King's Edge Mobilisation Plan. Rendered from JSON data.</p></footer></>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><Site /></React.StrictMode>);
