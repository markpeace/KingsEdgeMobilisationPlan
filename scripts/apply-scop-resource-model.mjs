import fs from 'node:fs';

const stepsPath = new URL('../src/data/deliverables/1.4.2/steps.json', import.meta.url);
const overviewPath = new URL('../src/data/deliverables/1.4.2/overview.json', import.meta.url);
const testPath = new URL('../tests/resource-profile-json-integration.test.mjs', import.meta.url);

const document = JSON.parse(fs.readFileSync(stepsPath, 'utf8'));
const overview = JSON.parse(fs.readFileSync(overviewPath, 'utf8'));

function step(id) {
  const value = document.steps.find((candidate) => candidate.id === id);
  if (!value) throw new Error(`Missing ${id}`);
  value.resources ||= {};
  value.resources.existingCapacity ||= [];
  value.resources.newInvestment ||= [];
  value.resources.enablingConditions ||= [];
  value.outputs ||= [];
  value.risks ||= [];
  return value;
}

function upsertById(items, item) {
  const index = items.findIndex((candidate) => candidate.id === item.id);
  if (index >= 0) items[index] = item;
  else items.push(item);
}

function replaceStrings(value, replacements) {
  if (typeof value === 'string') {
    return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
  }
  if (Array.isArray(value)) return value.map((item) => replaceStrings(item, replacements));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceStrings(item, replacements)]));
  }
  return value;
}

const earlyCycleReplacements = [
  [/five funded projects per community/gi, 'up to 10 projects across the three-community portfolio'],
  [/five projects per community/gi, 'up to 10 projects across the three-community portfolio'],
  [/approximately five projects across the portfolio/gi, 'up to 10 projects across the three-community portfolio'],
  [/15 practice-based projects/gi, 'up to 10 practice-based projects'],
  [/fifteen practice-based projects/gi, 'up to ten practice-based projects'],
  [/15 funded projects/gi, 'up to 10 funded projects'],
  [/15 projects/gi, 'up to 10 projects'],
  [/1\.5 FTE/gi, '800 funded project hours'],
  [/0\.5 FTE/gi, '800 funded project hours'],
  [/£150,000/gi, '£32,000 planning value'],
  [/£30,000 of convenor/gi, '£14,400 planning value of convenor'],
  [/£15,000/gi, '£10,000'],
  [/£249,000/gi, '£110,400 total resource value, including £22,000 additional cash'],
  [/funded convenors/gi, 'appointed convenors'],
  [/funded convenor/gi, 'appointed convenor']
];

const matureCycleReplacements = [
  [/five funded projects per community/gi, 'up to 20 projects across the six-community portfolio'],
  [/five projects per community/gi, 'up to 20 projects across the six-community portfolio'],
  [/approximately five projects across retained communities/gi, 'up to 20 projects across retained communities'],
  [/approximately five projects across the portfolio/gi, 'up to 20 projects across the six-community portfolio'],
  [/30 practice-based projects/gi, 'up to 20 practice-based projects'],
  [/thirty practice-based projects/gi, 'up to twenty practice-based projects'],
  [/30 funded projects/gi, 'up to 20 funded projects'],
  [/30 projects/gi, 'up to 20 projects'],
  [/3\.0 FTE/gi, '1,600 funded project hours'],
  [/0\.6 FTE of convenor/gi, '720 funded convenor hours'],
  [/0\.5 FTE/gi, '1,600 funded project hours'],
  [/£300,000/gi, '£64,000'],
  [/£60,000 of convenor/gi, '£28,800 of convenor'],
  [/£30,000 of direct project/gi, '£20,000 of direct project'],
  [/£30,000 direct project/gi, '£20,000 direct project'],
  [/£498,000/gi, '£220,800'],
  [/0\.2 FTE Portfolio Lead and 0\.4 FTE Portfolio Coordinator/gi, '0.4 FTE Portfolio Lead and 0.8 FTE Portfolio Coordinator'],
  [/0\.2 FTE lead and 0\.4 FTE coordinator/gi, '0.4 FTE lead and 0.8 FTE coordinator']
];

