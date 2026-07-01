import { useEffect, useMemo, useState } from 'react';
import { plan, enablingProjects, buildLookups, buildDependencyIndex, getStepDependencies, resolveLabel, periodLabel } from './plan-utils.js';

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
  return <header className="site-header"><a href="#/" className="brand">King's Edge Mobilisation Plan</a><nav><a href="#/">Overview</a><a href="#/deliverables">Deliverables</a><a href="#/timeline">Timeline</a><a href="#/enabling-projects">Related projects</a></nav></header>;
}

function SmartLink({ id, idMap }) {
  const result = idMap.get(id);
  if (!result) return <span className="chip">{id}</span>;
  if (result.type === 'deliverable') return <a className="chip" href={`#/deliverables/${id}`}>{result.item.id} {result.item.title}</a>;
  if (result.type === 'enablingProject') return <a className="chip" href="#/enabling-projects">{result.item.title}</a>;
  if (result.type === 'step') return <a className="chip" href={result.parent.itemType === 'deliverable' ? `#/deliverables/${result.parent.id}` : '#/enabling-projects'}>{result.parent.id}: {result.item.title}</a>;
  return <span className="chip">{resolveLabel(id, idMap)}</span>;
}

function Overview() {
  return <main><section className="hero"><p className="eyebrow">Interactive delivery map</p><h1>{plan.programme.title}</h1><p>{plan.programme.purpose}</p></section><section className="section-heading"><h2>King's Edge projects and deliverables</h2><p>Browse the four Edge projects and click any deliverable to drill into its detailed plan.</p></section><div className="project-grid">{plan.projects.map((project) => <ProjectColumn key={project.id} project={project} />)}</div><section className="sidebars-preview"><h2>Related delivery projects</h2><p className="subtle">These are parallel projects in the wider portfolio that carry some of the core requirements for Edge.</p><div className="dependency-grid">{enablingProjects.map((project) => <EnablingCard key={project.id} project={project} compact />)}</div></section></main>;
}

function ProjectColumn({ project }) {
  return <section className="project-column"><div className="project-column-header"><span className="reference">{project.id}</span><h2>{project.title}</h2><p>{project.summary}</p><p className="owner">Owner: {project.owner}</p></div><div className="deliverable-stack">{project.deliverables.map((deliverable) => <a className="deliverable-card" href={`#/deliverables/${deliverable.id}`} key={deliverable.id}><span className="reference">{deliverable.id}</span><h3>{deliverable.title}</h3><p>{deliverable.summary}</p><p className="lead">Lead: {deliverable.lead}</p></a>)}</div></section>;
}

function DeliverablesIndex({ deliverables }) {
  const [query, setQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const filtered = deliverables.filter((deliverable) => {
    const matchesProject = projectFilter === 'all' || deliverable.project.id === projectFilter;
    const text = [deliverable.id, deliverable.title, deliverable.lead, deliverable.summary, ...(deliverable.tags || [])].join(' ').toLowerCase();
    return matchesProject && text.includes(query.toLowerCase());
  });
  return <main><section className="section-heading"><p className="eyebrow">Deliverables index</p><h1>Browse by deliverable</h1><p>Search or filter across all sixteen Edge deliverables.</p></section><div className="toolbar"><input type="search" placeholder="Search deliverables, owners or themes" value={query} onChange={(event) => setQuery(event.target.value)} /><select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}><option value="all">All projects</option>{plan.projects.map((project) => <option key={project.id} value={project.id}>{project.id} {project.title}</option>)}</select></div><div className="index-list">{filtered.map((deliverable) => <a href={`#/deliverables/${deliverable.id}`} className="index-row" key={deliverable.id}><div><span className="reference">{deliverable.id}</span><h3>{deliverable.title}</h3><p>{deliverable.summary}</p></div><div className="index-meta"><span>{deliverable.project.title}</span><strong>{deliverable.lead}</strong></div></a>)}</div></main>;
}

