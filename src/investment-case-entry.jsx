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

function InvestmentProfile({ item }) {
  return <div className="investment-profile">
    <div className="investment-profile-primary">
      <span className="investment-profile-label">2026/27 investment</span>
      <strong className="year-one-price">{item.yearOneCost}</strong>
      <div className="investment-early-gain">
        <span className="investment-profile-label">By the end of Year 1</span>
        <p>{item.yearOne}</p>
      </div>
    </div>
    <div className="investment-profile-secondary">
      <div>
        <span className="investment-profile-label">Three-year establishment cost</span>
        <strong className="investment-profile-three-year">{item.threeYearCost}</strong>
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
    title: 'Student Purpose, Skills and Educational Recognition',
    refs: ['2.2.1', '2.1.3', '2.4.3'],
    northStar: 'Every student can intentionally shape their development, understand and evidence the capabilities they are building through their whole King’s experience, and leave with a richer, trusted account of what they know, can do and contribute.',
    stories: [
      { label: 'Student', text: 'I can explore what matters to me without needing a fixed career destination, and use that evolving sense of purpose to make more intentional choices at King’s.' },
      { label: 'Student', text: 'I can recognise the capabilities I am developing across my course and wider experience, understand the evidence behind them and decide what I want to strengthen next.' },
      { label: 'Student / graduate', text: 'I can leave with a richer account of my learning that makes clear what King’s certifies or recognises, what I can evidence and what I claim about myself.' },
      { label: 'Programme team / academic', text: 'I can make the distinctive capabilities of my discipline more visible using a shared language without flattening disciplinary difference.' }
    ],
    yearOne: 'King’s has testable institutional propositions for purpose and self-direction, skills architecture and trusted recognition; an adopt / adapt / reconsider decision on the skills architecture; and a bounded set of deep trailblazers ready for 2027/28.',
    yearOneCost: '£53k',
    threeYearCost: '£252k',
    ongoing: 'c.£9k p.a. + costs to confirm'
  },
  {
    title: 'Experiential Learning in the Curriculum',
    refs: ['2.1.2', '2.1.4', '2.2.3'],
    northStar: 'Every student has meaningful access to purposeful experiential learning through or alongside their course, with King’s able to assure quality and inclusion, target growth where provision is weak, and reuse strong academic, regulatory and delivery models.',
    stories: [
      { label: 'Student', text: 'I can expect meaningful opportunities to learn through experience as part of a King’s education, not only if I happen to choose a course with established local provision.' },
      { label: 'Course team', text: 'I can see where experiential learning is strong or weak and get practical support to strengthen it.' },
      { label: 'Academic / educator', text: 'I have a clear King’s account of good experiential learning while retaining room for disciplinary difference.' },
      { label: 'Professional staff / governance', text: 'We have reusable policy, validation and administrative routes for sandwich years and near-curriculum learning.' }
    ],
    yearOne: 'King’s has an agreed experiential-learning North Star and entitlement direction, an initial curriculum baseline and growth priorities, a ratified sandwich-year policy and regulatory model, a validated shared 15-credit Level 6 capstone, and a sequenced implementation portfolio.',
    yearOneCost: '£58.8k',
    threeYearCost: '£341k',
    ongoing: 'c.£9k p.a. + costs to confirm'
  },
  {
    title: 'Beyond-Course Opportunity and Participation',
    refs: ['2.2.2', '2.2.4', '2.3.1', '2.3.2', '2.3.4'],
    northStar: 'Every student can see and access a coherent, inclusive ecology of meaningful opportunity beyond the course, whatever their pattern of life and study, while King’s actively stewards that ecology using evidence, partnerships, commissioning and a shared student-year rhythm.',
    stories: [
      { label: 'Student', text: 'I can see a richer range of Beyond Course opportunities in one place and find things that fit my interests and circumstances.' },
      { label: 'Student', text: 'My pattern of life and study is considered in how opportunities are designed, and practical barriers are less likely to determine whether I can participate.' },
      { label: 'Opportunity provider', text: 'I can see who my provision reaches, where participation is unequal and what difference it appears to make.' },
      { label: 'External partner / alumnus', text: 'I have clearer routes to create meaningful opportunities with King’s and encounter less fragmented brokerage and administration.' },
      { label: 'The University', text: 'We can see the shape, reach, equity and emerging impact of our Beyond Course investment and make deliberate commissioning decisions.' }
    ],
    yearOne: 'King’s has a live evidence base and common shopfront; a £150k commissioned opportunity portfolio intended to reach at least 2,500 distinct students and provide 26.5–33.5k student-hours; Student Life personas and participation prototypes; a shared student-year rhythm; and costed partnership and access options for 2027/28.',
    yearOneCost: '£278.5k',
    threeYearCost: '£1.8324m',
    ongoing: 'c.£647k p.a. + costs to confirm'
  },
  {
    title: 'Graduate Futures Intelligence and Value',
    refs: ['2.1.1', '2.4.1', '2.4.2', '2.4.4'],
    northStar: 'King’s continuously understands, strengthens, proves and activates the distinctive graduate value of its education, using course-level evidence, external challenge and outcomes intelligence both to improve the offer and to make credible claims to students and the wider market.',
    stories: [
      { label: 'Student', text: 'I can recognise and articulate more of the value I am gaining from my course, wider experiences, skills and ambitions.' },
      { label: 'Course team', text: 'I have trusted evidence to explain the graduate futures value of my course and take proportionate action to strengthen it.' },
      { label: 'Employer / alumnus / external partner', text: 'There is a structured way for my insight to challenge and strengthen what King’s offers students.' },
      { label: 'Recruitment / reputation colleague', text: 'I have credible, reusable evidence and content that I can activate with different audiences.' },
      { label: 'The University', text: 'We can distinguish what we believe about the value of a King’s education from what the evidence and external challenge actually support.' }
    ],
    yearOne: 'King’s has the first Graduate Futures evidence-and-action model, publication-ready graduate-premium exemplars and rich media, a common external-validation model, targeted Graduate Outcomes response optimisation, a strategic survey and reputation intelligence baseline, and flexible strategic partnership and profile capacity.',
    yearOneCost: '£169.9k',
    threeYearCost: '£764.8k',
    ongoing: 'c.£169.5k p.a. + costs to confirm'
  }
];