// Replace the scattered historic cash assumptions with one canonical phased model.
for (const item of document.steps) {
  item.resources ||= {};
  item.resources.existingCapacity ||= [];
  item.resources.newInvestment = [];
  item.resources.enablingConditions ||= [];
  item.resources.existingCapacity = item.resources.existingCapacity.filter(
    (ask) => !String(ask.id || '').startsWith('scop-resource-model-')
  );
  item.resources.enablingConditions = item.resources.enablingConditions.filter(
    (ask) => !String(ask.id || '').startsWith('scop-resource-model-')
  );
}

const step1 = step('1.4.2-step-1');
step1.resources.newInvestment.push({
  id: 'scop-resource-model-unconference',
  item: 'Experiential Learning Unconference catering and delivery',
  category: 'mobilisation event delivery',
  amount: 2000,
  currency: 'GBP',
  fundingRoute: 'TBC',
  fundingStatus: 'unconfirmed',
  owner: 'Mark Peace',
  periodNeeded: 'September 2026',
  decisionNeededBy: 'Before catering and event commitments are made',
  confidence: 'indicative',
  rationale: 'Provides the direct event-delivery envelope for the prototype community launch. Staff planning and coordination are absorbed within existing King’s Academy and institutional capacity.',
  riskIfMissing: 'The launch can proceed at reduced scale, but the participant experience and community-forming value would be weakened.'
});

const step2 = step('1.4.2-step-2');
step2.summary += ' The phased resource principle is that mobilisation and the first supported three-community cycle are absorbed within existing King’s Academy staffing and institutional workload arrangements. Additional central backfill begins only if the portfolio expands to six communities. Convenor and project capacity is then expressed as explicit hour envelopes rather than a blanket FTE proxy.';
upsertById(step2.resources.existingCapacity, {
  id: 'scop-resource-model-absorbed-central-capacity',
  role: 'King’s Academy portfolio leadership, coordination and mobilisation support',
  owner: 'King’s Academy',
  contribution: 'Absorb portfolio leadership, coordination and project-management requirements through mobilisation and the first supported three-community cycle. The planning equivalent is £28,000 during mobilisation and £42,000 during the first cycle, but these values are not treated as additional cash or funded backfill.',
  confidence: 'developing',
  riskIfMissing: 'The early model would require a separate staffing request or a reduction in the pace and breadth of mobilisation.'
});
upsertById(step2.resources.enablingConditions, {
  id: 'scop-resource-model-central-capacity-gate',
  condition: 'King’s Academy confirms that portfolio leadership and coordination can be absorbed through mobilisation and the first three-community cycle, and that expansion to six communities will not proceed until funded central backfill is approved.',
  owner: 'King’s Academy with the senior education governance sponsor',
  decisionNeededBy: 'Before the first supported cycle is commissioned, with the mature backfill decision before expansion to six communities',
  confidence: 'developing',
  riskIfMissing: 'The plan could rely on unrecorded goodwill in the early stages or expand before the portfolio has sustainable central capacity.'
});

const ownershipOutput = step2.outputs.find((output) => output.id === '1.4.2-step-2-output-6');
if (ownershipOutput) {
  ownershipOutput.summary = 'A phased ownership model through which King’s Academy absorbs portfolio leadership and coordination during mobilisation and the first three-community cycle, then moves to funded central backfill only if the portfolio expands to six communities.';
  ownershipOutput.acceptanceCriteria = [
    'A named King’s Academy SCoP Portfolio Lead, or an agreed ownership route, is confirmed.',
    'Responsibilities and decision rights are clear across the Portfolio Lead, portfolio coordination, individual convenors, project leads and the Innovation Committee.',
    'King’s Academy confirms how leadership and coordination will be absorbed through mobilisation and the first supported three-community cycle.',
    'The mature six-community model is explicitly gated on approval of 0.4 FTE Portfolio Lead and 0.8 FTE Portfolio Coordinator backfill.',
    'The resource profile distinguishes absorbed capacity, additional cash and mature recurrent backfill.'
  ];
}

