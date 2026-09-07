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
    title: 'Student purpose, skills and recognition',
    refs: ['2.2.1', '2.1.3', '2.4.3'],
    change: 'Students have a clearer way to connect their choices, skills and experiences across their time at King’s, and a more useful record of what they have developed. Course teams have a shared way to make skills visible while retaining disciplinary difference.',
    yearOne: 'Test the purpose, shared skills and recognition approaches with students and course teams; decide what should be adopted or changed; and prepare a small group of trailblazers for the next phase.',
    yearOneCost: '£53k',
    threeYearCost: '£252k',
    ongoing: 'c.£9k p.a. + costs to confirm'
  },
  {
    title: 'Experiential learning in the curriculum',
    refs: ['2.1.2', '2.1.4', '2.2.3'],
    change: 'King’s has a common approach to experiential learning and practical routes for programmes to add or strengthen it. Students on more courses can access projects, placements and other applied learning through or alongside the curriculum.',
    yearOne: 'Agree the King’s model, map current provision, establish the sandwich-year policy route, validate a shared 15-credit capstone and identify the first programmes where implementation support is needed.',
    yearOneCost: '£58.8k',
    threeYearCost: '£341k',
    ongoing: 'c.£9k p.a. + costs to confirm'
  },
  {
    title: 'Beyond-course opportunities and participation',
    refs: ['2.2.2', '2.2.4', '2.3.1', '2.3.2', '2.3.4'],
    change: 'Students can find more opportunities beyond their course through a common shopfront, and King’s can commission new provision where gaps are identified. Participation data shows who is and is not taking part, so access can be improved and investment targeted.',
    yearOne: 'Create the live participation dashboard and common shopfront requirements; commission a £150k opportunity portfolio designed to reach at least 2,500 students; build Student Life personas and participation principles; and define the partnership model needed for later scale.',
    yearOneCost: '£278.5k',
    threeYearCost: '£1.8324m',
    ongoing: 'c.£647k p.a. + costs to confirm'
  },
  {
    title: 'Graduate futures, outcomes and value',
    refs: ['2.1.1', '2.4.1', '2.4.2', '2.4.4'],
    change: 'Course teams receive usable evidence about graduate outcomes and graduate value and can act on it. Students get clearer evidence and language to describe the value of their course and wider experience. King’s can target Graduate Outcomes response work and test which external messages are supported by evidence.',
    yearOne: 'Build the first course-level Graduate Futures Intelligence Pack and graduate premium exemplars; establish an external validation approach; and run targeted Graduate Outcomes response optimisation.',
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
      <p>Release the first 40% of the proposed £150k Year 1 commissioning portfolio. Start final-year career-enhancing projects, mentoring, placements and other deeper experiences, while beginning entrepreneurship, belonging and community-engaged opportunities. <RefLinks ids={['2.2.4']} /></p>
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
    <a href="./index.html#/" className="brand">King's Edge Investment Case</a>
    <nav aria-label="Investment case navigation">
      <a href="#core">Core case</a>
      <a href="#options">Economy / Enhanced</a>
      <a href="#early">Early investment</a>
    </nav>
  </header>;
}

