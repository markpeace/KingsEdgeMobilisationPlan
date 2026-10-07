import React from 'react';
import { createRoot } from 'react-dom/client';
import './design-system.css';
import './styles/global-chrome.css';
import './styles/detail-primitives.css';
import './styles/investment-case.css';

const deliverableHref = (id) => `./index.html#/deliverables/${id}`;

function RefLinks({ ids }) {
  return <span className="ds-cluster ask-refs" aria-label="Related deliverables">{ids.map((id) => <a className="ds-tag" key={id} href={deliverableHref(id)}>{id}</a>)}</span>;
}

function UserStories({ stories }) {
  return <ul className="ds-stack investment-user-stories">{stories.map((story) => <li key={`${story.label}-${story.text}`}><strong>{story.label}:</strong> “{story.text}”</li>)}</ul>;
}

function YearOneProgress({ steps }) {
  return <div className="investment-year-one-list">
    {steps.map((step) => <div className="investment-year-one-step" key={`${step.label}-${step.text}`}>
      <strong>{step.label}</strong>
      <p>{step.text}</p>
    </div>)}
  </div>;
}

function InvestmentProfile({ item }) {
  return <div className="investment-profile">
    <div className="investment-profile-primary">
      <span className="investment-profile-label">{item.profileLabel || '2026/27–2028/29 mobilisation profile'}</span>
      <strong className="investment-profile-three-year">{item.threeYearCost}</strong>
      {item.profileNote && <p className="ds-subtle">{item.profileNote}</p>}
    </div>
    <div className="investment-profile-secondary">
      <div>
        <span className="investment-profile-label">2026/27 investment</span>
        <strong className="year-one-price">{item.yearOneCost}</strong>
        <div className="investment-early-gain">
          <span className="investment-profile-label">By the end of 2026/27</span>
          <YearOneProgress steps={item.yearOne} />
        </div>
      </div>
      <div>
        <span className="investment-profile-label">Indicative ongoing annual cost</span>
        <strong className="investment-profile-ongoing">{item.ongoing}</strong>
      </div>
    </div>
  </div>;
}

