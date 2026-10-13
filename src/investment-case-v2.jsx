import React from 'react';
import baseline from './data/investment-case.json';
import proposal from './data/v2/investment-case.json';
import { projects } from './plan-utils.js';
import crosswalk from './data/v2/crosswalk.json';
import './styles/investment-case.css';

const money = (amount) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(amount);
const projectById = new Map(projects.map((project) => [project.id, project]));
const deliverableById = new Map(projects.flatMap((project) => project.deliverables.map((deliverable) => [deliverable.id, deliverable])));
const poolForProject = (id) => proposal.accountingPools.find((pool) => pool.v2Projects.includes(id));

function DeliverableLinks({ ids }) {
  return <span className="ds-cluster ask-refs" aria-label="Related V2 deliverables">{ids.map((id) => {
    const item = deliverableById.get(id);
    return <a className="ds-tag" href={`#/deliverables/${id}`} key={id}>{item?.displayId || id} {item?.title || ''}</a>;
  })}</span>;
}

export default function InvestmentCaseV2() {
  const core = baseline.options.find((option) => option.id === 'core');
  return <main className="investment-case-page investment-case-v2">
    <section className="hero investment-hero" aria-labelledby="investment-title">
      <p className="eyebrow">King’s Edge · Version 2 proposal</p>
      <h1 id="investment-title">Investment ask</h1>
      <p className="investment-v2-standfirst">{proposal.headline}</p>
      <p>{proposal.standfirst}</p>
      <div className="ds-table-wrap option-summary-wrap">
        <table className="ds-table option-summary-table" aria-label="King's Edge V2 investment options">
          <thead><tr><th>Option</th>{baseline.academicYears.map((year) => <th key={year}>{year}</th>)}<th>Three-year in-year budget</th><th>Indicative ongoing annual cost</th></tr></thead>
          <tbody>{baseline.options.map((option) => <tr key={option.id} className={option.recommended ? 'recommended-option-row' : undefined}>
            <th scope="row">{option.recommended ? <><span className="ds-section-heading recommended-option-name">{option.title}</span><span className="ds-eyebrow">Recommended</span></> : option.title}</th>
            {option.inYear.map((amount, index) => <td key={baseline.academicYears[index]}>{money(amount)}</td>)}
            <td><strong>{money(option.total)}</strong></td><td>{option.operatingExposure}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <p className="ds-subtle investment-v2-boundary">These are the established in-year options, re-presented against the V2 project architecture. Grade-based costs remain subject to Finance/HR validation. The Core option is a working recommendation, not an approved allocation.</p>
    </section>

    <section className="investment-section" aria-labelledby="v2-projects-title">
      <div className="ds-stack investment-section-heading"><p className="eyebrow">What the investment changes</p><h2 id="v2-projects-title" className="ds-section-heading">Six connected projects</h2><p>Each project has its own purpose and delivery proposition. The figures below use five non-overlapping accounting pools because Insight and Reputation still share one unsplit Graduate Futures cost base.</p></div>
      <div className="investment-v2-project-grid">{proposal.projects.map((project) => {
        const planProject = projectById.get(project.id);
        const pool = poolForProject(project.id);
        return <article className="ds-editorial-card investment-v2-project" key={project.id}>
          <div className="investment-v2-project-heading"><span className="reference">{planProject?.displayId}</span><h3><a href={`#/projects/${project.id}`}>{planProject?.title || project.id}</a></h3></div>
          <p className="investment-v2-purpose">{project.investmentPurpose}</p>
          <p>{project.whyThisInvestment}</p>
          <p><strong>By the end of 2026/27:</strong> {project.yearOne}</p>
          <div className="investment-v2-allocation"><span>{pool.unapportioned ? 'Joint Core accounting pool · counted once across projects 2.5 and 2.6' : 'Core three-year allocation'}</span><strong>{money(pool.optionTotals.core)}</strong></div>
          <DeliverableLinks ids={project.deliverables} />
        </article>;
      })}</div>
    </section>

    <section className="investment-section" aria-labelledby="v2-bridge-title">
      <div className="ds-stack investment-section-heading"><p className="eyebrow">Financial bridge</p><h2 id="v2-bridge-title" className="ds-section-heading">Where the Core ask sits</h2><p>Five accounting rows cover all six projects. The jointly attributed row appears once in the totals.</p></div>
      <div className="ds-table-wrap"><table className="ds-table investment-v2-bridge"><thead><tr><th>V2 accounting pool</th><th>2026/27</th><th>2027/28</th><th>2028/29</th><th>Core total</th><th>V1 source</th></tr></thead>
        <tbody>{proposal.accountingPools.map((pool) => <tr key={pool.id}><th scope="row">{pool.title}{pool.unapportioned && <span className="investment-v2-shared">Joint pool · no project split yet</span>}</th>{pool.coreInYear.map((amount, index) => <td key={index}>{money(amount)}</td>)}<td><strong>{money(pool.optionTotals.core)}</strong></td><td>{pool.source}</td></tr>)}
          <tr className="investment-v2-total"><th scope="row">Core programme total</th>{core.inYear.map((amount, index) => <td key={index}><strong>{money(amount)}</strong></td>)}<td><strong>{money(core.total)}</strong></td><td>Same in-year financial baseline as V1</td></tr>
        </tbody></table></div>
      <p className="ds-subtle">Across the same five rows, Economy totals {money(baseline.options[0].total)} and Enhanced totals {money(baseline.options[2].total)}. Neither the accounting pools nor the early release are additional costs on top of the option totals.</p>
    </section>

    <section className="investment-section" aria-labelledby="v2-options-title">
      <div className="ds-stack investment-section-heading"><p className="eyebrow">Investment choices</p><h2 id="v2-options-title" className="ds-section-heading">Three service models</h2><p>The options change pace, capacity and reach across the six projects. The urgent international continuity wave and January 2027 Global Mobility G6 remain protected in each model.</p></div>
      <div className="investment-v2-choice-grid">{proposal.investmentChoices.map((choice) => <article className="ds-editorial-card investment-v2-choice" key={choice.id}><p className="ds-sequence-kicker">{choice.title}{choice.id === 'core' ? ' · recommended' : ''}</p><h3>{money(baseline.options.find((option) => option.id === choice.id).total)}</h3><p>{choice.description}</p><p><strong>Opportunity commissioning:</strong> {choice.commissioning}</p><p><strong>Infrastructure service:</strong> {choice.infrastructure}</p></article>)}</div>
    </section>

    <section className="investment-section ds-callout" aria-labelledby="v2-early-title">
      <div className="ds-stack investment-section-heading"><p className="eyebrow">Early investment</p><h2 id="v2-early-title" className="ds-section-heading">{money(baseline.earlyAsk.amount)} immediate pre-Business Case need</h2><p>The established £100k acceleration bridge plus £84,153 of urgent international continuity. This is an early release against the 2026/27 substantive case, not an extra programme cost.</p></div>
      <div className="investment-v2-early-grid">{baseline.earlyAsk.items.map((item) => {
        const ids = [...new Set(item.v1Deliverables.flatMap((id) => crosswalk.deliverables[id]?.v2DeliverableIds || [id]))];
        return <article key={item.title}><strong>{money(item.amount)}</strong><h3>{item.title}</h3><DeliverableLinks ids={ids} /></article>;
      })}</div>
      <p className="ds-subtle">The £60k opportunity seed forms part of the £150k Core Year 1 commissioning portfolio. The January 2027 Global Mobility G6 sits in all three substantive options.</p>
    </section>

    <section className="investment-section investment-v2-notes" aria-labelledby="v2-boundaries-title"><p className="eyebrow">Accounting boundaries</p><h2 id="v2-boundaries-title" className="ds-section-heading">Decisions still to settle</h2><ul>{proposal.accountingNotes.map((note) => <li key={note}>{note}</li>)}</ul><p className="ds-subtle">Full assumptions and role phasing: <a href="https://github.com/markpeace/KingsEdgeMobilisationPlan/blob/main/docs/portfolio-investment-packages.md" target="_blank" rel="noreferrer">portfolio investment handover</a>.</p></section>
  </main>;
}
