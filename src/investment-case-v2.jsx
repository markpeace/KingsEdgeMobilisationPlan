import React from 'react';
import baseline from './data/investment-case.json';
import proposal from './data/v2/investment-case.json';
import { projects } from './plan-utils.js';
import crosswalk from './data/v2/crosswalk.json';
import { earlyAsk, InvestmentProfile, serviceOptions, UserStories } from './investment-case-entry.jsx';
import './styles/investment-case.css';

const money = (amount) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(amount);
const shortMoney = (amount) => amount >= 1000000 ? `£${(amount / 1000000).toFixed(3)}m` : `£${Math.round(amount / 1000)}k`;
const projectById = new Map(projects.map((project) => [project.id, project]));
const deliverableById = new Map(projects.flatMap((project) => project.deliverables.map((deliverable) => [deliverable.id, deliverable])));
const poolForProject = (id) => proposal.accountingPools.find((pool) => pool.v2Projects.includes(id));

function DeliverableLinks({ ids }) {
  return <span className="ds-cluster ask-refs" aria-label="Related V2 deliverables">{ids.map((id) => {
    const item = deliverableById.get(id);
    return <a className="ds-tag" href={`#/deliverables/${id}`} title={item?.title} key={id}>{item?.displayId || id}</a>;
  })}</span>;
}