const resourcingOutput = step2.outputs.find((output) => output.id === '1.4.2-step-2-output-2');
if (resourcingOutput) {
  resourcingOutput.summary = 'An agreed framework defining the phased resource available to communities, the balance between absorbed capacity, community activity, project delivery and mature backfill, and the purposes for which SCoP funding may be used.';
  resourcingOutput.acceptanceCriteria = [
    'The mobilisation, first-cycle and mature resource envelopes are separately defined.',
    'The first cycle is explicit that King’s Academy staffing, convenor time and project leadership are absorbed rather than centrally backfilled.',
    'The mature model uses a fully loaded £40 hourly replacement-capacity planning rate, 120 annual hours per convenor team and 80 hours for a standard project.',
    'Community and project envelopes are portfolio ceilings rather than automatic entitlements.',
    'Budget ownership, authorisation, monitoring and reporting arrangements are documented.'
  ];
}

const workloadOutput = step2.outputs.find((output) => output.id === '1.4.2-step-2-output-5');
if (workloadOutput) {
  workloadOutput.summary = 'A phased proposition for workload allocation and backfill. During mobilisation and the first supported three-community cycle, King’s Academy staffing and participant capacity are absorbed through existing workload arrangements. If the model expands to six communities, convenor and project capacity may be purchased at a fully loaded replacement-capacity planning rate of £40 per hour, subject to faculty and employment validation.';
  workloadOutput.acceptanceCriteria = [
    'The first-cycle offer states clearly that no central convenor or project-lead backfill is assumed.',
    'Faculties confirm how the first-cycle hours will be recognised within local workload arrangements.',
    'The mature model defines 120 annual hours per convenor team and 80 hours for a standard project, with 40, 80 and 120-hour project tiers.',
    'The £40 rate is validated as a fully loaded replacement-capacity rate and exceptions are explicitly approved and costed.',
    'Shared envelopes do not multiply when communities use co-convenors or projects use multi-person teams.'
  ];
}

const step4 = step('1.4.2-step-4');
step4.summary += ' Each pilot community has a £3,500 activity allowance, giving a total pilot activity envelope of £10,500. Central staffing and informal leadership remain absorbed during this phase.';
step4.resources.newInvestment.push({
  id: 'scop-resource-model-pilot-community-activity',
  item: 'Pilot community activity allowance for three communities',
  category: 'community activity',
  amount: 10500,
  currency: 'GBP',
  fundingRoute: 'TBC',
  fundingStatus: 'unconfirmed',
  owner: 'King’s Academy',
  periodNeeded: 'November 2026 to June 2027',
  decisionNeededBy: 'Before pilot community plans are approved',
  confidence: 'indicative',
  rationale: 'Provides £3,500 per community for purposeful activity, contributors, events, student participation and light-touch development during the pilot period.',
  riskIfMissing: 'The pilots would depend too heavily on goodwill and routine meetings and may not generate enough tangible activity to test the model.'
});
Object.assign(step4, replaceStrings(step4, [
  [/£6,000/gi, '£10,500'],
  [/£2,000 per community/gi, '£3,500 per community'],
  [/2,000 per community/gi, '3,500 per community'],
  [/base community activity allowance of £2,000/gi, 'pilot community activity allowance of £3,500']
]));