function InvestmentCase() {
  return <>
    <Header />
    <main className="investment-case-page">
      <section className="hero investment-hero" aria-labelledby="investment-title">
        <p className="eyebrow">King’s Edge</p>
        <h1 id="investment-title">Investment case</h1>
        <p className="investment-hero-copy">The recommended Core case is £560.2k in 2026/27 and £3.1902m over three years. It funds four areas of work. The table below sets out what changes if they are funded, what Year 1 pays for, and the resulting cost.</p>
        <div className="investment-metrics" aria-label="Recommended investment headline figures">
          <article><strong>£560.2k</strong><span>2026/27 investment</span></article>
          <article><strong>£3.1902m</strong><span>Three-year investment</span></article>
          <article><strong>c.£834.5k</strong><span>Indicative annual cost once established, plus costs still to confirm</span></article>
        </div>
        <p className="investment-boundary">This is the investment case for King’s Edge. The Digital Student Experience Hub / Digital Front Door has a separate investment case.</p>
      </section>

      <section id="core" className="investment-section">
        <div className="investment-section-heading">
          <p className="eyebrow">Core case</p>
          <h2>What the investment changes</h2>
          <p>Core is the recommended planning case. Each row describes the change being funded, the first-year work required to get there, and the associated cost.</p>
        </div>

        <div className="ds-table-wrap investment-table-wrap">
          <table className="ds-table investment-table">
            <thead>
              <tr>
                <th>Investment area</th>
                <th>What changes</th>
                <th>2026/27 investment and work</th>
                <th>Three-year cost</th>
                <th>Indicative ongoing annual cost</th>
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
                <th colSpan="2">King’s Edge Core case</th>
                <th><strong>£560.2k in 2026/27</strong></th>
                <th><strong>£3.1902m</strong></th>
                <th><strong>c.£834.5k p.a. + TBC</strong></th>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section id="options" className="investment-section option-section">
        <div className="investment-section-heading">
          <p className="eyebrow">Investment options</p>
          <h2>Economy and Enhanced</h2>
          <p>Economy reduces the amount of new capacity and activity funded. Enhanced increases the scale and pace of delivery. Core remains the recommended reference point.</p>
        </div>

        <div className="option-price-band" aria-label="Three year investment options">
          <article><span>Economy</span><strong>£2.5422m</strong><em>£648k below Core</em></article>
          <article className="recommended-option"><span>Core · recommended</span><strong>£3.1902m</strong><em>Recommended planning case</em></article>
          <article><span>Enhanced</span><strong>£4.5032m</strong><em>£1.313m above Core</em></article>
        </div>

        <div className="option-narratives">
          <article className="option-card economy-card">
            <p className="option-label">Economy</p>
            <h3>Lower cost, narrower implementation.</h3>
            <p>Compared with Core, Economy reduces Year 1 Beyond Course commissioning, leaves more curriculum implementation and Student Life activity to existing teams, and requires Graduate Futures work to concentrate on the highest-priority intelligence and interventions.</p>
            <p>By Year 3 the Beyond Course portfolio is modelled to reach around 6,000 to 6,500 students, close to Core on headline reach, but with fewer total student-hours and fewer sustained projects, placements, mentoring and other high-intensity experiences.</p>
          </article>
          <article className="option-card enhanced-card">
            <p className="option-label">Enhanced</p>
            <h3>Higher cost, wider and faster implementation.</h3>
            <p>Compared with Core, Enhanced funds a larger Beyond Course commissioning portfolio, more partnership capacity, a wider curriculum implementation cohort, broader adoption of purpose and skills work, and more Graduate Futures activity running in parallel.</p>
            <p>By Year 3 the Beyond Course portfolio is modelled to reach around 9,000 to 10,000 students, generate 170,000 to 200,000 student-hours and support around 1,000 to 1,200 sustained high-intensity places.</p>
          </article>
        </div>
      </section>

      <section id="early" className="investment-section early-section">
        <div className="investment-section-heading early-heading">
          <p className="eyebrow">Early investment</p>
          <h2>£100k for September to December 2026</h2>
          <p>If funding can be released before the full mobilisation decision, £100k can be used on work that can be commissioned and delivered before January.</p>
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
              <tr><th><strong>£100k</strong></th><th>Total early investment</th><th>Student opportunities, first Graduate Premium and Graduate Outcomes assets, and continued analytics, engineering and student co-design work before January.</th></tr>
            </tfoot>
          </table>
        </div>
        <p className="early-note">The £100k is an early release against the relevant Year 1 planning assumptions, rather than an additional layer of programme cost. Digital Student Experience Hub co-design remains attributable to the separate Digital investment case.</p>
      </section>

      <section className="investment-source-panel">
        <div>
          <p className="eyebrow">Detailed handover</p>
          <h2>Assumptions and workings</h2>
          <p>The full handover contains the option calculations, benefit modelling, accounting boundaries and package-level cost assumptions behind this page.</p>
        </div>
        <a className="ds-button" href="https://github.com/markpeace/KingsEdgeMobilisationPlan/blob/main/docs/portfolio-investment-packages.md" target="_blank" rel="noreferrer">Open detailed handover</a>
      </section>
    </main>
  </>;
}

createRoot(document.getElementById('investment-root')).render(<InvestmentCase />);