export default function InvestmentCaseV2() {
  const core = baseline.options.find((option) => option.id === 'core');
  return <main className="investment-case-page investment-case-v2">
    <section id="case" className="hero investment-hero" aria-labelledby="investment-title">
      <p className="eyebrow">King’s Edge · Version 2 proposal</p>
      <h1 id="investment-title">Investment ask</h1>
      <div className="ds-table-wrap option-summary-wrap">
        <table className="ds-table option-summary-table" aria-label="King's Edge V2 investment options">
          <thead><tr><th>Option</th>{baseline.academicYears.map((year) => <th key={year}>{year}</th>)}<th>Three-year in-year budget</th><th>Indicative ongoing annual cost</th></tr></thead>
          <tbody>{baseline.options.map((option) => <tr key={option.id} className={option.recommended ? 'recommended-option-row' : undefined}>
            <th scope="row">{option.recommended ? <><span className="ds-section-heading recommended-option-name">{option.title}</span><span className="ds-eyebrow">Recommended</span></> : option.title}</th>
            {option.inYear.map((amount, index) => <td key={baseline.academicYears[index]}>{option.recommended ? <strong>{shortMoney(amount)}</strong> : shortMoney(amount)}</td>)}
            <td><strong>{shortMoney(option.total)}</strong></td><td>{option.recommended ? <strong>{option.operatingExposure}</strong> : option.operatingExposure}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="ds-stack investment-ask-context">
        <p><strong>Core is the recommended planning case.</strong> {proposal.standfirst}</p>
        <p className="ds-subtle investment-boundary">All three options retain the 2026/27 to 2028/29 in-year planning window. Grade-based role costs remain subject to Finance/HR validation. The Digital Student Experience Hub has a separate institutional investment case.</p>
      </div>
    </section>

    <section id="core" className="investment-section">
      <div className="ds-stack investment-section-heading">
        <p className="eyebrow">Investment case</p>
        <h2 className="ds-section-heading">{proposal.headline}</h2>
        <p><strong>Six connected changes make the graduate premium real in the student experience.</strong> The investment joins purpose and recognition, experiential education, opportunity and transitions, student life, insight, and credible external articulation.</p>
        <p className="ds-subtle">Five accounting pools cover the six projects. Graduate Futures Insight and Graduate Premium Reputation share an unapportioned pool; the profile is displayed against each proposition for context and counted only once in the financial bridge below.</p>
      </div>
      <div className="ds-table-wrap">
        <table className="ds-table investment-table" aria-label="Six V2 project investment propositions">
          <thead><tr><th>Investment area and North Star</th><th>What changes for people</th><th>Investment profile</th></tr></thead>
          <tbody>{proposal.projects.map((project) => {
            const planProject = projectById.get(project.id);
            const pool = poolForProject(project.id);
            const shared = Boolean(pool.unapportioned);
            const profile = {
              profileLabel: shared ? 'Joint 2.5 / 2.6 Core pool · counted once' : undefined,
              threeYearCost: shortMoney(pool.optionTotals.core),
              profileNote: `Core in-year profile: ${pool.coreInYear.map(money).join(' / ')} = ${money(pool.optionTotals.core)}. ${shared ? 'This single pool serves both projects; no project-level split has been agreed.' : ''}`,
              yearOneCost: shortMoney(pool.coreInYear[0]),
              yearOne: [{ label: 'Established', text: project.yearOne }],
              ongoing: pool.ongoing
            };
            return <tr key={project.id}>
              <td className="investment-package-cell"><h3><a href={`#/projects/${project.id}`}>{planProject?.displayId} {planProject?.title || project.id}</a></h3><DeliverableLinks ids={project.deliverables} /><div className="investment-north-star"><span className="ds-sequence-kicker">North Star</span><p>{project.investmentPurpose}</p></div><div className="investment-proposition"><span className="ds-sequence-kicker">What this changes</span><p>{project.whyThisInvestment}</p></div></td>
              <td><UserStories stories={project.stories} /></td><td className="investment-profile-cell"><InvestmentProfile item={profile} /></td>
            </tr>;
          })}</tbody>
        </table>
      </div>
      <div className="ds-stack investment-section-heading investment-v2-bridge-heading"><p className="eyebrow">Financial bridge</p><h2 className="ds-section-heading">Core allocation, counted once</h2><p>The five rows below reattribute the V1 package budgets without changing the annual or three-year total.</p></div>
      <div className="ds-table-wrap"><table className="ds-table investment-v2-bridge" aria-label="V2 Core investment bridge"><thead><tr><th>V2 accounting pool</th><th>2026/27</th><th>2027/28</th><th>2028/29</th><th>Core total</th><th>V1 source</th></tr></thead>
        <tbody>{proposal.accountingPools.map((pool) => <tr key={pool.id}><th scope="row">{pool.title}{pool.unapportioned && <span className="investment-v2-shared">Joint pool · no project split yet</span>}</th>{pool.coreInYear.map((amount, index) => <td key={index}>{money(amount)}</td>)}<td><strong>{money(pool.optionTotals.core)}</strong></td><td>{pool.source}</td></tr>)}
          <tr className="recommended-option-row"><th scope="row">Core programme total</th>{core.inYear.map((amount, index) => <td key={index}><strong>{money(amount)}</strong></td>)}<td><strong>{money(core.total)}</strong></td><td>Same in-year baseline as V1</td></tr>
        </tbody></table></div>
      <p className="ds-subtle">The same pool mapping reconciles Economy at {money(baseline.options[0].total)} and Enhanced at {money(baseline.options[2].total)}. The early release is included in 2026/27 rather than added to these totals.</p>
      <div className="ds-stack investment-ask-context"><strong>Accounting boundaries</strong><ul className="investment-v2-notes">{proposal.accountingNotes.map((note) => <li key={note}>{note}</li>)}</ul></div>
    </section>

    <section id="options" className="investment-section option-section">
      <div className="ds-stack investment-section-heading"><p className="eyebrow">Alternative options</p><h2 className="ds-section-heading">Three genuinely different service models</h2><p className="ds-subtle">These retain the V1 workforce and commissioning assumptions while showing what their pace and reach mean across the V2 projects. The urgent international continuity investment and January 2027 Global Mobility G6 remain protected in all three models.</p></div>
      <div className="ds-table-wrap"><table className="ds-table option-summary-table" aria-label="Employability and experiential infrastructure service models"><thead><tr><th>Infrastructure service model</th><th>In-year profile</th><th>Three-year total</th><th>Exit run-rate</th><th>What the model buys</th></tr></thead><tbody>{serviceOptions.map((option) => <tr key={option.name}><th scope="row">{option.name}</th><td>{option.profile}</td><td><strong>{option.total}</strong></td><td>{option.exit}</td><td>{option.model}</td></tr>)}</tbody></table></div>
      <div className="ds-editorial-grid option-narratives">{proposal.investmentChoices.filter((choice) => choice.id !== 'core').map((choice) => {
        const option = baseline.options.find((item) => item.id === choice.id);
        const difference = Math.abs(core.total - option.total);
        return <article className="ds-editorial-card option-card" key={choice.id}>
          <div><p className="ds-sequence-kicker">{choice.title}</p><h3>{choice.id === 'economy' ? 'Minimum viable architecture, constrained coverage.' : 'Accelerated coverage and higher throughput.'}</h3></div>
          <div className="ds-metric-grid option-metrics" aria-label={`${choice.title} option figures`}><div className="ds-metric-card"><span>2026/27</span><strong>{shortMoney(option.inYear[0])}</strong></div><div className="ds-metric-card"><span>Three-year in-year budget</span><strong>{shortMoney(option.total)}</strong></div><div className="ds-metric-card"><span>Difference from Core</span><strong>{shortMoney(difference)} {choice.id === 'economy' ? 'less' : 'more'}</strong></div></div>
          <div className="option-card-copy"><p>{choice.description}</p><ul className="option-detail-list"><li><strong>Employability infrastructure:</strong> {choice.infrastructure}.</li><li><strong>Beyond Course commissioning:</strong> {choice.commissioning}.</li><li><strong>V2 delivery:</strong> {choice.id === 'economy' ? 'A narrower implementation footprint and lower opportunity throughput.' : 'Earlier specialist capacity and a larger opportunity and implementation portfolio.'}</li></ul></div>
        </article>;
      })}</div>
    </section>

    <section id="early" className="investment-section ds-callout early-section">
      <div className="ds-stack investment-section-heading"><p className="eyebrow">Early investment</p><h2 className="ds-section-heading">Pre-Business Case Investment Need</h2><p className="ds-subtle"><strong>£184.153k remains the immediate pre-Business Case investment need.</strong> It combines the £100k acceleration bridge with £84.153k of urgent 2026/27 international continuity. The January 2027 Global Mobility G6 sits in all three substantive options.</p></div>
      <div className="ds-table-wrap"><table className="ds-table early-table" aria-label="V2 early investment ask"><thead><tr><th>Amount</th><th>What we are buying</th><th>What King’s will have from the immediate investment</th><th>Project refs</th></tr></thead><tbody>{earlyAsk.flatMap((item) => item.outputs.map((output, outputIndex) => {
        const ids = [...new Set(output.refs.flatMap((id) => crosswalk.deliverables[id]?.v2DeliverableIds || [id]))];
        return <tr key={`${item.amount}-${outputIndex}`} className={outputIndex === 0 ? 'early-group-start' : undefined}>{outputIndex === 0 && <td className="early-amount" rowSpan={item.outputs.length}><strong>{item.amount}</strong></td>}{outputIndex === 0 && <td rowSpan={item.outputs.length}><strong>{item.buying}</strong></td>}<td>{output.text}</td><td className="early-refs"><DeliverableLinks ids={ids} /></td></tr>;
      }))}</tbody></table></div>
      <p className="ds-subtle early-note">The early release is a timing proposal against 2026/27 planning assumptions, not an additional programme cost. The £60k opportunity seed is included within the Core £150k Year 1 commissioning portfolio.</p>
    </section>

    <section className="ds-cluster investment-source-panel"><div className="ds-stack investment-source-copy"><p className="eyebrow">Detailed handover</p><h2 className="ds-section-heading">Assumptions and workings</h2><p className="ds-subtle">The full handover contains the option calculations, workforce assumptions, accounting boundaries and package-level cost assumptions behind this page.</p></div><a className="ds-button" href="https://github.com/markpeace/KingsEdgeMobilisationPlan/blob/main/docs/portfolio-investment-packages.md" target="_blank" rel="noreferrer">Open detailed handover</a></section>
  </main>;
}
