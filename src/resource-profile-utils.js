const FINANCIAL_CATEGORIES = [
  'mobilisation',
  'central-support',
  'convenor-capacity',
  'project-capacity',
  'community-activity',
  'project-direct-costs',
  'other'
];

export function isBauLiability(ask) {
  return ask?.bauLiability === true;
}

export function resourceGroups(step) {
  const existingCapacity = step.resources?.existingCapacity || [];
  const newInvestment = step.resources?.newInvestment || [];
  const enablingConditions = step.resources?.enablingConditions || [];

  return [
    {
      key: 'existing-capacity',
      label: 'Existing capacity to align',
      items: existingCapacity
    },
    {
      key: 'new-investment',
      label: 'Time-limited and in-year investment',
      items: newInvestment.filter((ask) => !isBauLiability(ask))
    },
    {
      key: 'bau-liability',
      label: 'Annual recurrent commitments',
      items: newInvestment.filter(isBauLiability)
    },
    {
      key: 'enabling-condition',
      label: 'Enabling conditions',
      items: enablingConditions
    }
  ].filter((group) => group.items.length);
}

export function flattenResourceAsks(steps = []) {
  return steps.flatMap((step, stepIndex) => [
    ...(step.resources?.existingCapacity || []),
    ...(step.resources?.newInvestment || []),
    ...(step.resources?.enablingConditions || [])
  ].map((ask) => ({
    ...ask,
    sourceStep: step,
    sourceStepIndex: stepIndex,
    periodNeeded: ask.periodNeeded || ask.period || step.period
  })));
}

function amountOf(ask) {
  return typeof ask?.amount === 'number' && Number.isFinite(ask.amount) ? ask.amount : null;
}

function fteOf(ask) {
  return typeof ask?.fte === 'number' && Number.isFinite(ask.fte) ? ask.fte : null;
}

function initialPeriodAmountOf(ask) {
  if (typeof ask?.initialPeriodAmount === 'number' && Number.isFinite(ask.initialPeriodAmount)) return ask.initialPeriodAmount;
  const text = [ask?.periodNeeded, ask?.rationale, ask?.estimatedCost]
    .filter((value) => typeof value === 'string')
    .join(' ');
  const patterns = [
    /£\s*([\d,]+)\s+for\s+(?:the\s+)?[^.;]*(?:pilot|initial|first|partial)/i,
    /(?:pilot|initial|first|partial)[^.;]*£\s*([\d,]+)/i
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return Number(match[1].replaceAll(',', ''));
  }
  return null;
}

function amountForYear(ask, year) {
  const annualAmount = amountOf(ask);
  if (annualAmount === null) return null;
  const start = academicYearStart(ask.periodNeeded);
  if (isBauLiability(ask) && year === start) {
    const initialAmount = initialPeriodAmountOf(ask);
    if (typeof initialAmount === 'number' && Number.isFinite(initialAmount)) return initialAmount;
  }
  return annualAmount;
}

export function fundingState(ask) {
  const value = String(ask?.fundingStatus || '').trim().toLowerCase();
  if (!value) return 'not-recorded';
  if (/unconfirmed|indicative|tbc|to be confirmed|developing|not funded|unfunded|pending/.test(value)) return 'unresolved';
  if (/confirmed|approved|funded|commissioned|secured|reserved/.test(value)) return 'confirmed';
  return 'other';
}

export function valueKind(ask) {
  const text = [ask?.item, ask?.label, ask?.role, ask?.category, ask?.estimatedCost, ask?.rationale]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (fteOf(ask) !== null && /cash-equivalent|release|backfill|workload|protected capacity|capacity envelope/.test(text)) {
    return 'cash-equivalent';
  }
  return amountOf(ask) !== null ? 'cash' : 'unquantified';
}

export function financialCategory(ask) {
  const text = [ask?.item, ask?.label, ask?.role, ask?.category, ask?.rationale]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (/mobilisation|unconference|launch|temporary project management|temporary scop mobilisation project manager/.test(text)) return 'mobilisation';
  if (/portfolio lead|portfolio coordinator|project support officer|portfolio administration|portfolio leadership|central support/.test(text)) return 'central-support';
  if (/convenor/.test(text)) return 'convenor-capacity';
  if (/practice-based project|project lead release|project protected-capacity|project capacity|annual project protected/.test(text) && !/direct/.test(text)) return 'project-capacity';
  if (/community activity|community operating|engagement allowance|base activity allowance/.test(text)) return 'community-activity';
  if (/direct delivery|direct project|project delivery funding|project direct-cost/.test(text)) return 'project-direct-costs';
  return 'other';
}