const step5 = step('1.4.2-step-5');
step5.title = 'Appoint convenors and commission the first supported project cycle';
step5.summary += ' This first supported cycle uses existing King’s Academy staffing and institutional workload arrangements rather than centrally funded backfill. Across the three communities, the planning ceiling is up to 10 projects. Community and project capacity is recorded as 360 convenor hours and 800 project-lead hours, with only community activity and direct project costs requiring additional cash.';
upsertById(step5.resources.existingCapacity, {
  id: 'scop-resource-model-first-cycle-central-capacity',
  role: 'First-cycle portfolio leadership and coordination',
  owner: 'King’s Academy',
  contribution: 'Provide the equivalent of 0.2 FTE Portfolio Lead and 0.4 FTE portfolio coordination from existing King’s Academy staffing during the first supported three-community cycle.',
  fte: 0.6,
  planningValue: 42000,
  confidence: 'developing',
  riskIfMissing: 'The first cycle would need to reduce the number of communities or projects, or seek separate central staffing funding.'
});
upsertById(step5.resources.existingCapacity, {
  id: 'scop-resource-model-first-cycle-convenor-capacity',
  role: 'First-cycle convenor capacity absorbed through workload arrangements',
  owner: 'Faculties and participating professional-services areas',
  contribution: 'Recognise a shared annual envelope of 120 hours for each of the three convenor teams, giving 360 hours across the portfolio. Co-convenors share rather than multiply the envelope.',
  hours: 360,
  hourlyPlanningRate: 40,
  planningValue: 14400,
  confidence: 'developing',
  riskIfMissing: 'Convenorship would depend on unrecognised discretionary effort and may be inaccessible to colleagues with less flexible workload arrangements.'
});
upsertById(step5.resources.existingCapacity, {
  id: 'scop-resource-model-first-cycle-project-capacity',
  role: 'First-cycle project leadership absorbed through workload arrangements',
  owner: 'Faculties and participating professional-services areas',
  contribution: 'Recognise up to 800 project-lead hours across a portfolio ceiling of 10 projects, using an 80-hour standard project envelope shared by each project team.',
  hours: 800,
  hourlyPlanningRate: 40,
  planningValue: 32000,
  confidence: 'developing',
  riskIfMissing: 'Projects may be commissioned without the practical space required to complete and evidence them.'
});
step5.resources.newInvestment.push(
  {
    id: 'scop-resource-model-first-cycle-community-activity',
    item: 'First-cycle community activity allowances',
    category: 'community activity',
    amount: 12000,
    currency: 'GBP',
    fundingRoute: 'TBC',
    fundingStatus: 'unconfirmed',
    owner: 'King’s Academy',
    periodNeeded: 'September 2027 to August 2028',
    decisionNeededBy: 'Before first-cycle community plans are approved',
    confidence: 'indicative',
    rationale: 'Provides £4,000 per community for a visible annual programme of activity across the first three communities.',
    riskIfMissing: 'Communities may have recognised leadership but insufficient means to convene, engage and produce tangible outputs.'
  },
  {
    id: 'scop-resource-model-first-cycle-project-direct-costs',
    item: 'Direct project delivery funding for up to 10 projects',
    category: 'project direct costs',
    amount: 10000,
    currency: 'GBP',
    fundingRoute: 'TBC',
    fundingStatus: 'unconfirmed',
    owner: 'King’s Academy',
    periodNeeded: 'September 2027 to August 2028',
    decisionNeededBy: 'Before the first project call is launched',
    confidence: 'indicative',
    rationale: 'Provides up to £1,000 per project for direct delivery requirements. Awards may be lower and the portfolio ceiling is not an entitlement to 10 awards.',
    riskIfMissing: 'Project teams may have recognised time but no means to meet direct delivery, participation, materials or dissemination costs.'
  }
);
step5.risks.push({
  id: 'scop-resource-model-first-cycle-equity-risk',
  title: 'Absorbed capacity limits equitable access during the first cycle',
  description: 'The first supported cycle does not provide centrally funded convenor or project-lead backfill. Participation may therefore remain easier for colleagues whose local workload arrangements are more flexible.',
  mitigation: 'Require explicit faculty workload recognition, use shared leadership and project teams, monitor who can take up the opportunities, and do not expand to six communities until funded replacement capacity is approved.'
});
Object.assign(step5, replaceStrings(step5, earlyCycleReplacements));

for (const id of ['1.4.2-step-6', '1.4.2-step-7']) {
  const item = step(id);
  Object.assign(item, replaceStrings(item, earlyCycleReplacements));
}

