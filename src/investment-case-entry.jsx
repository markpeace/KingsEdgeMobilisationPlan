import React from 'react';
import { createRoot } from 'react-dom/client';
import './design-system.css';
import './styles/global-chrome.css';
import './styles/investment-case.css';

const deliverableHref = (id) => `./index.html#/deliverables/${id}`;

function RefLinks({ ids }) {
  return <span className="ask-refs" aria-label="Related deliverables">{ids.map((id) => <a key={id} href={deliverableHref(id)}>{id}</a>)}</span>;
}

const corePackages = [
  {
    title: 'Student Purpose, Skills and Educational Recognition',
    refs: ['2.2.1', '2.1.3', '2.4.3'],
    change: 'Students can make more intentional choices, understand the capabilities they are building across their course and wider experience, and leave with a richer, trusted account of what they can do.',
    yearOne: 'Test the purpose, skills and recognition propositions; make a clear decision on the shared skills architecture; and leave a bounded set of trailblazers ready to scale.',
    yearOneCost: '£53k',
    threeYearCost: '£252k',
    ongoing: 'c.£9k p.a. + costs to confirm'
  },
  {
    title: 'Experiential Learning in the Curriculum',
    refs: ['2.1.2', '2.1.4', '2.2.3'],
    change: 'Meaningful learning through experience becomes a deliberate part of a King’s education, with practical routes to strengthen provision where access is currently uneven.',
    yearOne: 'Set the King’s model for experiential learning, map strengths and gaps, establish the sandwich-year route, validate a shared 15-credit capstone and identify the first implementation priorities.',
    yearOneCost: '£58.8k',
    threeYearCost: '£341k',
    ongoing: 'c.£9k p.a. + costs to confirm'
  },
  {
    title: 'Beyond-Course Opportunity and Participation',
    refs: ['2.2.2', '2.2.4', '2.3.1', '2.3.2', '2.3.4'],
    change: 'Students can see and access a richer, more inclusive range of opportunities beyond their course. King’s can see who participates, where barriers remain and where new provision should be created.',
    yearOne: 'Create a live evidence base and common shopfront; commission a £150k opportunity portfolio for at least 2,500 students; build Student Life personas and participation principles; and define the partnership model needed to scale.',
    yearOneCost: '£278.5k',
    threeYearCost: '£1.8324m',
    ongoing: 'c.£647k p.a. + costs to confirm'
  },
  {
    title: 'Graduate Futures Intelligence and Value',
    refs: ['2.1.1', '2.4.1', '2.4.2', '2.4.4'],
    change: 'Course teams get better evidence about graduate futures, students can articulate more of the value of their King’s education, and the University can act deliberately on outcomes and reputation.',
    yearOne: 'Establish the first Graduate Futures Intelligence Pack, produce evidence-backed graduate premium exemplars, test external challenge and validation, and run targeted Graduate Outcomes response optimisation.',
    yearOneCost: '£169.9k',
    threeYearCost: '£764.8k',
    ongoing: 'c.£169.5k p.a. + costs to confirm'
  }
];

const earlyAsk = [
  {
    amount: '£60k',
    buying: 'Externally commissioned student opportunities',
    outputs: <>
      <p>Start final-year career-enhancing projects, mentoring, placements and other deeper experiences, while beginning entrepreneurship, belonging and community-engaged opportunities. <RefLinks ids={['2.2.4']} /></p>
    </>
  },
  {
    amount: '£15k',
    buying: 'Freelance video production',
    outputs: <>
      <p>Produce the first Graduate Premium video exemplars and promotional video and related assets to support Graduate Outcomes survey response. <RefLinks ids={['2.4.1', '2.4.4']} /></p>
    </>
  },
  {
    amount: '£25k',
    buying: 'Paid student time through King’s Talent',
    outputs: <>
      <ul>
        <li>Power BI and Microsoft Fabric engineering for the Graduate Futures Intelligence Pack, Graduate Outcomes optimisation and Beyond Course dashboard. <RefLinks ids={['2.1.1', '2.4.4', '2.3.1']} /></li>
        <li>Prototype LLM-led course skills interrogation tooling. <RefLinks ids={['2.1.3']} /></li>
        <li>Student Life persona co-design and Student Experience Hub ideation and prototype input. <RefLinks ids={['2.3.2', '4.1.2']} /></li>
      </ul>
    </>
  }
];

function Header() {
  return <header className="site-header investment-header">
    <a href="./index.html#/" className="brand">King's Edge Mobilisation Plan</a>
    <nav aria-label="Investment case navigation">
      <a href="#core">Recommended case</a>
      <a href="#options">Options</a>
      <a href="#early">Start now</a>
    </nav>
  </header>;
}