const corePackages = [
  {
    title: 'King’s Architecture for Employability',
    refs: ['2.2.1', '2.1.3', '2.4.3', '2.2.2'],
    northStar: 'Every student can understand what matters to them, recognise what they are developing, access experiences and relationships that help them grow, evidence their development credibly and make a purposeful transition beyond the degree, supported by the people, partnerships and operating infrastructure needed to make that possible at institutional scale.',
    proposition: 'King’s establishes a distinctive architecture for employability that joins the developmental proposition to the infrastructure required to make it real. Purpose, disciplinary learning, capabilities and trusted evidence give students a framework for understanding what they are becoming. UK and international employer relationships, Global Mobility, common experiential operating infrastructure and opportunity-development capacity create routes through which students can apply and extend that development. Graduate Transitions then supports the move beyond the degree. Employability is therefore treated as broader than preparation for employment: it is the capacity to understand what matters, develop and apply disciplinary and wider capabilities, build relationships and experience, evidence learning credibly and make purposeful transitions.',
    stories: [
      { label: 'Student', text: 'I can understand what matters to me, recognise what I am developing, find experiences and relationships that help me grow, and make a confident next move.' },
      { label: 'Academic / programme team', text: 'I can connect the distinctive capabilities of my discipline to the wider developmental journey without turning my course into generic employability training.' },
      { label: 'External partner / alumnus', text: 'I have a clear route into King’s and can turn an idea into a meaningful student opportunity without navigating multiple disconnected teams.' },
      { label: 'International student / graduate', text: 'I can access employer relationships, labour-market insight and purposeful global experience relevant to the markets in which I may want to live and work.' },
      { label: 'Graduate', text: 'King’s does not disappear at graduation if I am struggling to make the transition. I can be identified and supported through that next step.' },
      { label: 'Recruitment / reputation colleague', text: 'I can evidence a credible employability proposition that goes beyond claims about rankings or a conventional careers service.' },
      { label: 'The University', text: 'We have one coherent architecture connecting educational philosophy, experience, relationships and graduate transition rather than separate interventions around the edges of the degree.' }
    ],
    yearOne: [
      { label: 'Established', text: 'A tested institutional proposition for purpose and self-direction, a candidate skills architecture and clearer requirements for trusted educational recognition, giving King’s a developmental language for employability.' },
      { label: 'Protected and started', text: 'International employer engagement is put onto dedicated footing through a G6 from October 2026, East Asia G5 from January 2027 and £15k activity funding, while purposeful Global Mobility opportunity development begins through a G6 from January 2027.' },
      { label: 'Designed for scale', text: 'A common experiential operating model and institutional partnership baseline are established, with the UK opportunity-development workforce, second Global Mobility post and Graduate Transitions model specified for later mobilisation.' }
    ],
    yearOneCost: '£166k',
    threeYearCost: '£1.445m',
    profileNote: 'Core in-year profile: £165.842k in 2026/27, £558.432k in 2027/28 and £720.277k in 2028/29, or £1.444551m across mobilisation. Of this, 2.2.2 contributes £1.192551m and reaches a £714.058k annualised exit run-rate by June 2029.',
    ongoing: 'c.£723k p.a. + other enduring costs TBC'
  },
  {
    title: 'Experiential Learning in the Curriculum',
    refs: ['2.1.2', '2.1.4', '2.2.3'],
    northStar: 'Every student can expect purposeful experiential learning through or alongside their course, with a defined future entitlement and measurable trajectory, and with King’s able to identify where access or quality is weak, intervene deliberately, and reuse strong academic, regulatory and delivery models across disciplines.',
    proposition: 'King’s builds an institution-wide capability for designing, assuring and growing experiential learning. Strong local practice becomes easier to reuse, and gaps in access can be identified and acted on rather than left to develop unevenly. The relationship infrastructure in the King’s Architecture for Employability can source and develop external propositions; this area changes curriculum and near-curriculum educational practice.',
    stories: [
      { label: 'Student', text: 'I can expect to apply, test and extend my learning through meaningful experience as part of a King’s education, not only if my course already happens to offer it.' },
      { label: 'Course team', text: 'I can act on evidence that experiential learning is weak or uneven in my programme and get practical support to strengthen it.' },
      { label: 'Academic / educator', text: 'I can build purposeful experiential learning into my teaching using tested models and shared support, without having to invent the delivery route from scratch.' },
      { label: 'Faculty / professional staff', text: 'We can move good ideas into delivery more quickly because policy, validation and administrative routes have already been worked through.' },
      { label: 'The University', text: 'We can make meaningful experiential learning a more dependable part of a King’s education and target investment where students currently have the least access.' }
    ],
    yearOne: [
      { label: 'Established', text: 'An agreed experiential-learning North Star and entitlement direction, plus an initial curriculum baseline showing where provision is strong, weak or absent and where growth should be prioritised.' },
      { label: 'Put in place', text: 'A ratified sandwich-year policy and regulatory model, a validated shared 15-credit Level 6 capstone, and reusable academic, policy and delivery routes.' },
      { label: 'Ready for 2027/28', text: 'A sequenced implementation portfolio identifying priority programmes and the practical support needed to move a bounded cohort from diagnosis into changed curriculum.' }
    ],
    yearOneCost: '£59k',
    threeYearCost: '£341k',
    ongoing: 'c.£9k p.a. + costs to confirm'
  },
  {
    title: 'Beyond-Course Opportunity and Participation',
    refs: ['2.2.4', '2.3.1', '2.3.2', '2.3.4'],
    northStar: 'Every student can see and access a rich, coherent and inclusive opportunity environment beyond the course, with King’s actively shaping what exists, who can access it and where new opportunity is needed.',
    proposition: 'King’s moves from aggregating a fragmented offer to actively stewarding the opportunity ecology. Commissioning, participation evidence and a shared student-year rhythm are used to grow both the breadth and the depth of opportunity available to students. This area is the portfolio-and-participation layer: the King’s Architecture for Employability provides the relationship and opportunity-development infrastructure that can feed it, while this investment determines what King’s commissions, grows and makes accessible beyond the course.',
    stories: [
      { label: 'Student', text: 'I can build a sequence of experiences over time, from trying something new through to sustained projects, mentoring, placements and other deeper opportunities.' },
      { label: 'Student', text: 'I can take part in worthwhile opportunities that fit around the realities of my life and study, including commuting, caring, paid work or limited time on campus.' },
      { label: 'Opportunity provider', text: 'I can change my provision when the evidence shows who is missing, where participation drops away or where an experience is not producing the value we intended.' },
      { label: 'The University', text: 'We can actively shape the opportunity environment, commissioning more supply and deeper experiences where evidence shows that students need them most.' }
    ],
    yearOne: [
      { label: 'Live in Year 1', text: 'A common shopfront and live evidence base, alongside a £150k commissioned portfolio intended to reach at least 2,500 distinct students and provide 26.5–33.5k student-hours.' },
      { label: 'Learned in Year 1', text: 'Student Life personas and participation prototypes tested against different patterns of life and study, with better evidence about barriers and participation.' },
      { label: 'Ready for 2027/28', text: 'Clearer commissioning priorities and an evidence base that can be used to decide where to grow supply, deepen experiences and target participation.' }
    ],
    yearOneCost: '£279k',
    threeYearCost: '£1.032m',
    ongoing: 'c.£247k p.a. + costs to confirm'
  },
  {
    title: 'Graduate Futures Intelligence and Value',
    refs: ['2.1.1', '2.4.1', '2.4.2', '2.4.4'],
    northStar: 'King’s can continuously see where graduate value is strong, uneven or changing, act on that evidence, and turn credible learning into stronger student articulation, outcomes and external recognition.',
    proposition: 'Graduate Futures becomes an institutional learning and improvement function. Course evidence, student experience, outcomes data and external challenge feed decisions about what King’s should strengthen, where it should intervene and what it can credibly claim about the value of its education.',
    stories: [
      { label: 'Student', text: 'I can use a clearer account of what my course and wider experience are helping me develop to make decisions, describe my strengths and prepare for what comes next.' },
      { label: 'Course team', text: 'I can act earlier when evidence shows that students are not getting the graduate value we expect, and test whether the changes we make are improving the experience.' },
      { label: 'Faculty leader', text: 'I can direct attention and resource towards the programmes or cohorts where the evidence shows the greatest need or opportunity.' },
      { label: 'Recruitment / reputation colleague', text: 'I can make stronger claims about the value of a King’s education using credible evidence and examples that stand up to scrutiny.' },
      { label: 'The University', text: 'We can close the loop between student experience, graduate outcomes and educational improvement.' }
    ],
    yearOne: [
      { label: 'Established', text: 'The first Graduate Futures evidence-and-action model linking course-level evidence, student experience and outcomes intelligence.' },
      { label: 'Activated', text: 'Publication-ready graduate-premium exemplars, a common external-validation model and targeted Graduate Outcomes response optimisation.' },
      { label: 'Ready for 2027/28', text: 'A repeatable improvement and activation cycle carrying priority findings into course action, student articulation, outcomes work and external positioning.' }
    ],
    yearOneCost: '£170k',
    threeYearCost: '£765k',
    ongoing: 'c.£170k p.a. + costs to confirm'
  }
];

