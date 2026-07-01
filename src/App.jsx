import { useEffect, useMemo, useState } from 'react';
import plan from './data/kings-edge-plan.json';

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

function buildLookups(projects, dependencies) {
  const deliverables = [];
  const idMap = new Map();

  projects.forEach((project) => {
    project.deliverables.forEach((deliverable) => {
      const enriched = { ...deliverable, project };
      deliverables.push(enriched);
      idMap.set(deliverable.id, { type: 'deliverable', item: enriched });
      deliverable.steps.forEach((step) => {
        idMap.set(step.id, { type: 'step', item: step, deliverable: enriched });
      });
    });
  });

  dependencies.forEach((dependency) => {
    idMap.set(dependency.id, { type: 'crossDependency', item: dependency });
  });

  return { deliverables, idMap };
}

function buildDependencyIndex(deliverables) {
  const reverse = new Map();

  const addReverse = (targetId, source) => {
    if (!reverse.has(targetId)) reverse.set(targetId, []);
    reverse.get(targetId).push(source);
  };

  deliverables.forEach((deliverable) => {
    deliverable.dependencies?.forEach((dependency) => {
      addReverse(dependency.targetId, {
        sourceType: 'deliverable',
        deliverable,
        dependencyType: dependency.type,
        label: dependency.label
      });
    });

    deliverable.steps?.forEach((step) => {
      step.dependsOn?.forEach((targetId) => {
        addReverse(targetId, {
          sourceType: 'step',
          deliverable,
          step,
          dependencyType: 'step dependency',
          label: step.summary
        });
      });
    });
  });

  return reverse;
}

function resolveLabel(id, idMap) {
  const result = idMap.get(id);
  if (!result) return id;
  if (result.type === 'deliverable') return `${result.item.id} ${result.item.title}`;
  if (result.type === 'step') return `${result.deliverable.id}: ${result.item.title}`;
  if (result.type === 'crossDependency') return result.item.title;
  return id;
}

function Nav() {
  return (
    <header className="site-header">
      <a href="#/" className="brand">King's Edge Mobilisation Plan</a>
      <nav>
        <a href="#/">Overview</a>
        <a href="#/deliverables">Deliverables</a>
        <a href="#/timeline">Timeline</a>
        <a href="#/dependencies">Dependencies</a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero">
      <p className="eyebrow">Interactive delivery map</p>
      <h1>{plan.programme.title}</h1>
      <p>{plan.programme.purpose}</p>
    </section>
  );
}

function Overview({ projects }) {
  return (
    <main>
      <Hero />
      <section className="section-heading">
        <h2>Projects and deliverables</h2>
        <p>Browse the four King's Edge projects and click any deliverable to drill into its detailed plan.</p>
      </section>
      <div className="project-grid">
        {projects.map((project) => (
          <ProjectColumn key={project.id} project={project} />
        ))}
      </div>
      <section className="sidebars-preview">
        <h2>Core cross-programme dependencies</h2>
        <div className="dependency-grid">
          {plan.crossProgrammeDependencies.map((dependency) => (
            <DependencyCard key={dependency.id} dependency={dependency} compact />
          ))}
        </div>
      </section>
    </main>
  );
}

function ProjectColumn({ project }) {
  return (
    <section className="project-column">
      <div className="project-column-header">
        <span className="reference">{project.id}</span>
        <h2>{project.title}</h2>
        <p>{project.summary}</p>
        <p className="owner">Owner: {project.owner}</p>
      </div>
      <div className="deliverable-stack">
        {project.deliverables.map((deliverable) => (
          <DeliverableCard key={deliverable.id} deliverable={deliverable} />
        ))}
      </div>
    </section>
  );
}

function DeliverableCard({ deliverable }) {
  return (
    <a className="deliverable-card" href={`#/deliverables/${deliverable.id}`}>
      <span className="reference">{deliverable.id}</span>
      <h3>{deliverable.title}</h3>
      <p>{deliverable.summary}</p>
      <p className="lead">Lead: {deliverable.lead}</p>
    </a>
  );
}

