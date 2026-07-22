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
      label: 'New delivery investment',
      items: newInvestment.filter((ask) => !isBauLiability(ask))
    },
    {
      key: 'bau-liability',
      label: 'BAU liabilities (annual recurrent)',
      items: newInvestment.filter(isBauLiability)
    },
    {
      key: 'enabling-condition',
      label: 'Enabling conditions',
      items: enablingConditions
    }
  ].filter((group) => group.items.length);
}

export function resourceSummary(steps) {
  const asks = steps.flatMap((step) => [
    ...(step.resources?.existingCapacity || []),
    ...(step.resources?.newInvestment || []),
    ...(step.resources?.enablingConditions || [])
  ]);
  const investmentAsks = asks.filter((ask) => ask.askType === 'new-investment');
  const bauLiabilityAsks = investmentAsks.filter(isBauLiability);
  const deliveryInvestmentAsks = investmentAsks.filter((ask) => !isBauLiability(ask));
  const enablingConditions = asks.filter((ask) => ask.askType === 'enabling-condition');
  const capacityAsks = asks.filter((ask) => ask.askType === 'existing-capacity');
  const knownInvestment = deliveryInvestmentAsks.reduce(
    (total, ask) => total + (typeof ask.amount === 'number' ? ask.amount : 0),
    0
  );
  const knownAnnualBauLiability = bauLiabilityAsks.reduce(
    (total, ask) => total + (typeof ask.amount === 'number' ? ask.amount : 0),
    0
  );

  return {
    total: asks.length,
    steps: steps.length,
    investmentAsks: investmentAsks.length,
    deliveryInvestmentAsks: deliveryInvestmentAsks.length,
    bauLiabilityAsks: bauLiabilityAsks.length,
    enablingConditions: enablingConditions.length,
    capacityAsks: capacityAsks.length,
    knownInvestment,
    knownAnnualBauLiability
  };
}