function DeliverableDetail({ deliverable, idMap, dependencyIndex }) {
  if (!deliverable) return <main><section className="section-heading"><h1>Deliverable not found</h1></section></main>;
  const stepDeps = [...new Set(deliverable.steps.flatMap((step) => getStepDependencies(step)))];
  const onward = deliverable.steps.flatMap((step) => dependencyIndex.get(step.id) || []);
  return <main><a className="back-link" href="#/deliverables">Back to deliverables</a><section className="detail-hero"><p className="eyebrow">{deliverable.project.id} {deliverable.project.title}</p><h1>{deliverable.id} {deliverable.title}</h1><p>{deliverable.summary}</p><div className="detail-meta"><span>Project owner: {deliverable.project.owner}</span><span>Deliverable lead: {deliverable.lead}</span></div></section><div className="detail-grid"><section className="panel"><h2>Problem solved</h2><p>{deliverable.problemSolved}</p></section><section className="panel"><h2>What changes</h2><p>{deliverable.whatChanges}</p></section></div><section className="panel"><h2>Components</h2><div className="component-grid">{deliverable.components.map((component) => <article className="component-card" key={component.title}><h3>{component.title}</h3><p>{component.summary}</p></article>)}</div></section><section className="panel"><h2>Delivery steps</h2><div className="steps-list">{deliverable.steps.map((step) => <article className="step-card" key={step.id}><span className="period-pill">{periodLabel(step.period)}</span><h3>{step.title}</h3><p>{step.summary}</p>{getStepDependencies(step).length > 0 && <p className="depends">Depends on: {getStepDependencies(step).map((id) => resolveLabel(id, idMap)).join('; ')}</p>}</article>)}</div></section><div className="detail-grid"><section className="panel"><h2>Step dependencies</h2>{stepDeps.length ? <div className="link-list">{stepDeps.map((id) => <SmartLink key={id} id={id} idMap={idMap} />)}</div> : <p>No step-level dependencies captured yet.</p>}</section><section className="panel"><h2>Feeds into</h2>{onward.length ? <ul className="compact-list">{onward.map((entry, index) => <li key={`${entry.parent.id}-${entry.step.id}-${index}`}><SmartLink id={entry.step.id} idMap={idMap} /></li>)}</ul> : <p>No onward step dependencies captured yet.</p>}</section></div></main>;
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
  const blockClass = (step) => ['timeline-block', selectedStepId === step.id ? 'selected' : '', selectedDeps.includes(step.id) ? 'dependency-highlight' : '', onwardIds.has(step.id) ? 'dependent-highlight' : '', selectedStepId && selectedStepId !== step.id && !selectedDeps.includes(step.id) && !onwardIds.has(step.id) ? 'dimmed' : ''].join(' ');
  return <main><section className="section-heading"><p className="eyebrow">Timeline</p><h1>Gantt-style delivery view</h1><p>Click a step to show the interplay between delivery steps across Edge and related projects.</p></section><div className="toolbar timeline-toolbar"><select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}><option value="all">All projects</option>{plan.projects.map((project) => <option key={project.id} value={project.id}>{project.id} {project.title}</option>)}<option value="related">Related projects</option></select><label className="toggle-label"><input type="checkbox" checked={showRelated} onChange={(event) => setShowRelated(event.target.checked)} /> Show related projects</label>{selectedStepId && <button type="button" className="secondary-button" onClick={() => setSelectedStepId(null)}>Clear selection</button>}</div><DependencyLens step={selectedStep} parent={selectedParent} deps={selectedDeps} onward={selectedOnward} idMap={idMap} /><div className="timeline-key"><span><i className="key-box selected-key" /> Selected</span><span><i className="key-box dependency-key" /> Depends on</span><span><i className="key-box dependent-key" /> Feeds into</span></div><div className="timeline"><div className="timeline-header"><div>Project / deliverable</div>{periods.map((period) => <div key={period.id}>{period.shortLabel}</div>)}</div>{rows.map((item) => <div className={`timeline-row ${item.itemType === 'enablingProject' ? 'enabling-row' : ''}`} key={item.id}><a className="timeline-title" href={item.itemType === 'deliverable' ? `#/deliverables/${item.id}` : '#/enabling-projects'}><span className="reference">{item.id}</span><strong>{item.title}</strong><span>{item.ownerLabel}</span></a>{periods.map((period) => <div className="timeline-cell" key={`${item.id}-${period.id}`}>{item.steps.filter((step) => step.period === period.id).map((step) => <button type="button" className={blockClass(step)} key={step.id} onClick={() => setSelectedStepId(step.id)}><span>{step.title}</span>{getStepDependencies(step).length > 0 && <span className="dependency-dot">↳</span>}</button>)}</div>)}</div>)}</div></main>;
}