function DeliverablesIndex({ deliverables }) {
  const [query, setQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deliverables.filter((deliverable) => {
      const matchesProject = projectFilter === 'all' || deliverable.project.id === projectFilter;
      const searchable = [deliverable.id, deliverable.title, deliverable.lead, deliverable.summary, deliverable.project.title, ...(deliverable.tags || [])]
        .join(' ')
        .toLowerCase();
      return matchesProject && (!q || searchable.includes(q));
    });
  }, [deliverables, query, projectFilter]);

  return (
    <main>
      <section className="section-heading">
        <p className="eyebrow">Deliverables index</p>
        <h1>Browse by deliverable</h1>
        <p>Search or filter across all sixteen deliverables.</p>
      </section>
      <div className="toolbar">
        <input
          type="search"
          placeholder="Search deliverables, owners or themes"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}>
          <option value="all">All projects</option>
          {plan.projects.map((project) => (
            <option key={project.id} value={project.id}>{project.id} {project.title}</option>
          ))}
        </select>
      </div>
      <div className="index-list">
        {filtered.map((deliverable) => (
          <a href={`#/deliverables/${deliverable.id}`} className="index-row" key={deliverable.id}>
            <div>
              <span className="reference">{deliverable.id}</span>
              <h3>{deliverable.title}</h3>
              <p>{deliverable.summary}</p>
            </div>
            <div className="index-meta">
              <span>{deliverable.project.title}</span>
              <strong>{deliverable.lead}</strong>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}

function DeliverableDetail({ deliverable, idMap }) {
  if (!deliverable) {
    return (
      <main>
        <section className="section-heading">
          <h1>Deliverable not found</h1>
          <p><a href="#/deliverables">Return to deliverables index</a></p>
        </section>
      </main>
    );
  }

  return (
    <main>
      <a className="back-link" href="#/deliverables">Back to deliverables</a>
      <section className="detail-hero">
        <p className="eyebrow">{deliverable.project.id} {deliverable.project.title}</p>
        <h1>{deliverable.id} {deliverable.title}</h1>
        <p>{deliverable.summary}</p>
        <div className="detail-meta">
          <span>Project owner: {deliverable.project.owner}</span>
          <span>Deliverable lead: {deliverable.lead}</span>
        </div>
      </section>

      <div className="detail-grid">
        <section className="panel">
          <h2>Problem solved</h2>
          <p>{deliverable.problemSolved}</p>
        </section>
        <section className="panel">
          <h2>What changes</h2>
          <p>{deliverable.whatChanges}</p>
        </section>
      </div>

      <section className="panel">
        <h2>Components</h2>
        <div className="component-grid">
          {deliverable.components.map((component) => (
            <article className="component-card" key={component.title}>
              <h3>{component.title}</h3>
              <p>{component.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Delivery steps</h2>
        <div className="steps-list">
          {deliverable.steps.map((step) => (
            <article key={step.id} className="step-card">
              <span className="period-pill">{periodLabel(step.period)}</span>
              <h3>{step.title}</h3>
              <p>{step.summary}</p>
              {step.dependsOn?.length > 0 && (
                <p className="depends">Depends on: {step.dependsOn.map((id) => resolveLabel(id, idMap)).join('; ')}</p>
              )}
            </article>
          ))}
        </div>
      </section>

      <div className="detail-grid">
        <section className="panel">
          <h2>Depends on</h2>
          {deliverable.dependencies?.length ? (
            <ul className="dependency-list">
              {deliverable.dependencies.map((dependency) => (
                <li key={`${dependency.targetId}-${dependency.type}`}>
                  <span className="dependency-type">{dependency.type}</span>
                  <strong>{resolveLabel(dependency.targetId, idMap)}</strong>
                  <p>{dependency.label}</p>
                </li>
              ))}
            </ul>
          ) : <p>No explicit dependencies captured yet.</p>}
        </section>
        <section className="panel">
          <h2>Feeds into</h2>
          {deliverable.feedsInto?.length ? (
            <div className="link-list">
              {deliverable.feedsInto.map((id) => <SmartLink key={id} id={id} idMap={idMap} />)}
            </div>
          ) : <p>No onward dependencies captured yet.</p>}
        </section>
      </div>
    </main>
  );
}

function SmartLink({ id, idMap }) {
  const result = idMap.get(id);
  if (!result) return <span className="chip">{id}</span>;
  if (result.type === 'deliverable') return <a className="chip" href={`#/deliverables/${id}`}>{result.item.id} {result.item.title}</a>;
  if (result.type === 'crossDependency') return <a className="chip" href="#/dependencies">{result.item.title}</a>;
  return <span className="chip">{resolveLabel(id, idMap)}</span>;
}

function periodLabel(periodId) {
  return plan.timelinePeriods.find((period) => period.id === periodId)?.shortLabel || periodId;
}

function TimelineView({ deliverables, idMap, dependencyIndex }) {
  const periods = [...plan.timelinePeriods].sort((a, b) => a.order - b.order);
  const [projectFilter, setProjectFilter] = useState('all');
  const [dependencyFilter, setDependencyFilter] = useState('all');
  const [selectedStepId, setSelectedStepId] = useState(null);

  const filteredDeliverables = useMemo(() => {
    return deliverables.filter((deliverable) => {
      const matchesProject = projectFilter === 'all' || deliverable.project.id === projectFilter;
      const matchesDependency = dependencyFilter === 'all' || deliverable.dependencies?.some((dependency) => dependency.targetId === dependencyFilter) || deliverable.steps?.some((step) => step.dependsOn?.includes(dependencyFilter));
      return matchesProject && matchesDependency;
    });
  }, [deliverables, projectFilter, dependencyFilter]);

  const selectedEntry = selectedStepId ? idMap.get(selectedStepId) : null;
  const selectedStep = selectedEntry?.type === 'step' ? selectedEntry.item : null;
  const selectedDeliverable = selectedEntry?.type === 'step' ? selectedEntry.deliverable : null;
  const selectedDependencies = selectedStep?.dependsOn || [];
  const selectedDependents = selectedStepId ? dependencyIndex.get(selectedStepId) || [] : [];
  const selectedDeliverableDependents = selectedDeliverable ? dependencyIndex.get(selectedDeliverable.id) || [] : [];
  const highlightedDependents = new Set([
    ...selectedDependents.map((entry) => entry.step?.id || entry.deliverable?.id).filter(Boolean),
    ...selectedDeliverableDependents.map((entry) => entry.step?.id || entry.deliverable?.id).filter(Boolean)
  ]);

  const getBlockClass = (deliverable, step) => {
    const classes = ['timeline-block'];
    if (selectedStepId === step.id) classes.push('selected');
    if (selectedDependencies.includes(step.id) || selectedDependencies.includes(deliverable.id)) classes.push('dependency-highlight');
    if (highlightedDependents.has(step.id) || highlightedDependents.has(deliverable.id)) classes.push('dependent-highlight');
    if (selectedStepId && selectedStepId !== step.id && !classes.includes('dependency-highlight') && !classes.includes('dependent-highlight')) classes.push('dimmed');
    return classes.join(' ');
  };

  return (
    <main>
      <section className="section-heading">
        <p className="eyebrow">Timeline</p>
        <h1>Gantt-style delivery view</h1>
        <p>Click a step to show what it depends on and what it enables. Use the filters to focus the timeline by project or major cross-programme dependency.</p>
      </section>

      <div className="toolbar timeline-toolbar">
        <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}>
          <option value="all">All projects</option>
          {plan.projects.map((project) => (
            <option key={project.id} value={project.id}>{project.id} {project.title}</option>
          ))}
        </select>
        <select value={dependencyFilter} onChange={(event) => setDependencyFilter(event.target.value)}>
          <option value="all">All dependencies</option>
          {plan.crossProgrammeDependencies.map((dependency) => (
            <option key={dependency.id} value={dependency.id}>{dependency.title}</option>
          ))}
        </select>
        {selectedStepId && <button type="button" className="secondary-button" onClick={() => setSelectedStepId(null)}>Clear selection</button>}
      </div>

      <DependencyLens
        selectedStep={selectedStep}
        selectedDeliverable={selectedDeliverable}
        selectedDependencies={selectedDependencies}
        selectedDependents={selectedDependents}
        selectedDeliverableDependents={selectedDeliverableDependents}
        idMap={idMap}
      />

      <div className="timeline-key">
        <span><i className="key-box selected-key" /> Selected step</span>
        <span><i className="key-box dependency-key" /> Depends on</span>
        <span><i className="key-box dependent-key" /> Feeds into</span>
      </div>

      <div className="timeline">
        <div className="timeline-header">
          <div>Deliverable</div>
          {periods.map((period) => <div key={period.id}>{period.shortLabel}</div>)}
        </div>
        {filteredDeliverables.map((deliverable) => (
          <div className="timeline-row" key={deliverable.id}>
            <a className="timeline-title" href={`#/deliverables/${deliverable.id}`}>
              <span className="reference">{deliverable.id}</span>
              <strong>{deliverable.title}</strong>
              <span>{deliverable.lead}</span>
            </a>
            {periods.map((period) => {
              const steps = deliverable.steps.filter((step) => step.period === period.id);
              return (
                <div className="timeline-cell" key={`${deliverable.id}-${period.id}`}>
                  {steps.map((step) => (
                    <button
                      type="button"
                      className={getBlockClass(deliverable, step)}
                      key={step.id}
                      title={dependencyTitle(step, idMap)}
                      onClick={() => setSelectedStepId(step.id)}
                    >
                      <span>{step.title}</span>
                      {step.dependsOn?.length > 0 && <span className="dependency-dot">↳</span>}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </main>
  );
}

function DependencyLens({ selectedStep, selectedDeliverable, selectedDependencies, selectedDependents, selectedDeliverableDependents, idMap }) {
  if (!selectedStep || !selectedDeliverable) {
    return (
      <section className="dependency-lens empty">
        <div>
          <h2>Dependency lens</h2>
          <p>Select a timeline step to see its dependency chain. The timeline will highlight prerequisites and onward dependencies.</p>
        </div>
      </section>
    );
  }

  const onward = [...selectedDependents, ...selectedDeliverableDependents];

  return (
    <section className="dependency-lens">
      <div>
        <p className="eyebrow">Selected step</p>
        <h2>{selectedDeliverable.id}: {selectedStep.title}</h2>
        <p>{selectedStep.summary}</p>
        <span className="period-pill">{periodLabel(selectedStep.period)}</span>
      </div>
      <div>
        <h3>Depends on</h3>
        {selectedDependencies.length ? (
          <div className="link-list">
            {selectedDependencies.map((id) => <SmartLink key={id} id={id} idMap={idMap} />)}
          </div>
        ) : <p>No step-level dependencies captured.</p>}
      </div>
      <div>
        <h3>Feeds into</h3>
        {onward.length ? (
          <ul className="compact-list">
            {onward.map((entry, index) => (
              <li key={`${entry.sourceType}-${entry.step?.id || entry.deliverable?.id}-${index}`}>
                {entry.step ? (
                  <a href={`#/deliverables/${entry.deliverable.id}`}><strong>{entry.deliverable.id}</strong>: {entry.step.title}</a>
                ) : (
                  <a href={`#/deliverables/${entry.deliverable.id}`}><strong>{entry.deliverable.id}</strong>: {entry.deliverable.title}</a>
                )}
              </li>
            ))}
          </ul>
        ) : <p>No onward dependencies captured yet.</p>}
      </div>
    </section>
  );
}

function dependencyTitle(step, idMap) {
  if (!step.dependsOn?.length) return step.summary;
  return `${step.summary}\nDepends on: ${step.dependsOn.map((id) => resolveLabel(id, idMap)).join('; ')}`;
}

function DependenciesView({ idMap }) {
  return (
    <main>
      <section className="section-heading">
        <p className="eyebrow">Cross-programme dependencies</p>
        <h1>Work Edge needs from elsewhere</h1>
        <p>These are the three major workstreams outside King's Edge that fulfil core Edge needs.</p>
      </section>
      <div className="dependency-grid large">
        {plan.crossProgrammeDependencies.map((dependency) => (
          <DependencyCard key={dependency.id} dependency={dependency} idMap={idMap} />
        ))}
      </div>
    </main>
  );
}

function DependencyCard({ dependency, idMap, compact = false }) {
  return (
    <article className="dependency-card">
      <h3>{dependency.title}</h3>
      <p>{dependency.summary}</p>
      {!compact && (
        <>
          <h4>Core Edge needs serviced</h4>
          <ul>
            {dependency.edgeNeedsServiced.map((need) => <li key={need}>{need}</li>)}
          </ul>
          <h4>What changes</h4>
          <p>{dependency.whatChanges}</p>
          <h4>Related deliverables</h4>
          <div className="link-list">
            {dependency.relatedDeliverables.map((id) => <SmartLink key={id} id={id} idMap={idMap} />)}
          </div>
        </>
      )}
    </article>
  );
}

export default function App() {
  const path = useHashRoute();
  const { deliverables, idMap } = useMemo(
    () => buildLookups(plan.projects, plan.crossProgrammeDependencies),
    []
  );
  const dependencyIndex = useMemo(() => buildDependencyIndex(deliverables), [deliverables]);

  const detailMatch = path.match(/^\/deliverables\/(.+)$/);
  const detailId = detailMatch?.[1];
  const detailDeliverable = detailId ? deliverables.find((deliverable) => deliverable.id === detailId) : null;

  let page;
  if (detailMatch) {
    page = <DeliverableDetail deliverable={detailDeliverable} idMap={idMap} />;
  } else if (path === '/deliverables') {
    page = <DeliverablesIndex deliverables={deliverables} />;
  } else if (path === '/timeline') {
    page = <TimelineView deliverables={deliverables} idMap={idMap} dependencyIndex={dependencyIndex} />;
  } else if (path === '/dependencies') {
    page = <DependenciesView idMap={idMap} />;
  } else {
    page = <Overview projects={plan.projects} />;
  }

  return (
    <>
      <Nav />
      {page}
      <footer className="site-footer">
        <p>King's Edge Mobilisation Plan. Rendered from JSON data.</p>
      </footer>
    </>
  );
}