const earlyAsk = [
  {
    amount: '£84.153k',
    buying: 'International employability continuity and first-stage growth',
    outputs: [
      { text: 'A dedicated G6 Employer Relations & Insights Manager (International) from October 2026, a G5 East Asia Adviser from January 2027, and £15k of employer-facing and in-country activity funding. This protects existing employer relationships and market presence while moving the proven East Asia portfolio off discretionary staffing.', refs: ['2.2.2'] }
    ]
  },
  {
    amount: '£60k',
    buying: 'Seed funding for a broader £150k Year 1 investment in new student opportunity',
    outputs: [
      { text: 'A targeted package of substantive new opportunities for final-year students, bringing together Careers, Entrepreneurship and colleagues in IES working on community-engaged experience.', refs: ['2.2.4'] },
      { text: 'The £60k seeds activity across the new-opportunity portfolio. The broader £150k Year 1 investment, subject to the main business case, grows this into a portfolio reaching at least 2,500 distinct students and 26,500–33,500 student-hours.', refs: ['2.2.4'] }
    ]
  },
  {
    amount: '£15k',
    buying: 'Graduate Premium video production and Graduate Outcomes Survey campaign funding',
    outputs: [
      { text: 'Six proof-of-concept video exemplars showing how the distinctive features of a King’s education translate into employability advantage.', refs: ['2.4.1'] },
      { text: 'Ten Graduate Outcomes campaign video assets and targeted LinkedIn activity for priority graduate cohorts.', refs: ['2.4.4'] }
    ]
  },
  {
    amount: '£25k',
    buying: 'Paid student data, AI and prototyping capacity through King’s Talent',
    outputs: [
      { text: 'A live Graduate Futures data pack, an AI-supported curriculum skills audit, a King’s Canvas proof of concept and usable Student Life personas / tested design outputs.', refs: ['2.1.1', '2.1.3', '2.2.1', '2.3.2', '4.1.2'] }
    ]
  }
];