export function resourceKey(ask) {
  const text = [ask?.item, ask?.label, ask?.role, ask?.category]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (/portfolio lead/.test(text)) return 'portfolio-lead';
  if (/portfolio coordinator|project support officer/.test(text)) return 'portfolio-coordinator';
  if (/convenor/.test(text)) return 'community-convenors';
  if (/practice-based project|project lead release|project protected-capacity|project capacity|annual project protected/.test(text)) return 'practice-based-projects';
  if (/mobilisation project manager|temporary project management/.test(text)) return 'mobilisation-project-management';
  return String(ask?.label || ask?.item || ask?.role || ask?.id || 'resource')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function resourceLabel(key, asks = []) {
  const labels = {
    'portfolio-lead': 'Portfolio Lead',
    'portfolio-coordinator': 'Portfolio Coordinator',
    'community-convenors': 'Community convenors',
    'practice-based-projects': 'Practice-based projects',
    'mobilisation-project-management': 'Mobilisation project management'
  };
  return labels[key] || asks[0]?.label || asks[0]?.item || asks[0]?.role || 'Resource';
}

function academicYearStartFromString(value) {
  const text = String(value || '').trim();
  if (!text) return null;

  const lower = text.toLowerCase();
  const explicitAy = lower.match(/(?:ay\s*)?(20\d{2})\s*[\/-]\s*(?:20)?(\d{2})/);
  if (explicitAy) return Number(explicitAy[1]);

  const token = lower.match(/(jan-jun|jul-dec)-(20\d{2})/);
  if (token) return Number(token[2]) - (token[1] === 'jan-jun' ? 1 : 0);

  const nowTo = lower.match(/now-[a-z]+-(20\d{2})/);
  if (nowTo) return Number(nowTo[1]);

  const monthYear = lower.match(/(january|february|march|april|may|june|july|august|september|october|november|december)[^0-9]*(20\d{2})/);
  if (monthYear) {
    const month = monthYear[1];
    const year = Number(monthYear[2]);
    return ['january', 'february', 'march', 'april', 'may', 'june'].includes(month) ? year - 1 : year;
  }

  const year = lower.match(/20\d{2}/);
  return year ? Number(year[0]) : null;
}

export function academicYearStart(period) {
  if (period && typeof period === 'object') {
    return academicYearStart(period.start || period.period || period.id || period.bucket || '');
  }
  return academicYearStartFromString(period);
}

export function academicYearLabel(startYear) {
  return `${startYear}/${String(startYear + 1).slice(-2)}`;
}

function maximumProgrammeYear(steps, asks) {
  const values = [
    ...steps.map((step) => academicYearStart(step.period)),
    ...asks.map((ask) => academicYearStart(ask.periodNeeded))
  ].filter(Number.isFinite);
  return values.length ? Math.max(...values) : new Date().getFullYear();
}

function minimumProgrammeYear(steps, asks) {
  const values = [
    ...steps.map((step) => academicYearStart(step.period)),
    ...asks.map((ask) => academicYearStart(ask.periodNeeded))
  ].filter(Number.isFinite);
  return values.length ? Math.min(...values) : new Date().getFullYear();
}

export function buildFinancialProfile(steps = []) {
  const asks = flattenResourceAsks(steps);
  const investmentAsks = asks.filter((ask) => ask.askType === 'new-investment');
  const existingCapacityAsks = asks.filter((ask) => ask.askType === 'existing-capacity');
  const enablingConditionAsks = asks.filter((ask) => ask.askType === 'enabling-condition');
  const minYear = minimumProgrammeYear(steps, asks);
  const maxYear = maximumProgrammeYear(steps, asks);
  const years = Array.from({ length: Math.max(1, maxYear - minYear + 1) }, (_, index) => minYear + index);

  const phases = years.map((year) => {
    const phase = {
      startYear: year,
      year: academicYearLabel(year),
      total: 0,
      fte: 0,
      unresolvedAmount: 0,
      unquantified: 0
    };
    FINANCIAL_CATEGORIES.forEach((category) => { phase[category] = 0; });

    investmentAsks.forEach((ask) => {
      const start = academicYearStart(ask.periodNeeded);
      if (!Number.isFinite(start)) return;
      const active = isBauLiability(ask) ? year >= start : year === start;
      if (!active) return;

      const amount = amountForYear(ask, year);
      const category = financialCategory(ask);
      if (amount === null) phase.unquantified += 1;
      else {
        phase[category] += amount;
        phase.total += amount;
        if (fundingState(ask) !== 'confirmed') phase.unresolvedAmount += amount;
      }

      const fte = fteOf(ask);
      if (fte !== null) phase.fte += fte;
    });

    return phase;
  });

  const capacityKeys = [...new Set(investmentAsks.filter((ask) => fteOf(ask) !== null).map(resourceKey))];
  const capacityRows = capacityKeys.map((key) => {
    const matching = investmentAsks.filter((ask) => resourceKey(ask) === key);
    return {
      key,
      label: resourceLabel(key, matching),
      values: years.map((year) => matching.reduce((total, ask) => {
        const start = academicYearStart(ask.periodNeeded);
        const active = Number.isFinite(start) && (isBauLiability(ask) ? year >= start : year === start);
        return total + (active ? (fteOf(ask) || 0) : 0);
      }, 0))
    };
  }).filter((row) => row.values.some((value) => value > 0));

  const deliveryInvestmentAsks = investmentAsks.filter((ask) => !isBauLiability(ask));
  const bauLiabilityAsks = investmentAsks.filter(isBauLiability);
  const knownInvestment = deliveryInvestmentAsks.reduce((total, ask) => total + (amountOf(ask) || 0), 0);
  const knownAnnualBauLiability = bauLiabilityAsks.reduce((total, ask) => total + (amountOf(ask) || 0), 0);
  const mobilisationCost = investmentAsks
    .filter((ask) => financialCategory(ask) === 'mobilisation' && !isBauLiability(ask))
    .reduce((total, ask) => total + (amountOf(ask) || 0), 0);
  const firstOperatingPhase = phases.find((phase) => phase.total > mobilisationCost && (phase['convenor-capacity'] > 0 || phase['project-capacity'] > 0)) || phases.find((phase) => phase.total > mobilisationCost) || phases[0];
  const exitRunRate = Math.max(knownAnnualBauLiability, phases.at(-1)?.total || 0);
  const peakFte = phases.reduce((max, phase) => Math.max(max, phase.fte), 0);
  const unresolvedAsks = investmentAsks.filter((ask) => fundingState(ask) !== 'confirmed');
  const unquantifiedInvestmentAsks = investmentAsks.filter((ask) => amountOf(ask) === null);

  return {
    asks,
    investmentAsks,
    existingCapacityAsks,
    enablingConditionAsks,
    deliveryInvestmentAsks,
    bauLiabilityAsks,
    phases,
    capacityRows,
    mobilisationCost,
    firstOperatingPhase,
    exitRunRate,
    peakFte,
    knownInvestment,
    knownAnnualBauLiability,
    unresolvedAsks,
    unquantifiedInvestmentAsks,
    valueKinds: {
      cash: investmentAsks.filter((ask) => valueKind(ask) === 'cash').length,
      cashEquivalent: investmentAsks.filter((ask) => valueKind(ask) === 'cash-equivalent').length,
      unquantified: unquantifiedInvestmentAsks.length
    }
  };
}

export function resourceSummary(steps = []) {
  const profile = buildFinancialProfile(steps);
  return {
    total: profile.asks.length,
    steps: steps.filter((step) => resourceGroups(step).length > 0).length,
    investmentAsks: profile.investmentAsks.length,
    deliveryInvestmentAsks: profile.deliveryInvestmentAsks.length,
    bauLiabilityAsks: profile.bauLiabilityAsks.length,
    enablingConditions: profile.enablingConditionAsks.length,
    capacityAsks: profile.existingCapacityAsks.length,
    knownInvestment: profile.knownInvestment,
    knownAnnualBauLiability: profile.knownAnnualBauLiability,
    unquantifiedInvestmentAsks: profile.unquantifiedInvestmentAsks.length,
    unresolvedInvestmentAsks: profile.unresolvedAsks.length,
    mobilisationCost: profile.mobilisationCost,
    exitRunRate: profile.exitRunRate,
    peakFte: profile.peakFte
  };
}
