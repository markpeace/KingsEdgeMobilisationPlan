import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { plan, enablingProjects, buildLookups, buildDependencyIndex, getStepDependencies, resolveLabel, periodLabel } from './plan-utils.js';
import { getStatus, labelStatus, labelConfidence, statusClass, confidenceClass } from './status-utils.js';
import './styles.css';

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

function Nav() {
  return <header className="site-header"><a href="#/" className="brand">King's Edge Mobilisation Plan</a><nav><a href="#/">Home</a><a href="#/projects">Projects</a><a href="#/deliverables">Deliverables</a><a href="#/timeline">Timeline</a></nav></header>;
}

function StatusPills({ id, compact = false }) {
  const status = getStatus(id);
  return <div className={`status-pills ${compact ? 'compact' : ''}`} title={status.note}><span className={`status-pill ${statusClass(status.status)}`}>{labelStatus(status.status)}</span><span className={`status-pill ${confidenceClass(status.confidence)}`}>{labelConfidence(status.confidence)}</span>{status.decisionNeeded && <span className="status-pill decision-needed">Decision needed</span>}</div>;
}

function StatusPanel({ id }) {
  const status = getStatus(id);
  return <section className="panel status-panel"><h2>Status</h2><StatusPills id={id} /><p>{status.note}</p></section>;
}

function SmartLink({ id, idMap }) {
  const result = idMap.get(id);
  if (!result) return <span className="chip">{id}</span>;
  if (result.type === 'deliverable') return <a className="chip" href={`#/deliverables/${id}`}>{result.item.id} {result.item.title}</a>;
  if (result.type === 'enablingProject') return <a className="chip" href={`#/projects/${id}`}>{result.item.title}</a>;
  if (result.type === 'step') return <a className="chip" href={result.parent.itemType === 'deliverable' ? `#/deliverables/${result.parent.id}` : `#/projects/${result.parent.id}`}>{result.parent.id}: {result.item.title}</a>;
  return <span className="chip">{resolveLabel(id, idMap)}</span>;
}

function Landing() {
  return <main className="landing-main"><section className="hero landing-hero"><p className="eyebrow">Interactive delivery map</p><h1>{plan.programme.title}</h1><p>{plan.programme.purpose}</p><div className="landing-links"><a href="#/projects"><span>01</span><strong>Projects view</strong><em>Browse the core projects and the related out of programme work.</em></a><a href="#/deliverables"><span>02</span><strong>Deliverables index</strong><em>Search and filter by project, status and confidence.</em></a><a href="#/timeline"><span>03</span><strong>Timeline</strong><em>View sequencing and step-to-step dependencies.</em></a></div></section></main>;
}

function ProjectsPage() {
  return <main><section className="section-heading projects-heading"><h1>Projects View</h1><p>Click any project header for its project page. Scroll right to expose projects delivered out of programme.</p></section><div className="project-board"><div className="project-scroll">{plan.projects.map((project) => <ProjectColumn key={project.id} project={project} />)}<div className="programme-divider" aria-label="Scroll right for out of programme projects"><span>→ → →</span></div>{enablingProjects.map((project) => <RelatedProjectColumn key={project.id} project={project} />)}</div></div></main>;
}

function ProjectColumn({ project }) {
  return <section className="project-column"><a className="project-column-header project-header-link" href={`#/projects/${project.id}`}><span className="reference">{project.id}</span><h2>{project.title}</h2><p>{project.summary}</p><p className="owner">Owner: {project.owner}</p></a><div className="deliverable-stack">{project.deliverables.map((deliverable) => <a className="deliverable-card" href={`#/deliverables/${deliverable.id}`} key={deliverable.id}><span className="reference">{deliverable.id}</span><h3>{deliverable.title}</h3><p>{deliverable.summary}</p><StatusPills id={deliverable.id} compact /><p className="lead">Lead: {deliverable.lead}</p></a>)}</div></section>;
}

function RelatedProjectColumn({ project }) {
  return <section className="project-column related-project-column"><a className="project-column-header related-project-header" href={`#/projects/${project.id}`}><span className="reference">Out</span><h2>{project.title}</h2><p>{project.summary}</p><p className="owner">Owner: {project.owner}</p></a><div className="deliverable-stack">{project.steps.map((step) => <a className="deliverable-card related-step-card" href={`#/projects/${project.id}`} key={step.id}><span className="reference">{periodLabel(step.period)}</span><h3>{step.title}</h3><p>{step.summary}</p><StatusPills id={step.id} compact /></a>)}</div></section>;
}