const earlyAsk = [
  {
    amount: '£60k',
    buying: 'Externally commissioned student opportunities',
    outputs: [
      { text: 'Release the first 40% of the proposed £150k Year 1 commissioning portfolio.', refs: ['2.2.4'] },
      { text: 'Start final-year career-enhancing projects, mentoring, placements and other deeper experiences.', refs: ['2.2.4'] },
      { text: 'Begin commissioning across entrepreneurship and enterprise, belonging and connection, and service and community-engaged experience.', refs: ['2.2.4'] }
    ]
  },
  {
    amount: '£15k',
    buying: 'Freelance video production',
    outputs: [
      { text: 'Produce the first Graduate Premium video exemplars and establish the production approach.', refs: ['2.4.1'] },
      { text: 'Produce promotional video and related assets to support Graduate Outcomes survey response.', refs: ['2.4.4'] }
    ]
  },
  {
    amount: '£25k',
    buying: 'Paid student time through King’s Talent',
    outputs: [
      { text: 'Power BI and Microsoft Fabric engineering for the Graduate Futures Intelligence Pack, Graduate Outcomes optimisation and Beyond Course dashboard.', refs: ['2.1.1', '2.4.4', '2.3.1'] },
      { text: 'Prototype LLM-led course skills interrogation tooling.', refs: ['2.1.3'] },
      { text: 'Student Life persona co-design and Student Experience Hub ideation and prototype input.', refs: ['2.3.2', '4.1.2'] }
    ]
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
                <th>Option</th>
                <th>2026/27</th>
                <th>2027/28</th>
                <th>2028/29</th>
                <th>Three-year establishment cost</th>
                <th>Indicative ongoing annual cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Economy</th>
                <td>£460.2k</td>
                <td>£1.006m</td>
                <td>£1.076m</td>
                <td><strong>£2.5422m</strong></td>
                <td>c.£623k p.a. + TBC</td>
              </tr>
              <tr className="recommended-option-row">
                <th scope="row"><span className="ds-section-heading recommended-option-name">Core</span><span className="ds-eyebrow">Recommended</span></th>
                <td><strong>£560.2k</strong></td>
                <td><strong>£1.2675m</strong></td>
                <td><strong>£1.3625m</strong></td>
                <td><strong>£3.1902m</strong></td>
                <td><strong>c.£834.5k p.a. + TBC</strong></td>
              </tr>
              <tr>
                <th scope="row">Enhanced</th>
                <td>£610.2k</td>
                <td>£1.764m</td>
                <td>£2.129m</td>
                <td><strong>£4.5032m</strong></td>
                <td>at least c.£1.176m p.a. + TBC</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="ds-stack investment-ask-context">
          <p><strong>Core is the recommended planning case.</strong> Economy and Enhanced show lower- and higher-investment variants around it. <a href="#options">See the alternative options below</a> for the practical effect of reducing spend or increasing pace and impact.</p>
          <p className="ds-subtle investment-boundary">The figures for 2026/27 to 2028/29 cover the establishment period. The Digital Student Experience Hub / Digital Front Door has a separate investment ask.</p>
        </div>
      </section>

      <section id="core" className="investment-section">
        <div className="ds-stack investment-section-heading">
          <p className="eyebrow">Investment case</p>
          <h2 className="ds-section-heading">What implementation brings to the institution</h2>
          <p><strong>Investing in King’s Edge moves purpose and graduate futures to the organising core of the student experience.</strong> It connects curriculum, skills, opportunities and wider student life, while deepening the opportunity structure available to students. For King’s, that means a more coherent student experience, more deliberate use of investment and a stronger account of the value of a King’s education.</p>
        </div>

        <div className="ds-table-wrap">
          <table className="ds-table investment-table">
            <thead>
              <tr>
                <th>Investment area and North Star</th>
                <th>What changes for people</th>
                <th>Investment profile</th>
              </tr>
            </thead>
            <tbody>
              {corePackages.map((item) => <tr key={item.title}>
                <td className="investment-package-cell">
                  <h3>{item.title}</h3>
                  <RefLinks ids={item.refs} />
                  <div className="investment-north-star"><span className="ds-sequence-kicker">North Star</span><p>{item.northStar}</p></div>
                </td>
                <td><UserStories stories={item.stories} /></td>
                <td className="investment-profile-cell"><InvestmentProfile item={item} /></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <section id="options" className="investment-section option-section">
        <div className="ds-stack investment-section-heading">
          <p className="eyebrow">Alternative options</p>
          <h2 className="ds-section-heading">Levers to reduce spend or increase pace and impact</h2>
        </div>

        <div className="ds-editorial-grid option-narratives">
          <article className="ds-editorial-card option-card">
            <div>
              <p className="ds-sequence-kicker">Economy</p>
              <h3>Lower cost, narrower implementation.</h3>
            </div>
            <div className="ds-metric-grid option-metrics" aria-label="Economy option figures">
              <div className="ds-metric-card"><span>2026/27</span><strong>£460.2k</strong></div>
              <div className="ds-metric-card"><span>Three-year establishment</span><strong>£2.5422m</strong></div>
              <div className="ds-metric-card"><span>Difference from Core</span><strong>£648k less</strong></div>
            </div>
            <div className="option-card-copy">
              <p>Economy keeps the architecture and proof of concept, but accepts a more uneven and breadth-first implementation with greater dependence on existing institutional capacity.</p>
              <ul className="option-detail-list">
                <li><strong>Beyond Course:</strong> Year 1 commissioning reduces to £100k rather than £150k. Indicative Year 1 reach falls to around 1,600–1,900 students, with 16–22k student-hours and around 200–250 sustained places. By Year 3 headline reach can recover towards Core, but depth remains lower.</li>
                <li><strong>Curriculum, purpose and skills:</strong> King’s still gets the common experiential-learning model, curriculum baseline, sandwich-year route and shared capstone, while purpose and skills work is tested across fewer contexts. More implementation has to travel through existing faculty capacity and strong local adopters.</li>
                <li><strong>Participation and partnerships:</strong> fewer Student Life prototypes and less central partnership capacity mean more reliance on local teams for brokerage, contracting, partner support and participation activity.</li>
                <li><strong>Graduate Futures:</strong> the evidence engine remains, but activity has to concentrate on intelligence and targeted interventions rather than sustaining course improvement, student activation, outcomes optimisation, external engagement and reputation work in parallel.</li>
                <li><strong>Institutional consequence:</strong> King’s can still prove the model, but carries a higher risk of partial institutionalisation and uneven delivery across faculties and campuses.</li>
              </ul>
            </div>
          </article>

          <article className="ds-editorial-card option-card">
            <div>
              <p className="ds-sequence-kicker">Enhanced</p>
              <h3>Higher cost, wider and faster implementation.</h3>
            </div>
            <div className="ds-metric-grid option-metrics" aria-label="Enhanced option figures">
              <div className="ds-metric-card"><span>2026/27</span><strong>£610.2k</strong></div>
              <div className="ds-metric-card"><span>Three-year establishment</span><strong>£4.5032m</strong></div>
              <div className="ds-metric-card"><span>Difference from Core</span><strong>£1.313m more</strong></div>
            </div>
            <div className="option-card-copy">
              <p>Enhanced buys a materially larger King’s Edge, with more opportunity, more delivery capacity and faster institutional adoption rather than simply restoring the previous plan.</p>
              <ul className="option-detail-list">
                <li><strong>Beyond Course:</strong> commissioning rises to £200k, £350k and £500k across the three years. By Year 3 the portfolio is modelled to reach around 9,000–10,000 students, generate 170–200k student-hours and support around 1,000–1,200 sustained high-intensity places.</li>
                <li><strong>Curriculum, purpose and skills:</strong> a wider implementation cohort and broader trailblazer footprint allow King’s to support more programmes and disciplines directly, producing more exemplars and a faster route into mainstream practice.</li>
                <li><strong>Participation and partnerships:</strong> stronger partnership and Student Life capacity supports more faculties, more complex opportunities and more deliberate responses to participation gaps across campuses and student moments.</li>
                <li><strong>Graduate Futures:</strong> enough sustained capacity exists to run course improvement, student adoption, Graduate Outcomes optimisation, employer and alumni engagement, and external reputation work in parallel at greater scale.</li>
                <li><strong>Institutional consequence:</strong> more of the transformation becomes visible within the mobilisation period, with the trade-off of a larger recurrent operating model and greater risk of creating capacity ahead of demonstrated demand.</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section id="early" className="investment-section ds-callout early-section">
        <div className="ds-stack investment-section-heading">
          <p className="eyebrow">Early investment</p>
          <h2 className="ds-section-heading">Pre-Business Case Investment Need</h2>
          <p className="ds-subtle">If funding can be released before the full mobilisation decision, £100k can be used on work that can be commissioned and delivered before January.</p>
        </div>

        <div className="ds-table-wrap">
          <table className="ds-table early-table">
            <thead>
              <tr><th>Amount</th><th>What we are buying</th><th>What it delivers before January</th><th>Project refs</th></tr>
            </thead>
            <tbody>
              {earlyAsk.flatMap((item) => item.outputs.map((output, outputIndex) => <tr key={`${item.amount}-${outputIndex}`} className={outputIndex === 0 ? 'early-group-start' : undefined}>
                {outputIndex === 0 && <td className="early-amount" rowSpan={item.outputs.length}><strong>{item.amount}</strong></td>}
                {outputIndex === 0 && <td rowSpan={item.outputs.length}><strong>{item.buying}</strong></td>}
                <td>{output.text}</td>
                <td className="early-refs"><RefLinks ids={output.refs} /></td>
              </tr>))}
            </tbody>
            <tfoot>
              <tr><th><strong>£100k</strong></th><th>Total early investment</th><th>Student opportunities, first Graduate Premium and Graduate Outcomes assets, and continued analytics, engineering and student co-design work before January.</th><th>—</th></tr>
            </tfoot>
          </table>
        </div>
        <p className="ds-subtle early-note">The £100k is an early release against the relevant Year 1 planning assumptions, rather than an additional layer of programme cost. Digital Student Experience Hub co-design remains attributable to the separate Digital investment case.</p>
        <div className="ds-editorial-grid early-outcomes">
          <article className="ds-editorial-card">
            <p className="ds-sequence-kicker">What we gain</p>
            <h3>Useful delivery and evidence before January.</h3>
            <p>An autumn tranche of student opportunities, first media assets to test, and continued analytics, engineering and student co-design. The substantive business case therefore starts from live delivery, evidence and prototypes rather than a standing start.</p>
          </article>
          <article className="ds-editorial-card">
            <p className="ds-sequence-kicker">What we lose without it</p>
            <h3>The September to December delivery and testing window.</h3>
            <p>Opportunity commissioning, media production and technical and co-design work would largely wait for the substantive decision, pushing learning and delivery into the main mobilisation period.</p>
          </article>
        </div>
      </section>

      <section className="ds-cluster investment-source-panel">
        <div className="ds-stack investment-source-copy">
          <p className="eyebrow">Detailed handover</p>
          <h2 className="ds-section-heading">Assumptions and workings</h2>
          <p className="ds-subtle">The full handover contains the option calculations, benefit modelling, accounting boundaries and package-level cost assumptions behind this page.</p>
        </div>
        <a className="ds-button" href="https://github.com/markpeace/KingsEdgeMobilisationPlan/blob/main/docs/portfolio-investment-packages.md" target="_blank" rel="noreferrer">Open detailed handover</a>
      </section>
    </main>
  </>;
}

createRoot(document.getElementById('investment-root')).render(<InvestmentCase />);