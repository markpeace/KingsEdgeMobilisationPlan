# V1 to V2 investment case: what changes for people

The V1 investment table has 21 people statements across four packages. The V2 page gives each a visible destination in its six project rows. Its `legacyStoryRefs` are stable crosswalk keys; a source story can land in more than one project when V1 combined distinct services. The V1 wording remains available on the original investment page.

| V1 source story | Distinct promise in V1 | V2 location and treatment |
| --- | --- | --- |
| `architecture.student` | Purpose, capabilities, experience, relationships, credible evidence and next move | **2.1** covers purpose, capabilities and evidence; **2.3** covers the sequence of opportunities and transition. |
| `architecture.academic` | Discipline-specific development without generic employability training | **2.1** retains this explicit academic distinction. |
| `architecture.partner` | A simple route for a partner or alumnus to create opportunity | **2.3** retains the clear route and avoidance of disconnected teams. |
| `architecture.international` | Employer relationships, labour-market insight and purposeful global experience in relevant markets | **2.3** restores the international student/graduate perspective explicitly. |
| `architecture.graduate` | Proactive identification and support when transition is difficult | **2.3** retains this distinct graduate promise. |
| `architecture.reputation` | Credible employability proposition beyond rankings or conventional careers service | **2.6** retains the distinction in evidence-backed claims. |
| `architecture.university` | Coherent architecture joining philosophy, experience, relationships and transition | **2.1** establishes the developmental language; **2.3** connects the opportunity and transition infrastructure to it. |
| `curriculum.student` | Apply, test and extend learning through meaningful in/near-course experience | **2.2** restores all three verbs and the in/near-course scope. |
| `curriculum.course-team` | Evidence of weak or uneven provision and practical support | **2.2** retains the evidence-to-action promise. |
| `curriculum.educator` | Tested models and shared support without inventing delivery routes | **2.2** restores the academic/educator perspective. |
| `curriculum.faculty-staff` | Faster implementation through policy, validation and administration | **2.2** restores the faculty and professional-staff perspective. |
| `curriculum.university` | Dependable provision and investment where access is weakest | **2.2** retains the institutional equity and targeting claim. |
| `beyond.student-journey` | Sequence from first participation to deeper projects, mentoring and placements | **2.3** retains the progression through different depths of opportunity. |
| `beyond.inclusive-access` | Participation compatible with commuting, caring, paid work and limited campus time | **2.4** restores these concrete student-life constraints. |
| `beyond.provider` | Provider response to who is missing, drop-off and weak value | **2.4** restores the full feedback loop. |
| `beyond.university` | Commission supply and depth where evidence shows need | **2.3** owns commissioning; **2.4** feeds participation and inclusion evidence into it. |
| `graduate.student` | Use a clearer account of course and wider development for decisions, strengths and next steps | **2.5** retains the decision and development account; **2.1** connects it to recognition; **2.6** supports articulation through examples. |
| `graduate.course-team` | Act early on evidence and test whether changes improve experience | **2.5** retains both the early action and test of effect. |
| `graduate.faculty-leader` | Target attention and resources to programmes and cohorts of greatest need/opportunity | **2.5** retains the targeting decision. |
| `graduate.reputation` | Defensible claims using evidence and examples | **2.6** retains the external claim and scrutiny test. |
| `graduate.university` | Close the loop among experience, outcomes and educational improvement | **2.5** owns the improvement loop; **2.6** tests the evidence-backed message externally. |

The V2 case distinguishes which project is responsible for each part of a combined V1 statement. This is a narrative crosswalk, separate from the [deliverable and resource preservation crosswalk](v2-remap-crosswalk.md) and the [financial bridge](plan-versioning.md). `npm run validate:data` checks that every one of the 21 V1 story keys has at least one V2 destination.
