# Plan and investment versions

Version 1 remains the original four-project plan in `src/data/`. Version 2 is the six-project, nineteen-deliverable working plan in `src/data/v2/`. The site header selects both through `?plan=v2`; the default URL remains V1. Switching preserves the page route. The [V2 remap crosswalk](v2-remap-crosswalk.md) accounts for original projects, deliverables, steps, benefits, measures and resource asks.

The Investment ask is part of the main site at `#/investment`, linked from the header and home page. Its own dropdown uses the same version selector, so its links open the corresponding plan. V1 retains the original four-area presentation in `src/investment-case-entry.jsx`; V2 has an independent JSON proposition at `src/data/v2/investment-case.json` and a six-project presentation. The former `investment-case.html` URL redirects to this route and keeps its `?plan` selection.

Both versions use the same page structure and presentation components: option summary, investment-area table with people stories and profiles, service-model comparison, early-investment table and assumptions handover. V2 adds a precise accounting bridge after its six project rows.

The financial baseline lives in `src/data/investment-case.json`, transcribed from the 7 October 2026 [portfolio investment handover](portfolio-investment-packages.md). The V2 JSON reattributes that baseline to five non-overlapping accounting pools for six projects. Insight and Reputation have separate propositions but share one unapportioned Graduate Futures pool. The early £184,153 release is included in the substantive 2026/27 case. No project-specific total is invented for the two projects sharing the pool.

| V2 accounting pool | V1 source | Core, 2026/27 | Core, 2027/28 | Core, 2028/29 | Core total |
| --- | --- | ---: | ---: | ---: | ---: |
| Purpose, Capability and Recognition | Architecture less 2.2.2 | £53,000 | £119,500 | £79,500 | £252,000 |
| Experiential Education and Formal Pathways | Curriculum experiential package | £58,800 | £131,100 | £151,100 | £341,000 |
| Opportunity, Partnerships and Transitions | 2.2.2 infrastructure plus 2.2.4 commissioning | £262,842 | £638,932 | £890,777 | £1,792,551 |
| Student Life and Participation | Beyond-Course package less 2.2.4 commissioning | £128,500 | £151,950 | £151,950 | £432,400 |
| Insight and Reputation, jointly attributed | Graduate Futures package, unsplit | £169,900 | £264,950 | £329,950 | £764,800 |
| **Programme Core** | | **£673,042** | **£1,306,432** | **£1,603,277** | **£3,582,751** |

Economy (£2,903,572) and Enhanced (£4,851,907) reconcile in the same way. The `validate-investment-versions.mjs` check verifies each option, the three Core years, the source decomposition, six project references and early-ask links. `npm run validate:data` also checks the original 106 V1 plan files against their SHA-256 baseline, validates both plans and checks the complete V2 crosswalk.

Open decisions include the allocation of the joint Graduate Futures pool, Finance/HR validation of workforce assumptions and any separate decision on a Student Opportunities Fund award pot. The Digital Student Experience Hub has its own institutional case; £175k per year of Core commissioning from July 2029 is a BAU planning liability, not a fourth mobilisation year.