const serviceOptions = [
  {
    name: 'Economy',
    profile: '£112.842k / £336.870k / £411.660k',
    total: '£861.372k',
    exit: '£421.223k p.a.',
    model: 'Protects the 2026/27 international continuity wave and January Global Mobility G6. From 2027/28 it uses a lean three-post UK team (G6 manager, one G5 opportunity-development adviser and one G5 operations/intelligence adviser), retains only the International G6 + East Asia G5, keeps one Global Mobility G6, uses £35k p.a. international non-pay, and adds one G6 Graduate Transitions coach from September 2028 under existing leadership.'
  },
  {
    name: 'Core',
    profile: '£112.842k / £438.932k / £640.777k',
    total: '£1.192551m',
    exit: '£714.058k p.a.',
    model: 'The recommended model: four-post UK team, International G6 + three regional G5s by January 2029, two Global Mobility posts, G7 + G6 Graduate Transitions team from September 2028, and £50k p.a. international non-pay from 2027/28.'
  },
  {
    name: 'Enhanced',
    profile: '£148.961k / £708.451k / £791.295k',
    total: '£1.648707m',
    exit: '£791.295k p.a.',
    model: 'Accelerates scale: both Global Mobility posts from January 2027, £25k international non-pay in Year 1 and £75k p.a. thereafter, a five-post UK team from September 2027 (adding a third G5 opportunity-development adviser), the final two international regional G5s from September 2027, and the full G7 + G6 Graduate Transitions team from September 2027.'
  }
];

function Header() {
  return <header className="site-header investment-header">
    <a href="./index.html#/" className="brand">King's Edge Investment Ask</a>
    <nav aria-label="Investment ask navigation">
      <a href="#case">Investment ask</a>
      <a href="#core">Investment case</a>
      <a href="#options">Alternative options</a>
      <a href="#early">Pre-Business Case</a>
    </nav>
  </header>;
}