function ProjectDetail({ project }) {
  if (!project) return <main><section className="section-heading"><h1>Project not found</h1><p><a href="#/projects">Return to Projects View</a></p></section></main>;

  const isRelatedProject = !project.deliverables;
  const items = isRelatedProject ? project.steps : project.deliverables;

  return <main><a className="back-link" href="#/projects">Back to Projects View</a><section className={`detail-hero project-detail-hero ${isRelatedProject ? 'related-project-detail-hero' : ''}`}><h1>{project.title}</h1><p>{project.summary}</p>{isRelatedProject && <p>{project.edgeRole}</p>}<div className="detail-meta"><span>Project owner: {project.owner}</span><span>{items.length} {isRelatedProject ? 'steps' : 'deliverables'}</span></div></section><section className="panel"><h2>{isRelatedProject ? 'Delivery steps' : 'Deliverables'}</h2><div className="component-grid project-detail-deliverables">{isRelatedProject ? project.steps.map((step) => <article className="component-card project-detail-card" key={step.id}><span className="reference">{periodLabel(step.period)}</span><h3>{step.title}</h3><p>{step.summary}</p><StatusPills id={step.id} compact /></article>) : project.deliverables.map((deliverable) => <a className="component-card project-detail-card" href={`#/deliverables/${deliverable.id}`} key={deliverable.id}><span className="reference">{deliverable.id}</span><h3>{deliverable.title}</h3><p>{deliverable.summary}</p><StatusPills id={deliverable.id} compact /><p className="lead">Lead: {deliverable.lead}</p></a>)}</div></section>{isRelatedProject && <section className="panel"><h2>Serves Edge deliverables</h2><div className="link-list">{project.servesDeliverables.map((id) => <a className="chip" href={`#/deliverables/${id}`} key={id}>{id}</a>)}</div></section>}</main>;
}

function DeliverablesIndex({ deliverables }) {
  const [query, setQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const filtered = deliverables.filter((deliverable) => {
    const status = getStatus(deliverable.id);
    const matchesProject = projectFilter === 'all' || deliverable.project.id === projectFilter;
    const matchesStatus = statusFilter === 'all' || status.status === statusFilter;
    const matchesConfidence = confidenceFilter === 'all' || status.confidence === confidenceFilter;
    const text = [deliverable.id, deliverable.title, deliverable.lead, deliverable.summary, ...(deliverable.tags || [])].join(' ').toLowerCase();
    return matchesProject && matchesStatus && matchesConfidence && text.includes(query.toLowerCase());
  });
  return <main><section className="section-heading"><h1>Deliverables index</h1><p>Search or filter across all sixteen Edge deliverables.</p></section><div className="toolbar"><input type="search" placeholder="Search deliverables, owners or themes" value={query} onChange={(event) => setQuery(event.target.value)} /><select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}><option value="all">All projects</option>{plan.projects.map((project) => <option key={project.id} value={project.id}>{project.id} {project.title}</option>)}</select><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="not-started">Not started</option><option value="scoping">Scoping</option><option value="active">Active</option><option value="blocked">Blocked</option><option value="complete">Complete</option></select><select value={confidenceFilter} onChange={(event) => setConfidenceFilter(event.target.value)}><option value="all">All confidence levels</option><option value="settled">Settled</option><option value="needs-validation">Needs validation</option><option value="placeholder">Placeholder</option></select></div><div className="index-list">{filtered.map((deliverable) => <a href={`#/deliverables/${deliverable.id}`} className="index-row" key={deliverable.id}><div><span className="reference">{deliverable.id}</span><h3>{deliverable.title}</h3><p>{deliverable.summary}</p><StatusPills id={deliverable.id} compact /></div><div className="index-meta"><span>{deliverable.project.title}</span><strong>{deliverable.lead}</strong></div></a>)}</div></main>;
}