const step8 = step('1.4.2-step-8');
step8.summary += ' Expansion to six communities is the point at which paid backfill begins. The mature annual ceiling is six communities and up to 20 projects, supported by 0.4 FTE Portfolio Lead, 0.8 FTE Portfolio Coordinator, 720 convenor hours and 1,600 project hours. Convenor and project hours are valued at a fully loaded £40 replacement-capacity planning rate.';
step8.resources.newInvestment.push(
  {
    id: 'scop-resource-model-mature-portfolio-lead',
    item: 'Mature King’s Academy SCoP Portfolio Lead backfill',
    category: 'permanent portfolio leadership',
    amount: 40000,
    currency: 'GBP',
    fte: 0.4,
    bauLiability: true,
    fundingRoute: 'TBC',
    fundingStatus: 'unconfirmed',
    owner: 'King’s Academy',
    periodNeeded: 'From September 2028 onward',
    decisionNeededBy: 'Before approval to expand to six communities',
    confidence: 'indicative',
    rationale: 'Provides 0.4 FTE of funded portfolio leadership only when the model expands to six communities.',
    riskIfMissing: 'The mature portfolio would rely on absorbed leadership capacity beyond the agreed pilot and first-cycle period.'
  },
  {
    id: 'scop-resource-model-mature-portfolio-coordinator',
    item: 'Mature King’s Academy SCoP Portfolio Coordinator backfill',
    category: 'permanent portfolio administration',
    amount: 44000,
    currency: 'GBP',
    fte: 0.8,
    bauLiability: true,
    fundingRoute: 'TBC',
    fundingStatus: 'unconfirmed',
    owner: 'King’s Academy',
    periodNeeded: 'From September 2028 onward',
    decisionNeededBy: 'Before approval to expand to six communities',
    confidence: 'indicative',
    rationale: 'Provides 0.8 FTE of funded coordination and administration for the six-community portfolio and annual project cycle.',
    riskIfMissing: 'Calls, onboarding, financial control, evidence and annual review would not be sustainable at mature scale.'
  },
  {
    id: 'scop-resource-model-mature-convenor-capacity',
    item: 'Annual community convenor replacement-capacity envelope',
    category: 'convenor capacity',
    amount: 28800,
    currency: 'GBP',
    hours: 720,
    hourlyPlanningRate: 40,
    bauLiability: true,
    fundingRoute: 'TBC',
    fundingStatus: 'unconfirmed',
    owner: 'King’s Academy with faculties',
    periodNeeded: 'From September 2028 onward',
    decisionNeededBy: 'Before mature convenor appointments are confirmed',
    confidence: 'indicative',
    rationale: 'Provides a shared 120-hour annual envelope for each of six convenor teams, valued at a fully loaded £40 per hour replacement-capacity rate. Co-convenors share rather than multiply each community envelope.',
    riskIfMissing: 'Convenorship would continue to depend on discretionary time despite the portfolio moving beyond its absorbed-capacity phase.'
  },
  {
    id: 'scop-resource-model-mature-project-capacity',
    item: 'Annual practice-based project replacement-capacity envelope',
    category: 'project capacity',
    amount: 64000,
    currency: 'GBP',
    hours: 1600,
    hourlyPlanningRate: 40,
    bauLiability: true,
    fundingRoute: 'TBC',
    fundingStatus: 'unconfirmed',
    owner: 'King’s Academy with faculties',
    periodNeeded: 'From September 2028 onward',
    decisionNeededBy: 'Before the mature annual project call is launched',
    confidence: 'indicative',
    rationale: 'Provides an average 80-hour shared envelope for up to 20 projects at a fully loaded £40 per hour replacement-capacity rate. Individual awards may use 40, 80 or 120-hour tiers within the fixed portfolio envelope.',
    riskIfMissing: 'The mature project portfolio would commission work without consistently creating the capacity required to deliver it.'
  },
  {
    id: 'scop-resource-model-mature-community-activity',
    item: 'Annual community activity allowances for six communities',
    category: 'community activity',
    amount: 24000,
    currency: 'GBP',
    bauLiability: true,
    fundingRoute: 'TBC',
    fundingStatus: 'unconfirmed',
    owner: 'King’s Academy',
    periodNeeded: 'From September 2028 onward',
    decisionNeededBy: 'Before six-community plans are approved',
    confidence: 'indicative',
    rationale: 'Provides £4,000 per community for purposeful annual activity at mature scale.',
    riskIfMissing: 'Communities may have funded leadership but insufficient means to maintain accessible and productive programmes.'
  },
  {
    id: 'scop-resource-model-mature-project-direct-costs',
    item: 'Annual direct project delivery funding for up to 20 projects',
    category: 'project direct costs',
    amount: 20000,
    currency: 'GBP',
    bauLiability: true,
    fundingRoute: 'TBC',
    fundingStatus: 'unconfirmed',
    owner: 'King’s Academy',
    periodNeeded: 'From September 2028 onward',
    decisionNeededBy: 'Before the mature annual project call is launched',
    confidence: 'indicative',
    rationale: 'Provides up to £1,000 per project for direct delivery requirements within a portfolio ceiling of 20 projects.',
    riskIfMissing: 'Projects may have replacement capacity but lack modest direct delivery funding.'
  }
);