function DependencyLens({ step, parent, deps, onward, idMap }) {
  if (!step || !parent) return <section className="dependency-lens empty"><div><h2>Dependency lens</h2><p>Select a timeline step to see what it needs and what it enables.</p></div></section>;
  return <section className="dependency-lens"><div><p className="eyebrow">Selected step</p><h2>{parent.id}: {step.title}</h2><p>{step.summary}</p><span className="period-pill">{periodLabel(step.period)}</span></div><div><h3>Depends on</h3>{deps.length ? <div className="link-list">{deps.map((id) => <SmartLink key={id} id={id} idMap={idMap} />)}</div> : <p>No step-level dependencies captured.</p>}</div><div><h3>Feeds into</h3>{onward.length ? <ul className="compact-list">{onward.map((entry, index) => <li key={`${entry.parent.id}-${entry.step.id}-${index}`}><SmartLink id={entry.step.id} idMap={idMap} /></li>)}</ul> : <p>No onward dependencies captured yet.</p>}</div></section>;
}

function EnablingProjectsView({ idMap }) {
  return <main><section className="section-heading"><p className="eyebrow">Related projects</p><h1>Wider projects carrying Edge requirements</h1><p>These are parallel delivery projects in the wider portfolio. They have their own steps and appear in the timeline.</p></section><div className="dependency-grid large">{enablingProjects.map((project) => <EnablingCard key={project.id} project={project} idMap={idMap} />)}</div></main>;
}

function EnablingCard({ project, idMap, compact = false }) {
  if (compact) return <article className="dependency-card"><span className="reference">{project.id}</span><h3>{project.title}</h3><p>{project.summary}</p><p className="owner">Owner: {project.owner}</p></article>;
  return <article className="dependency-card"><span className="reference">{project.id}</span><h3>{project.title}</h3><p>{project.summary}</p><p className="owner">Owner: {project.owner}</p><h4>Edge role</h4><p>{project.edgeRole}</p><h4>Delivery steps</h4><div className="steps-list single-column">{project.steps.map((step) => <article className="step-card" key={step.id}><span className="period-pill">{periodLabel(step.period)}</span><h3>{step.title}</h3><p>{step.summary}</p>{getStepDependencies(step).length > 0 && <p className="depends">Depends on: {getStepDependencies(step).map((id) => resolveLabel(id, idMap)).join('; ')}</p>}</article>)}</div><h4>Serves Edge deliverables</h4><div className="link-list">{project.servesDeliverables.map((id) => <SmartLink key={id} id={id} idMap={idMap} />)}</div></article>;
}

export default function App2() {
  const path = useHashRoute();
  const { deliverables, timelineItems, idMap } = useMemo(() => buildLookups(plan.projects, enablingProjects), []);
  const dependencyIndex = useMemo(() => buildDependencyIndex(timelineItems), [timelineItems]);
  const detailMatch = path.match(/^\/deliverables\/(.+)$/);
  const detailDeliverable = detailMatch ? deliverables.find((deliverable) => deliverable.id === detailMatch[1]) : null;
  let page;
  if (detailMatch) page = <DeliverableDetail deliverable={detailDeliverable} idMap={idMap} dependencyIndex={dependencyIndex} />;
  else if (path === '/deliverables') page = <DeliverablesIndex deliverables={deliverables} />;
  else if (path === '/timeline') page = <TimelineView timelineItems={timelineItems} idMap={idMap} dependencyIndex={dependencyIndex} />;
  else if (path === '/enabling-projects' || path === '/dependencies') page = <EnablingProjectsView idMap={idMap} />;
  else page = <Overview />;
  return <><Nav />{page}<footer className="site-footer"><p>King's Edge Mobilisation Plan. Rendered from JSON data.</p></footer></>;
}