function InvestmentCase() {
  return <>
    <Header />
    <main className="investment-case-page">
      <section id="case" className="hero investment-hero" aria-labelledby="investment-title">
        <p className="eyebrow">King’s Edge</p>
        <h1 id="investment-title">Investment ask</h1>
        <div className="ds-table-wrap option-summary-wrap">
          <table className="ds-table option-summary-table" aria-label="King's Edge investment options">
            <thead>
              <tr>
                <th>Option</th><th>2026/27</th><th>2027/28</th><th>2028/29</th><th>Three-year in-year budget</th><th>Indicative ongoing annual cost</th>
              </tr>
            </thead>
            <tbody>
              <tr><th scope="row">Economy</th><td>£573k</td><td>£1.093m</td><td>£1.238m</td><td><strong>£2.904m</strong></td><td>c.£794k p.a. + TBC</td></tr>
              <tr className="recommended-option-row"><th scope="row"><span className="ds-section-heading recommended-option-name">Core</span><span className="ds-eyebrow">Recommended</span></th><td><strong>£673k</strong></td><td><strong>£1.306m</strong></td><td><strong>£1.603m</strong></td><td><strong>£3.583m</strong></td><td><strong>c.£1.149m p.a. + TBC</strong></td></tr>
              <tr><th scope="row">Enhanced</th><td>£759k</td><td>£1.872m</td><td>£2.220m</td><td><strong>£4.852m</strong></td><td>at least c.£1.267m p.a. + TBC</td></tr>
            </tbody>
          </table>
        </div>
        <div className="ds-stack investment-ask-context">
          <p><strong>Core is the recommended planning case.</strong> Economy and Enhanced are now coherent alternative service models rather than percentage adjustments around a protected workforce. Economy establishes the architecture with constrained coverage and throughput. Enhanced accelerates coverage, opportunity-development capacity and graduate-transition capability.</p>
          <p className="ds-subtle investment-boundary">All three options keep mobilisation inside the fixed 2026/27 to 2028/29 window and use in-year planning budgets. Grade-based role costs are treated as fully loaded and remain subject to Finance/HR validation. The Digital Student Experience Hub remains a separate institutional investment.</p>
        </div>
      </section>

      <section id="core" className="investment-section">
        <div className="ds-stack investment-section-heading">
          <p className="eyebrow">Investment case</p>
          <h2 className="ds-section-heading">Four connected investments in graduate value</h2>
          <p><strong>Investing in King’s Edge connects educational philosophy, experience, relationships, evidence and transition around the individual student.</strong> The four investment areas distinguish the architecture and infrastructure for employability, educational transformation within and near the curriculum, the portfolio of opportunities around the course, and the intelligence loop that shows whether King’s is creating and communicating graduate value.</p>
          <p className="ds-subtle"><strong>Employability at King’s is broader than preparation for employment.</strong> It is the capacity to understand what matters, develop and apply disciplinary and wider capabilities, build relationships and experience, evidence learning credibly and make purposeful transitions beyond the degree.</p>
        </div>
        <div className="ds-table-wrap">
          <table className="ds-table investment-table">
            <thead><tr><th>Investment area and North Star</th><th>What changes for people</th><th>Investment profile</th></tr></thead>
            <tbody>{corePackages.map((item) => <tr key={item.title}>
              <td className="investment-package-cell"><h3>{item.title}</h3><RefLinks ids={item.refs} /><div className="investment-north-star"><span className="ds-sequence-kicker">North Star</span><p>{item.northStar}</p></div><div className="investment-proposition"><span className="ds-sequence-kicker">What this changes</span><p>{item.proposition}</p></div></td>
              <td><UserStories stories={item.stories} /></td><td className="investment-profile-cell"><InvestmentProfile item={item} /></td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>

      <section id="options" className="investment-section option-section">
        <div className="ds-stack investment-section-heading">
          <p className="eyebrow">Alternative options</p>
          <h2 className="ds-section-heading">Three genuinely different service models</h2>
          <p className="ds-subtle">The options now flex the employability and experiential workforce as well as the established commissioning, curriculum, participation and Graduate Futures levers. The urgent 2026/27 international continuity investment and January Global Mobility G6 remain protected in all three models.</p>
        </div>

        <div className="ds-table-wrap">
          <table className="ds-table option-summary-table" aria-label="Employability and experiential infrastructure service models">
            <thead><tr><th>2.2.2 service model</th><th>In-year profile</th><th>Three-year total</th><th>Exit run-rate</th><th>What the model buys</th></tr></thead>
            <tbody>{serviceOptions.map((option) => <tr key={option.name}><th scope="row">{option.name}</th><td>{option.profile}</td><td><strong>{option.total}</strong></td><td>{option.exit}</td><td>{option.model}</td></tr>)}</tbody>
          </table>
        </div>

        <div className="ds-editorial-grid option-narratives">
          <article className="ds-editorial-card option-card">
            <div><p className="ds-sequence-kicker">Economy</p><h3>Minimum viable architecture, constrained coverage.</h3></div>
            <div className="ds-metric-grid option-metrics" aria-label="Economy option figures">
              <div className="ds-metric-card"><span>2026/27</span><strong>£573k</strong></div>
              <div className="ds-metric-card"><span>Three-year in-year budget</span><strong>£2.904m</strong></div>
              <div className="ds-metric-card"><span>Difference from Core</span><strong>£679k less</strong></div>
            </div>
            <div className="option-card-copy">
              <p>Economy establishes the architecture but accepts lower brokerage capacity, narrower international market coverage, less mobility-development capacity and a smaller graduate-transition offer.</p>
              <ul className="option-detail-list">
                <li><strong>Employability infrastructure:</strong> three-post UK opportunity-development team; International G6 + East Asia G5 only; one Global Mobility G6; one G6 Graduate Transitions coach from September 2028; £35k p.a. international non-pay after Year 1.</li>
                <li><strong>Purpose, skills and recognition:</strong> narrower trailblazing and greater reliance on mainstream capacity.</li>
                <li><strong>Beyond Course:</strong> commissioning is £100k / £200k / £250k.</li>
                <li><strong>Curriculum and participation:</strong> fewer implementation contexts and lower Student Life activation.</li>
                <li><strong>Graduate Futures:</strong> evidence and targeted intervention are retained, but at lower dedicated capacity.</li>
              </ul>
            </div>
          </article>

          <article className="ds-editorial-card option-card">
            <div><p className="ds-sequence-kicker">Enhanced</p><h3>Accelerated coverage and higher throughput.</h3></div>
            <div className="ds-metric-grid option-metrics" aria-label="Enhanced option figures">
              <div className="ds-metric-card"><span>2026/27</span><strong>£759k</strong></div>
              <div className="ds-metric-card"><span>Three-year in-year budget</span><strong>£4.852m</strong></div>
              <div className="ds-metric-card"><span>Difference from Core</span><strong>£1.269m more</strong></div>
            </div>
            <div className="option-card-copy">
              <p>Enhanced increases the infrastructure as well as the volume of opportunity it is expected to support, so the higher commissioning and implementation ambition is matched by greater relationship, mobility and transition capacity.</p>
              <ul className="option-detail-list">
                <li><strong>Employability infrastructure:</strong> both Global Mobility posts from January 2027; five-post UK team from September 2027; full international regional team from September 2027; full Graduate Transitions team from September 2027; £75k p.a. international non-pay after Year 1.</li>
                <li><strong>Purpose, skills and recognition:</strong> wider trailblazer footprint and faster institutionalisation.</li>
                <li><strong>Beyond Course:</strong> commissioning rises to £200k / £350k / £500k.</li>
                <li><strong>Curriculum and participation:</strong> wider implementation cohort and stronger Student Life capacity.</li>
                <li><strong>Graduate Futures:</strong> enough sustained capacity to run improvement, outcomes optimisation and external activation in parallel.</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section id="early" className="investment-section ds-callout early-section">
        <div className="ds-stack investment-section-heading">
          <p className="eyebrow">Early investment</p>
          <h2 className="ds-section-heading">Pre-Business Case Investment Need</h2>
          <p className="ds-subtle"><strong>£184.153k remains the immediate pre-Business Case investment need.</strong> It combines the existing £100k acceleration bridge with £84.153k of urgent 2026/27 international employability continuity. The January 2027 Global Mobility G6 sits in all three substantive options rather than in the immediate pre-January bridge.</p>
        </div>
        <div className="ds-table-wrap">
          <table className="ds-table early-table">
            <thead><tr><th>Amount</th><th>What we are buying</th><th>What King’s will have from the immediate investment</th><th>Project refs</th></tr></thead>
            <tbody>{earlyAsk.flatMap((item) => item.outputs.map((output, outputIndex) => <tr key={`${item.amount}-${outputIndex}`} className={outputIndex === 0 ? 'early-group-start' : undefined}>
              {outputIndex === 0 && <td className="early-amount" rowSpan={item.outputs.length}><strong>{item.amount}</strong></td>}
              {outputIndex === 0 && <td rowSpan={item.outputs.length}><strong>{item.buying}</strong></td>}
              <td>{output.text}</td><td className="early-refs"><RefLinks ids={output.refs} /></td>
            </tr>))}</tbody>
          </table>
        </div>
        <p className="ds-subtle early-note">The early release is a timing proposal against the relevant 2026/27 planning assumptions, not an additional layer of programme cost. Digital Student Experience Hub development remains a separate institutional investment.</p>
      </section>

      <section className="ds-cluster investment-source-panel">
        <div className="ds-stack investment-source-copy"><p className="eyebrow">Detailed handover</p><h2 className="ds-section-heading">Assumptions and workings</h2><p className="ds-subtle">The full handover contains the option calculations, workforce assumptions, accounting boundaries and package-level cost assumptions behind this page.</p></div>
        <a className="ds-button" href="https://github.com/markpeace/KingsEdgeMobilisationPlan/blob/main/docs/portfolio-investment-packages.md" target="_blank" rel="noreferrer">Open detailed handover</a>
      </section>
    </main>
  </>;
}

createRoot(document.getElementById('investment-root')).render(<InvestmentCase />);