for (const id of ['1.4.2-step-8', '1.4.2-step-9', '1.4.2-step-10', '1.4.2-step-11', '1.4.2-step-12', '1.4.2-step-13']) {
  const item = step(id);
  Object.assign(item, replaceStrings(item, matureCycleReplacements));
}

// The top-level model makes the cost logic inspectable without reconstructing it from individual asks.
document.resourceModel = {
  status: 'working planning model',
  currency: 'GBP',
  principles: [
    'Mobilisation and the first supported three-community cycle use existing King’s Academy staffing and institutional workload capacity. No additional central staffing, convenor backfill or project-lead backfill is assumed during these stages.',
    'Additional cash during mobilisation and the first cycle is focused on community activity and direct project costs.',
    'Paid central, convenor and project replacement capacity begins only if the portfolio expands to six communities.',
    'Convenor and project capacity is defined in hours and valued at a fully loaded £40 per hour replacement-capacity planning rate rather than a blanket 0.1 FTE proxy.',
    'Community and project numbers are planning ceilings and not automatic entitlements.'
  ],
  replacementCapacity: {
    hourlyPlanningRate: 40,
    rateDescription: 'Fully loaded planning rate for creating capacity through GTA, teaching-assistant, marking or comparable replacement arrangements. It is not a valuation of the participating academic’s salary.',
    convenorHoursPerCommunityTeam: 120,
    standardProjectHours: 80,
    projectHourTiers: [40, 80, 120],
    sharedEnvelopeRule: 'Co-convenors and multi-person project teams share the approved envelope rather than multiplying it.'
  },
  phases: [
    {
      id: 'mobilisation',
      communities: 3,
      projectCeiling: 0,
      absorbedCapacityPlanningValue: 28000,
      additionalCash: 12500,
      totalResourceValue: 40500,
      components: {
        unconference: 2000,
        pilotCommunityActivity: 10500,
        pilotCommunityActivityPerCommunity: 3500
      }
    },
    {
      id: 'first-supported-cycle',
      communities: 3,
      projectCeiling: 10,
      absorbedCapacityPlanningValue: 88400,
      additionalCash: 22000,
      totalResourceValue: 110400,
      components: {
        centralPortfolioCapacityPlanningValue: 42000,
        convenorHours: 360,
        convenorCapacityPlanningValue: 14400,
        projectHours: 800,
        projectCapacityPlanningValue: 32000,
        communityActivity: 12000,
        projectDirectCosts: 10000
      }
    },
    {
      id: 'mature-six-community-model',
      communities: 6,
      projectCeiling: 20,
      absorbedCapacityPlanningValue: 0,
      additionalCash: 220800,
      totalResourceValue: 220800,
      annualRecurrent: true,
      components: {
        portfolioLead: 40000,
        portfolioCoordinator: 44000,
        convenorCapacity: 28800,
        projectCapacity: 64000,
        communityActivity: 24000,
        projectDirectCosts: 20000
      }
    }
  ],
  controls: [
    'Validate that £40 is fully loaded for the chosen replacement route before approval.',
    'Faculties must confirm how absorbed first-cycle hours are recognised within workload arrangements.',
    'Higher-cost exceptions must be explicit, approved and separately costed.',
    'Expansion to six communities is conditional on approval of the mature recurrent resource envelope.',
    'Project allocations may vary between 40, 80 and 120 hours while remaining within the fixed annual portfolio ceiling.'
  ]
};

const resourceParagraph = 'Resourcing is deliberately phased. Mobilisation and the first supported three-community cycle are intended to be absorbed within existing King’s Academy staffing and institutional workload arrangements, with additional cash focused on community activity and direct project costs. Paid backfill starts only if the model expands to six communities. At that point, convenor and project capacity is planned in hours at a fully loaded replacement rate of £40 per hour: 120 hours per convenor team and 80 hours for a standard project, with 40, 80 and 120-hour project tiers. The mature planning ceiling is six communities and up to 20 projects across the portfolio, rather than a fixed entitlement per community.';
if (!overview.detailSummary.includes(resourceParagraph)) {
  overview.detailSummary += `\n\n${resourceParagraph}`;
}