function DeliverableDetail({ deliverable, idMap, dependencyIndex }) {
  if (!deliverable) return <main><section className="section-heading"><h1>Deliverable not found</h1></section></main>;
  const stepDeps = [...new Set(deliverable.steps.flatMap((step) => getStepDependencies(step)))];
  const onward = deliverable.steps.flatMap((step) => dependencyIndex.get(step.id) || []);
  return <main><a className="back-link" href="#/deliverables">Back to deliverables</a><section className="detail-hero"><h1>{deliverable.id} {deliverable.title}</h1><p>{deliverable.summary}</p><StatusPills id={deliverable.id} /><div className="detail-meta"><span>Project owner: {deliverable.project.owner}</span><span>Deliverable lead: {deliverable.lead}</span></div></section><div className="detail-grid"><section className="panel"><h2>Problem solved</h2><p>{deliverable.problemSolved}</p></section><section className="panel"><h2>What changes</h2><p>{deliverable.whatChanges}</p></section></div><StatusPanel id={deliverable.id} /><section className="panel"><h2>Components</h2><div className="component-grid">{deliverable.components.map((component) => <article className="component-card" key={component.title}><h3>{component.title}</h3><p>{component.summary}</p></article>)}</div></section><section className="panel"><h2>Delivery steps</h2><div className="steps-list">{deliverable.steps.map((step) => <article className="step-card" key={step.id}><span className="period-pill">{periodLabel(step.period)}</span><h3>{step.title}</h3><p>{step.summary}</p><StatusPills id={step.id} compact />{getStepDependencies(step).length > 0 && <p className="depends">Depends on: {getStepDependencies(step).map((id) => resolveLabel(id, idMap)).join('; ')}</p>}</article>)}</div></section><div className="detail-grid"><section className="panel"><h2>Step dependencies</h2>{stepDeps.length ? <div className="link-list">{stepDeps.map((id) => <SmartLink key={id} id={id} idMap={idMap} />)}</div> : <p>No step-level dependencies captured yet.</p>}</section><section className="panel"><h2>Feeds into</h2>{onward.length ? <ul className="compact-list">{onward.map((entry, index) => <li key={`${entry.parent.id}-${entry.step.id}-${index}`}><SmartLink id={entry.step.id} idMap={idMap} /></li>)}</ul> : <p>No onward step dependencies captured yet.</p>}</section></div></main>;
}

function TimelineView({ timelineItems, idMap, dependencyIndex }) {
  const periods = [...plan.timelinePeriods].sort((a, b) => a.order - b.order);
  const [projectFilter, setProjectFilter] = useState('all');
  const [showRelated, setShowRelated] = useState(true);
  const [selectedStepId, setSelectedStepId] = useState(null);
  const selectedEntry = selectedStepId ? idMap.get(selectedStepId) : null;
  const selectedStep = selectedEntry?.type === 'step' ? selectedEntry.item : null;
  const selectedParent = selectedEntry?.type === 'step' ? selectedEntry.parent : null;
  const selectedDeps = selectedStep ? getStepDependencies(selectedStep) : [];
  const selectedOnward = selectedStepId ? dependencyIndex.get(selectedStepId) || [] : [];
  const onwardIds = new Set(selectedOnward.map((entry) => entry.step.id));
  const rows = timelineItems.filter((item) => {
    if (item.itemType === 'enablingProject' && !showRelated) return false;
    if (projectFilter === 'all') return true;
    if (projectFilter === 'related') return item.itemType === 'enablingProject';
    return item.project?.id === projectFilter;
  });
  const blockClass = (step) => ['timeline-block', statusClass(getStatus(step.id).status), selectedStepId === step.id ? 'selected' : '', selectedDeps.includes(step.id) ? 'dependency-highlight' : '', onwardIds.has(step.id) ? 'dependent-highlight' : '', selectedStepId && selectedStepId !== step.id && !selectedDeps.includes(step.id) && !onwardIds.has(step.id) ? 'dimmed' : ''].join(' ');
  return <main><section className="section-heading"><h1>Timeline</h1><p>Click a step to show the interplay between delivery steps across Edge and out of programme projects.</p></section><div className="toolbar timeline-toolbar"><select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}><option value="all">All projects</option>{plan.projects.map((project) => <option key={project.id} value={project.id}>{project.id} {project.title}</option>)}<option value="related">Out of programme projects</option></select><label className="toggle-label"><input type="checkbox" checked={showRelated} onChange={(event) => setShowRelated(event.target.checked)} /> Show out of programme projects</label>{selectedStepId && <button type="button" className="secondary-button" onClick={() => setSelectedStepId(null)}>Clear selection</button>}</div><DependencyLens step={selectedStep} parent={selectedParent} deps={selectedDeps} onward={selectedOnward} idMap={idMap} /><div className="timeline-key"><span><i className="key-box selected-key" /> Selected</span><span><i className="key-box dependency-key" /> Depends on</span><span><i className="key-box dependent-key" /> Feeds into</span><span><i className="key-box status-active-key" /> Active</span><span><i className="key-box status-scoping-key" /> Scoping</span></div><div className="timeline"><div className="timeline-header"><div>Project / deliverable</div>{periods.map((period) => <div key={period.id}>{period.shortLabel}</div>)}</div>{rows.map((item) => <div className={`timeline-row ${item.itemType === 'enablingProject' ? 'enabling-row' : ''}`} key={item.id}><a className="timeline-title" href={item.itemType === 'deliverable' ? `#/deliverables/${item.id}` : `#/projects/${item.id}`}><span className="reference">{item.id}</span><strong>{item.title}</strong><span>{item.ownerLabel}</span><StatusPills id={item.id} compact /></a>{periods.map((period) => <div className="timeline-cell" key={`${item.id}-${period.id}`}>{item.steps.filter((step) => step.period === period.id).map((step) => <button type="button" className={blockClass(step)} key={step.id} onClick={() => setSelectedStepId(step.id)}><span>{step.title}</span>{getStepDependencies(step).length > 0 && <span className="dependency-dot">↳</span>}</button>)}</div>)}</div>)}</div></main>;
}