function InvestmentCase() {
  return <>
    <Header />
    <main className="investment-case-page">
      <section className="hero investment-hero" aria-labelledby="investment-title">
        <p className="eyebrow">King’s Edge investment case</p>
        <h1 id="investment-title">What we pay. What changes.</h1>
        <p className="investment-hero-copy">The recommended case invests in four connected parts of a King’s education: helping students shape and evidence their development, expanding experiential learning, growing meaningful opportunity beyond the course, and using graduate futures evidence to keep improving the offer.</p>
        <div className="investment-metrics" aria-label="Recommended investment headline figures">
          <article><strong>£560.2k</strong><span>Year 1</span></article>
          <article><strong>£3.1902m</strong><span>Three-year investment</span></article>
          <article><strong>c.£834.5k</strong><span>Likely annual cost once established, plus costs still to confirm</span></article>
        </div>
        <p className="investment-boundary">This page covers the King’s Edge educational investment. The Digital Student Experience Hub is a separate institutional investment.</p>
      </section>

      <section id="core" className="investment-section">
        <div className="investment-section-heading">
          <p className="eyebrow">Recommended case</p>
          <h2>The four things we are buying</h2>
          <p>Core is the recommended minimum for a visible institution-wide shift. The table keeps the decision simple: what changes, what Year 1 buys, and what it costs.</p>
        </div>

        <div className="ds-table-wrap investment-table-wrap">
          <table className="ds-table investment-table">
            <thead>
              <tr>
                <th>Investment area</th>
                <th>What changes</th>
                <th>What Year 1 buys</th>
                <th>Three-year cost</th>
                <th>Likely ongoing annual cost</th>
              </tr>
            </thead>
            <tbody>
              {corePackages.map((item) => <tr key={item.title}>
                <td className="investment-package-cell"><h3>{item.title}</h3><RefLinks ids={item.refs} /></td>
                <td>{item.change}</td>
                <td><strong className="year-one-price">{item.yearOneCost}</strong><p>{item.yearOne}</p></td>
                <td className="investment-price-cell"><strong>{item.threeYearCost}</strong></td>
                <td className="investment-ongoing-cell"><strong>{item.ongoing}</strong></td>
              </tr>)}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan="2">Recommended King’s Edge case</th>
                <th><strong>£560.2k in Year 1</strong></th>
                <th><strong>£3.1902m</strong></th>
                <th><strong>c.£834.5k p.a. + TBC</strong></th>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section id="options" className="investment-section option-section">
        <div className="investment-section-heading">
          <p className="eyebrow">Spend less or spend more</p>
          <h2>What changes around the recommended case</h2>
          <p>The choice is not simply how many activities to fund. It changes how quickly King’s can move, how much delivery depends on existing local capacity, and how many students reach deeper experiences.</p>
        </div>

        <div className="option-price-band" aria-label="Three year investment options">
          <article><span>Economy</span><strong>£2.5422m</strong><em>£648k below Core</em></article>
          <article className="recommended-option"><span>Core · recommended</span><strong>£3.1902m</strong><em>Balanced breadth, depth and institutional change</em></article>
          <article><span>Enhanced</span><strong>£4.5032m</strong><em>£1.313m above Core</em></article>
        </div>

        <div className="option-narratives">
          <article className="option-card economy-card">
            <p className="option-label">Economy</p>
            <h3>Keep the architecture, accept a lighter and less even transformation.</h3>
            <p>King’s still gets the common models, evidence and proof of concept. More implementation has to be absorbed by existing faculty and professional-service teams, so change is likely to spread more slowly and depend more on strong local capacity.</p>
            <p>For students, the biggest difference is depth. By Year 3 the Beyond Course portfolio could still reach around 6,000 to 6,500 students, but with fewer sustained projects, placements, mentoring and other high-intensity experiences.</p>
          </article>
          <article className="option-card enhanced-card">
            <p className="option-label">Enhanced</p>
            <h3>Buy faster adoption, more opportunity and substantially greater depth.</h3>
            <p>Enhanced gives King’s more partnership capacity, a wider curriculum implementation cohort, broader purpose and skills adoption, and enough Graduate Futures capacity to pursue improvement, student adoption and external reputation in parallel.</p>
            <p>By Year 3 the Beyond Course portfolio could reach around 9,000 to 10,000 students, generate 170,000 to 200,000 student-hours and support around 1,000 to 1,200 sustained high-intensity places.</p>
          </article>
        </div>
      </section>

      <section id="early" className="investment-section early-section">
        <div className="investment-section-heading early-heading">
          <p className="eyebrow">Early investment case</p>
          <h2>£100k to start now</h2>
          <p>If the wider investment decision takes longer, £100k can put visible delivery and the most time-sensitive technical work into motion before January.</p>
        </div>

        <div className="ds-table-wrap early-table-wrap">
          <table className="ds-table early-table">
            <thead>
              <tr><th>Amount</th><th>What we are buying</th><th>What it delivers before January</th></tr>
            </thead>
            <tbody>
              {earlyAsk.map((item) => <tr key={item.amount}>
                <td className="early-amount"><strong>{item.amount}</strong></td>
                <td><strong>{item.buying}</strong></td>
                <td>{item.outputs}</td>
              </tr>)}
            </tbody>
            <tfoot>
              <tr><th><strong>£100k</strong></th><th>Total early investment</th><th>Visible student-facing activity, first Graduate Premium and GO assets, and continued analytics, engineering and co-design work.</th></tr>
            </tfoot>
          </table>
        </div>
        <p className="early-note">This starts the work early rather than adding a new layer of programme cost. Any Student Experience Hub co-design remains part of the separate Digital Student Experience Hub investment.</p>
      </section>

      <section className="investment-source-panel">
        <div>
          <p className="eyebrow">Need the detail?</p>
          <h2>See the full investment handover</h2>
          <p>The detailed handover contains the assumptions, option workings, benefit modelling, accounting boundaries and package-level cost logic behind this presentation.</p>
        </div>
        <a className="ds-button" href="https://github.com/markpeace/KingsEdgeMobilisationPlan/blob/main/docs/portfolio-investment-packages.md" target="_blank" rel="noreferrer">Open detailed handover</a>
      </section>
    </main>
  </>;
}

createRoot(document.getElementById('investment-root')).render(<InvestmentCase />);