const auditText = JSON.stringify(document);
const stalePatterns = [
  '£249,000',
  '£498,000',
  '£150,000',
  '£300,000',
  '15 practice-based projects',
  '30 practice-based projects',
  'five projects per community',
  '1.5 FTE',
  '3.0 FTE'
];
for (const pattern of stalePatterns) {
  if (auditText.toLowerCase().includes(pattern.toLowerCase())) {
    throw new Error(`Stale SCoP resource assumption remains: ${pattern}`);
  }
}

const expectedNewInvestmentIds = new Set([
  'scop-resource-model-unconference',
  'scop-resource-model-pilot-community-activity',
  'scop-resource-model-first-cycle-community-activity',
  'scop-resource-model-first-cycle-project-direct-costs',
  'scop-resource-model-mature-portfolio-lead',
  'scop-resource-model-mature-portfolio-coordinator',
  'scop-resource-model-mature-convenor-capacity',
  'scop-resource-model-mature-project-capacity',
  'scop-resource-model-mature-community-activity',
  'scop-resource-model-mature-project-direct-costs'
]);
const actualNewInvestmentIds = document.steps.flatMap((item) => item.resources?.newInvestment || []).map((ask) => ask.id);
if (actualNewInvestmentIds.length !== expectedNewInvestmentIds.size || actualNewInvestmentIds.some((id) => !expectedNewInvestmentIds.has(id))) {
  throw new Error(`Unexpected new-investment model: ${actualNewInvestmentIds.join(', ')}`);
}

fs.writeFileSync(stepsPath, `${JSON.stringify(document)}\n`);
fs.writeFileSync(overviewPath, `${JSON.stringify(overview, null, 2)}\n`);

const integrationTest = `import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildFinancialProfile } from '../src/resource-profile-utils.js';

function addRuntimeAskTypes(authoredSteps) {
  return authoredSteps.map((step) => ({
    ...step,
    resources: {
      ...step.resources,
      existingCapacity: (step.resources?.existingCapacity || []).map((ask) => ({
        ...ask,
        askType: ask.askType || 'existing-capacity'
      })),
      newInvestment: (step.resources?.newInvestment || []).map((ask) => ({
        ...ask,
        askType: ask.askType || 'new-investment'
      })),
      enablingConditions: (step.resources?.enablingConditions || []).map((ask) => ({
        ...ask,
        askType: ask.askType || 'enabling-condition'
      }))
    }
  }));
}

function loadDocument(relativePath) {
  return JSON.parse(readFileSync(new URL(relativePath, import.meta.url), 'utf8'));
}

test('1.4.2 financial profile is generated from the revised authored JSON', () => {
  const document = loadDocument('../src/data/deliverables/1.4.2/steps.json');
  const steps = addRuntimeAskTypes(document.steps || []);
  const profile = buildFinancialProfile(steps);

  assert.ok(steps.length > 0);
  assert.equal(profile.mobilisationCost, 2000);
  assert.equal(profile.phases.find((phase) => phase.year === '2026/27').total, 12500);
  assert.equal(profile.phases.find((phase) => phase.year === '2027/28').total, 22000);
  assert.equal(profile.phases.find((phase) => phase.year === '2028/29').total, 220800);
  assert.equal(profile.knownAnnualBauLiability, 220800);
  assert.equal(profile.exitRunRate, 220800);

  assert.equal(document.resourceModel.phases.find((phase) => phase.id === 'mobilisation').totalResourceValue, 40500);
  assert.equal(document.resourceModel.phases.find((phase) => phase.id === 'first-supported-cycle').totalResourceValue, 110400);
  assert.equal(document.resourceModel.phases.find((phase) => phase.id === 'mature-six-community-model').totalResourceValue, 220800);
  assert.equal(document.resourceModel.replacementCapacity.hourlyPlanningRate, 40);
  assert.equal(document.resourceModel.replacementCapacity.convenorHoursPerCommunityTeam, 120);
  assert.equal(document.resourceModel.replacementCapacity.standardProjectHours, 80);
});
`;
fs.writeFileSync(testPath, integrationTest);

console.log('Applied revised 1.4.2 resource model.');