function DependencyLens({ step, parent, deps, onward, idMap }) {
  if (!step || !parent) return <section className="dependency-lens empty"><div><h2>Dependency lens</h2><p>Select a timeline step to see what it needs and what it enables.</p></div></section>;
  return <section className="dependency-lens"><div><h2>{parent.id}: {step.title}</h2><p>{step.summary}</p><span className="period-pill">{periodLabel(step.period)}</span><StatusPills id={step.id} /></div><div><h3>Depends on</h3>{deps.length ? <div className="link-list">{deps.map((id) => <SmartLink key={id} id={id} idMap={idMap} />)}</div> : <p>No step-level dependencies captured.</p>}</div><div><h3>Feeds into</h3>{onward.length ? <ul className="compact-list">{onward.map((entry, index) => <li key={`${entry.parent.id}-${entry.step.id}-${index}`}><SmartLink id={entry.step.id} idMap={idMap} /></li>)}</ul> : <p>No onward dependencies captured yet.</p>}</div></section>;
}

function EnablingProjectsView() {
  return <ProjectsPage />;
}

function Site() {
  const path = useHashRoute();
  const { deliverables, timelineItems, idMap } = useMemo(() => buildLookups(plan.projects, enablingProjects), []);
  const dependencyIndex = useMemo(() => buildDependencyIndex(timelineItems), [timelineItems]);
  const detailMatch = path.match(/^\/deliverables\/(.+)$/);
  const projectMatch = path.match(/^\/projects\/(.+)$/);
  const detailDeliverable = detailMatch ? deliverables.find((deliverable) => deliverable.id === detailMatch[1]) : null;
  const detailProject = projectMatch ? [...plan.projects, ...enablingProjects].find((project) => project.id === projectMatch[1]) : null;
  let page;
  if (detailMatch) page = <DeliverableDetail deliverable={detailDeliverable} idMap={idMap} dependencyIndex={dependencyIndex} />;
  else if (projectMatch) page = <ProjectDetail project={detailProject} />;
  else if (path === '/projects') page = <ProjectsPage />;
  else if (path === '/deliverables') page = <DeliverablesIndex deliverables={deliverables} />;
  else if (path === '/timeline') page = <TimelineView timelineItems={timelineItems} idMap={idMap} dependencyIndex={dependencyIndex} />;
  else if (path === '/enabling-projects' || path === '/dependencies') page = <EnablingProjectsView />;
  else page = <Landing />;
  return <><Nav />{page}<footer className="site-footer"><p>King's Edge Mobilisation Plan. Rendered from JSON data.</p></footer></>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><Site /></React.StrictMode>);
