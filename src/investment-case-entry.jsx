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
    title: 'Student Purpose, Skills and Educational Recognition',
    refs: ['2.2.1', '2.1.3', '2.4.3'],
    northStar: 'Every student has a developmental relationship with King’s shaped by purpose as well as discipline. King’s helps them explore what matters, connect their course, wider experiences, relationships and ambitions, make intentional choices, and build a trusted account of what they are learning and becoming. In doing so, King’s develops a distinctive model for connecting purpose, disciplinary education, capability and evidence around the individual student.',
    proposition: 'This changes the contract between student and university. King’s takes greater responsibility for connecting the parts of the student experience around individual development, while students are supported to take active ownership of the choices, experiences and evidence that shape their future. Purpose becomes an organising principle alongside the disciplinary journey, with course learning, wider opportunity, skills, recognition and future planning connected through a common developmental model. The result is a model King’s can institutionalise at scale and contribute to the sector: one that preserves the richness of disciplinary education while making individual development more intentional, visible and credible.',
    stories: [
      { label: 'Student', text: 'I can arrive without a fixed destination and use my time at King’s to explore what matters to me, test different possibilities and develop a clearer sense of where I want to go.' },
      { label: 'Student', text: 'I can use my goals and interests to shape choices across my course and wider King’s experience, rather than treating them as separate parts of university life.' },
      { label: 'Student', text: 'When my ambitions change, I can make a new choice, find a relevant next experience and keep building a journey that still feels like mine.' },
      { label: 'Student / graduate', text: 'I leave with a trusted account of the knowledge, capabilities and experiences I have actually developed, with evidence I can use beyond King’s.' },
      { label: 'Programme team / academic', text: 'I can help students connect the distinctive learning in my discipline with the capabilities, questions and futures they want to pursue.' },
      { label: 'Professional services colleague', text: 'I can connect a student to opportunities and support in the context of what they are trying to achieve, rather than handing them between separate services.' },
      { label: 'The University', text: 'We can respond boldly to the Future Jobs agenda by connecting purpose, disciplinary learning, skills, experience and trusted evidence around the individual student, and build a model that can influence how the sector thinks about graduate development.' }
    ],
    yearOne: [
      { label: 'Established', text: 'A tested institutional proposition for purpose and self-direction, alongside clearer requirements for trusted educational recognition and the student-facing relationship King’s is seeking to create.' },
      { label: 'Tested', text: 'A candidate skills architecture examined across contrasting disciplinary contexts against the emerging national Future Jobs and UKSSC agenda, producing an adopt / adapt / reconsider decision.' },
      { label: 'Ready for 2027/28', text: 'A bounded set of deep trailblazers with agreed contexts, evidence needs and implementation questions, ready to move from proposition design into live institutional practice.' }
    ],
    yearOneCost: '£53k',
    threeYearCost: '£252k',
    ongoing: 'c.£9k p.a. + costs to confirm'
  },
  {
    title: 'Experiential Learning in the Curriculum',
    refs: ['2.1.2', '2.1.4', '2.2.3'],
    northStar: 'Every student can expect purposeful experiential learning through or alongside their course, with a defined future entitlement and measurable trajectory, and with King’s able to identify where access or quality is weak, intervene deliberately, and reuse strong academic, regulatory and delivery models across disciplines.',
    proposition: 'King’s builds an institution-wide capability for designing, assuring and growing experiential learning. Strong local practice becomes easier to reuse, and gaps in access can be identified and acted on rather than left to develop unevenly. The institution can see where meaningful experiential learning is strong, weak or absent, support priority programmes through reusable academic, policy, validation and delivery routes, and scale proven models such as sandwich years and shared capstone provision without flattening disciplinary difference.',
    stories: [
      { label: 'Student', text: 'I can expect to apply, test and extend my learning through meaningful experience as part of a King’s education, not only if my course already happens to offer it.' },
      { label: 'Student', text: 'I can take on real challenges, work with people beyond my usual academic setting and use those experiences to deepen what I learn in my discipline.' },
      { label: 'Course team', text: 'I can act on evidence that experiential learning is weak or uneven in my programme and get practical support to strengthen it.' },
      { label: 'Academic / educator', text: 'I can build purposeful experiential learning into my teaching using tested models and shared support, without having to invent the delivery route from scratch.' },
      { label: 'Faculty / professional staff', text: 'We can move good ideas into delivery more quickly because policy, validation and administrative routes have already been worked through.' },
      { label: 'Education leader / quality colleague', text: 'I can scale models that are working, challenge persistent gaps and support programmes to improve without imposing one uniform design across disciplines.' },
      { label: 'The University', text: 'We can make meaningful experiential learning a more dependable part of a King’s education and target investment where students currently have the least access.' }
    ],
    yearOne: [
      { label: 'Established', text: 'An agreed experiential-learning North Star and entitlement direction, benchmarked against the UUK 2030 and 2035 milestones, plus an initial curriculum baseline showing where provision is strong, weak or absent and where growth should be prioritised.' },
      { label: 'Put in place', text: 'A ratified sandwich-year policy and regulatory model, a validated shared 15-credit Level 6 capstone, and reusable academic, policy and delivery routes that remove avoidable friction for course teams.' },
      { label: 'Ready for 2027/28', text: 'A sequenced implementation portfolio identifying priority programmes and the practical support needed to move a bounded cohort from diagnosis into changed curriculum.' }
    ],
    yearOneCost: '£59k',
    threeYearCost: '£341k',
    ongoing: 'c.£9k p.a. + costs to confirm'
  },
  {
    title: 'Future-Proofed Employability & Experiential Infrastructure',
    refs: ['2.2.2'],
    northStar: 'King’s has the people, partnerships and operating infrastructure to turn external relationships into high-quality experiential opportunity, connect students and graduates with employers in the UK and internationally, widen purposeful global experience, and support successful transition into graduate futures.',
    proposition: 'This becomes a distinct institutional capability rather than a hidden support cost inside Beyond Course. International employer engagement is protected immediately in 2026/27 and Global Mobility opportunity development begins from January 2027; a four-post UK Experiential Partnerships & Opportunity Development team then translates employer, alumni, civic, cultural and community relationships into student-ready opportunities from 2027/28, the second Global Mobility post completes that opportunity-development capability, and a small Graduate Transitions function moves post-completion support from principally reactive access towards targeted intervention. The common experiential operating model governs sourcing, design, approval, promotion, delivery, support and evaluation, so new capacity strengthens distributed delivery rather than centralising every relationship or opportunity.',
    stories: [
      { label: 'Student', text: 'I can benefit from meaningful external opportunities without needing to know which part of King’s holds the relationship or how the administration works behind it.' },
      { label: 'International student / graduate', text: 'I can access employer relationships and labour-market insight relevant to the countries and markets in which I may want to work.' },
      { label: 'Graduate', text: 'If I leave King’s without a positive destination, support does not depend entirely on me finding my way back to the service.' },
      { label: 'Faculty / programme team', text: 'I can bring a partner idea or relationship and get practical help to scope it into a viable project, placement, challenge, live brief or other experiential opportunity.' },
      { label: 'External partner / alumnus', text: 'I have a clearer route into King’s, encounter less duplicated administration and can repeat successful activity more easily.' },
      { label: 'Recruitment / reputation colleague', text: 'I can draw on credible employer, mobility and graduate-success capability when explaining the value and return of a King’s education.' },
      { label: 'The University', text: 'We have visible capacity behind graduate success, rather than relying on dispersed relationships and discretionary staff effort to generate opportunity and support transition.' }
    ],
    yearOne: [
      { label: 'Protected', text: 'Existing international employability activity is put onto dedicated footing through a G6 International Employer Relations & Insights Manager from October 2026, a G5 East Asia Adviser from January 2027 and £15k of employer-facing / in-country activity funding.' },
      { label: 'Started', text: 'Purposeful global-opportunity development begins through a G6 Global Mobility Opportunity Development Manager from January 2027, ahead of the second Global Mobility post in 2027/28.' },
      { label: 'Designed', text: 'A common experiential operating model and institutional partnership baseline is established, and the UK opportunity-development workforce and Graduate Transitions model are specified for later mobilisation.' }
    ],
    yearOneCost: '£113k',
    threeYearCost: '£1.193m',
    profileNote: 'In-year planning budget: £112.842k in 2026/27, £438.932k in 2027/28 and £640.777k in 2028/29. The first year includes the international G6 from October, East Asia G5 and Global Mobility G6 from January, plus £15k international non-pay. The fully mobilised annualised exit run-rate remains £714.058k by June 2029.',
    ongoing: '£714k p.a. fully mobilised; BAU TBC'
  },
  {
    title: 'Beyond-Course Opportunity and Participation',
    refs: ['2.2.4', '2.3.1', '2.3.2', '2.3.4'],
    northStar: 'Every student can see and access a rich, coherent and inclusive opportunity environment beyond the course, with King’s actively shaping what exists, who can access it and where new opportunity is needed.',
    proposition: 'King’s moves from aggregating a fragmented offer to actively stewarding the opportunity ecology. Commissioning, participation evidence and a shared student-year rhythm are used to grow both the breadth and the depth of opportunity available to students. The package now concentrates on the student-facing opportunity portfolio and participation system; the substantial partnership, employer, mobility and graduate-transition infrastructure required to generate and sustain opportunity is shown separately in 2.2.2 rather than hidden inside this package.',
    stories: [
      { label: 'Student', text: 'I can build a sequence of experiences over time, from trying something new through to sustained projects, mentoring, placements and other deeper opportunities.' },
      { label: 'Student', text: 'I can take part in worthwhile opportunities that fit around the realities of my life and study, including commuting, caring, paid work or limited time on campus.' },
      { label: 'Student', text: 'I can move from browsing what is available to choosing opportunities that genuinely help me develop, contribute and take a next step.' },
      { label: 'Opportunity provider', text: 'I can change my provision when the evidence shows who is missing, where participation drops away or where an experience is not producing the value we intended.' },
      { label: 'Faculty / professional staff', text: 'I can coordinate local provision with the wider King’s offer and focus effort on gaps rather than duplicating activity that already exists elsewhere.' },
      { label: 'The University', text: 'We can actively shape the opportunity environment, commissioning more supply and deeper experiences where evidence shows that students need them most.' }
    ],
    yearOne: [
      { label: 'Live in Year 1', text: 'A common shopfront and live evidence base, alongside a £150k commissioned portfolio intended to reach at least 2,500 distinct students and provide 26.5–33.5k student-hours, including deeper sustained experiences.' },
      { label: 'Learned in Year 1', text: 'Student Life personas and participation prototypes tested against different patterns of life and study, with better evidence about barriers, participation, provider reach and how the shared student-year rhythm can improve access.' },
      { label: 'Ready for 2027/28', text: 'Clearer commissioning priorities and an evidence base that can be used to decide where to grow supply, deepen experiences and target participation, with partnership translation supported through the separate 2.2.2 investment area.' }
    ],
    yearOneCost: '£279k',
    threeYearCost: '£1.032m',
    ongoing: 'c.£247k p.a. + costs to confirm'
  },
  {
    title: 'Graduate Futures Intelligence and Value',
    refs: ['2.1.1', '2.4.1', '2.4.2', '2.4.4'],
    northStar: 'King’s can continuously see where graduate value is strong, uneven or changing, act on that evidence, and turn credible learning into stronger student articulation, outcomes and external recognition.',
    proposition: 'Graduate Futures becomes an institutional learning and improvement function. Course evidence, student experience, outcomes data and external challenge feed decisions about what King’s should strengthen, where it should intervene and what it can credibly claim about the value of its education. That gives King’s a routine view of where graduate value is strong, uneven or changing, allows improvement activity to be targeted at the courses and cohorts where it matters most, and turns credible evidence into student, recruitment, reputation and partner-facing claims without overstating what the evidence supports.',
    stories: [
      { label: 'Student', text: 'I can use a clearer account of what my course and wider experience are helping me develop to make decisions, describe my strengths and prepare for what comes next.' },
      { label: 'Course team', text: 'I can act earlier when evidence shows that students are not getting the graduate value we expect, and test whether the changes we make are improving the experience.' },
      { label: 'Faculty leader', text: 'I can direct attention and resource towards the programmes or cohorts where the evidence shows the greatest need or opportunity.' },
      { label: 'Employer / alumnus / external partner', text: 'My insight can feed a structured improvement process, so external challenge leads to decisions and changes rather than sitting alongside the curriculum.' },
      { label: 'Student-success / careers colleague', text: 'I can use outcomes and student-experience evidence together to target support earlier and more precisely, rather than waiting until problems appear after graduation.' },
      { label: 'Recruitment / reputation colleague', text: 'I can make stronger claims about the value of a King’s education using credible evidence and examples that stand up to scrutiny.' },
      { label: 'The University', text: 'We can close the loop between student experience, graduate outcomes and educational improvement, using what we learn to strengthen both the offer and the case we make for it.' }
    ],
    yearOne: [
      { label: 'Established', text: 'The first Graduate Futures evidence-and-action model linking course-level evidence, student experience and outcomes intelligence, together with a strategic survey and reputation-intelligence baseline.' },
      { label: 'Activated', text: 'Publication-ready graduate-premium exemplars and rich media, a common external-validation model and targeted Graduate Outcomes response optimisation, allowing priority evidence to move into live improvement and communication activity.' },
      { label: 'Ready for 2027/28', text: 'A repeatable improvement and activation cycle, with flexible partnership and profile capacity to carry the highest-priority findings into course action, student articulation, outcomes work and external positioning.' }
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
      { text: 'A targeted package of substantive new opportunities for final-year students, bringing together Careers, Entrepreneurship and colleagues in IES working on community-engaged experience. The focus is on helping students translate their talents into experience and gain the final adjunct skills, relationships and evidence they need for the transition beyond King’s.', refs: ['2.2.4'] },
      { text: 'An ambition to engage around 700 final-year undergraduates, approximately 10% of the graduating undergraduate population, generating c.10,000–12,000 student-hours and around 150 sustained places providing internship-like experience, alongside shorter and more scalable opportunities.', refs: ['2.2.4'] },
      { text: 'The £60k seeds activity across the new-opportunity portfolio throughout the academic year. The broader £150k Year 1 investment, subject to the main business case, grows this into a portfolio reaching at least 2,500 distinct students, 26,500–33,500 student-hours and around 350 sustained high-depth places.', refs: ['2.2.4'] }
    ]
  },
  {
    amount: '£15k',
    buying: 'Graduate Premium video production and Graduate Outcomes Survey campaign funding',
    outputs: [
      { text: 'Six proof-of-concept video exemplars showing, at disciplinary level, how the distinctive features of a King’s education translate into employability advantage.', refs: ['2.4.1'] },
      { text: 'Funding for Graduate Outcomes Survey promotion, including production of ten campaign video assets and paid investment in targeted LinkedIn campaigns focused on priority graduate cohorts.', refs: ['2.4.4'] }
    ]
  },
  {
    amount: '£25k',
    buying: 'Paid student data, AI and prototyping capacity through King’s Talent',
    outputs: [
      { text: 'A live, wide-ranging Graduate Futures data pack giving King’s a clearer institutional view of where graduate strengths are concentrated, where outcomes are uneven and where there is potential for development.', refs: ['2.1.1', '2.4.4'] },
      { text: 'A working AI-supported curriculum skills audit aligned to the UK Standard Skills Classification, tested as an adopt / adapt / reconsider experiment.', refs: ['2.1.3'] },
      { text: 'A working proof of concept for King’s Canvas, testing an LLM-supported way for students to map aspirations, interests and needs and connect them to relevant opportunities.', refs: ['2.2.1', '4.1.2'] },
      { text: 'A usable first set of Student Life personas and tested design outputs, informing King’s Edge design and the separate Digital Student Experience Hub proposition.', refs: ['2.3.2', '4.1.2'] }
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
                <th>Three-year in-year budget</th>
                <th>Indicative ongoing annual cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Economy</th>
                <td>£573k</td>
                <td>£1.195m</td>
                <td>£1.467m</td>
                <td><strong>£3.235m</strong></td>
                <td>c.£1.087m p.a. + TBC at full 2.2.2 run-rate</td>
              </tr>
              <tr className="recommended-option-row">
                <th scope="row"><span className="ds-section-heading recommended-option-name">Core</span><span className="ds-eyebrow">Recommended</span></th>
                <td><strong>£673k</strong></td>
                <td><strong>£1.306m</strong></td>
                <td><strong>£1.603m</strong></td>
                <td><strong>£3.583m</strong></td>
                <td><strong>c.£1.149m p.a. + TBC at full 2.2.2 run-rate</strong></td>
              </tr>
              <tr>
                <th scope="row">Enhanced</th>
                <td>£723k</td>
                <td>£1.603m</td>
                <td>£2.070m</td>
                <td><strong>£4.396m</strong></td>
                <td>at least c.£1.190m p.a. + TBC at full 2.2.2 run-rate</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="ds-stack investment-ask-context">
          <p><strong>Core is the recommended planning case.</strong> Economy and Enhanced show lower- and higher-investment variants around it. The Future-Proofed Employability & Experiential Infrastructure area is currently protected across all three options rather than arbitrarily flexed before an explicit alternative workforce model has been designed. <a href="#options">See the alternative options below</a> for the practical effect of flexing the remaining levers.</p>
          <p className="ds-subtle investment-boundary">The headline table uses in-year planning budgets across the fixed 2026/27 to 2028/29 investment window. For 2.2.2, the international G6 is modelled from October 2026, the East Asia G5 and Global Mobility G6 from January 2027, later September starts at ten months and January 2029 starts at six months. The full operating model is live by June 2029 with a £714.058k annualised exit run-rate. Exact payroll and on-costs remain subject to Finance/HR validation. The Digital Student Experience Hub / Digital Front Door remains a separate investment ask.</p>
        </div>
      </section>

      <section id="core" className="investment-section">
        <div className="ds-stack investment-section-heading">
          <p className="eyebrow">Investment case</p>
          <h2 className="ds-section-heading">What implementation brings to the institution</h2>
          <p><strong>Investing in King’s Edge moves purpose and graduate futures to the organising core of the student experience.</strong> It connects curriculum, skills, opportunity, employer and external relationships, global experience and wider student life around the individual student, while building the institutional capability to generate experience and support transition at scale. Together, the five current investment areas give King’s a more coherent student experience, a stronger developmental relationship with students, a visible employability and experiential infrastructure, more deliberate use of investment and a clearer account of graduate value.</p>
        </div>

        <div className="ds-table-wrap">
          <table className="ds-table investment-table">
            <thead>
              <tr><th>Investment area and North Star</th><th>What changes for people</th><th>Investment profile</th></tr>
            </thead>
            <tbody>
              {corePackages.map((item) => <tr key={item.title}>
                <td className="investment-package-cell">
                  <h3>{item.title}</h3>
                  <RefLinks ids={item.refs} />
                  <div className="investment-north-star"><span className="ds-sequence-kicker">North Star</span><p>{item.northStar}</p></div>
                  <div className="investment-proposition"><span className="ds-sequence-kicker">What this changes</span><p>{item.proposition}</p></div>
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
          <p className="ds-subtle">The employability and experiential infrastructure area is held constant across the three current scenarios. Any Economy or Enhanced variant for that area should be a deliberately designed alternative service model rather than an arbitrary percentage cut or uplift.</p>
        </div>

        <div className="ds-editorial-grid option-narratives">
          <article className="ds-editorial-card option-card">
            <div><p className="ds-sequence-kicker">Economy</p><h3>Lower cost, narrower implementation.</h3></div>
            <div className="ds-metric-grid option-metrics" aria-label="Economy option figures">
              <div className="ds-metric-card"><span>2026/27</span><strong>£573k</strong></div>
              <div className="ds-metric-card"><span>Three-year in-year budget</span><strong>£3.235m</strong></div>
              <div className="ds-metric-card"><span>Difference from Core</span><strong>£348k less</strong></div>
            </div>
            <div className="option-card-copy">
              <p>Economy keeps the architecture and protects the specified employability and experiential infrastructure, but accepts a more uneven and breadth-first implementation elsewhere with greater dependence on existing institutional capacity.</p>
              <ul className="option-detail-list">
                <li><strong>Beyond Course:</strong> Year 1 commissioning reduces to £100k rather than £150k. Indicative Year 1 reach falls to around 1,600–1,900 students.</li>
                <li><strong>Curriculum, purpose and skills:</strong> King’s still gets the common experiential-learning model and core discovery, but across fewer contexts.</li>
                <li><strong>Employability and experiential infrastructure:</strong> urgent international continuity, early Global Mobility development, the UK opportunity-development team and Graduate Transitions capability remain protected at the Core planning level.</li>
                <li><strong>Participation:</strong> fewer Student Life prototypes and lower direct activation investment mean more reliance on local teams.</li>
                <li><strong>Graduate Futures:</strong> the evidence engine remains, but activity concentrates on intelligence and targeted interventions.</li>
              </ul>
            </div>
          </article>

          <article className="ds-editorial-card option-card">
            <div><p className="ds-sequence-kicker">Enhanced</p><h3>Higher cost, wider and faster implementation.</h3></div>
            <div className="ds-metric-grid option-metrics" aria-label="Enhanced option figures">
              <div className="ds-metric-card"><span>2026/27</span><strong>£723k</strong></div>
              <div className="ds-metric-card"><span>Three-year in-year budget</span><strong>£4.396m</strong></div>
              <div className="ds-metric-card"><span>Difference from Core</span><strong>£813k more</strong></div>
            </div>
            <div className="option-card-copy">
              <p>Enhanced buys a materially larger King’s Edge around the protected employability and experiential infrastructure, with more direct opportunity, more implementation support and faster institutional adoption.</p>
              <ul className="option-detail-list">
                <li><strong>Beyond Course:</strong> commissioning rises to £200k, £350k and £500k across the three years.</li>
                <li><strong>Curriculum, purpose and skills:</strong> a wider implementation cohort and broader trailblazer footprint allow faster adoption.</li>
                <li><strong>Employability and experiential infrastructure:</strong> the current rebaseline holds the specified 2.2.2 workforce model constant. A genuinely enhanced variant would require a separate decision about accelerating posts, increasing market coverage or adding operational capacity.</li>
                <li><strong>Participation:</strong> stronger Student Life capacity supports more deliberate responses to participation gaps.</li>
                <li><strong>Graduate Futures:</strong> enough sustained capacity exists to run course improvement, student adoption, outcomes optimisation and external reputation work in parallel.</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section id="early" className="investment-section ds-callout early-section">
        <div className="ds-stack investment-section-heading">
          <p className="eyebrow">Early investment</p>
          <h2 className="ds-section-heading">Pre-Business Case Investment Need</h2>
          <p className="ds-subtle"><strong>£184.153k remains the immediate pre-Business Case investment need.</strong> It combines the existing £100k acceleration bridge with £84.153k of urgent 2026/27 international employability continuity. The additional £28.689k for the Global Mobility G6 is planned from January 2027 within the 2026/27 Core case, rather than being added to the immediate pre-January bridge.</p>
        </div>

        <div className="ds-table-wrap">
          <table className="ds-table early-table">
            <thead><tr><th>Amount</th><th>What we are buying</th><th>What King’s will have from the immediate investment</th><th>Project refs</th></tr></thead>
            <tbody>
              {earlyAsk.flatMap((item) => item.outputs.map((output, outputIndex) => <tr key={`${item.amount}-${outputIndex}`} className={outputIndex === 0 ? 'early-group-start' : undefined}>
                {outputIndex === 0 && <td className="early-amount" rowSpan={item.outputs.length}><strong>{item.amount}</strong></td>}
                {outputIndex === 0 && <td rowSpan={item.outputs.length}><strong>{item.buying}</strong></td>}
                <td>{output.text}</td>
                <td className="early-refs"><RefLinks ids={output.refs} /></td>
              </tr>))}
            </tbody>
          </table>
        </div>
        <p className="ds-subtle early-note">The early release is a timing proposal against the relevant 2026/27 planning assumptions, not an additional layer of programme cost. The £84.153k international line protects already-established activity; the £100k bridge accelerates opportunity, evidence and prototyping work. The January 2027 Global Mobility G6 is a separate in-year mobilisation line within the Core case. Digital Student Experience Hub development remains a separate Digital investment.</p>
        <p className="ds-subtle early-note">This bridge accelerates areas where King’s Edge is already strategically aligned, particularly opportunity growth, international employer engagement and the skills-classification experiment. It should not be read as the full institutional response to Future Jobs.</p>
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
