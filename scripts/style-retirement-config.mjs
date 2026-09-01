export const retiredProjectSelectorTokens = [
  '.project-detail-hero',
  '.related-project-detail-hero',
  '.transformation-claim-panel',
  '.project-deliverable-panel',
  '.project-deliverable-board',
  '.project-deliverable-columns',
  '.project-deliverable-column',
  '.project-deliverable-header',
  '.project-step-stack',
  '.project-step-card'
];

export const explicitlyRetiredSelectorTokens = [
  '.detail-hero:not(.project-detail-hero)',
  '.detail-summary',
  '.case-grid',
  '.detail-accordion',
  '.detailed-plan-reveal',
  '.route-through-panel',
  '.step-card',
  '.step-card-story',
  '.step-story-block',
  '.step-detail-toggle',
  '.value-evidence-refined',
  '.benefit-',
  '.unmapped-evidence-block',
  '.site-header',
  '.planning-notice',
  '.governance-',
  '.decision-log-',
  '.raid-grid',
  '.raid-column',
  '.measure-summary',
  '.measure-card',
  '.measure-row',
  '.timeline-page',
  '.timeline-controls',
  '.timeline-key',
  '.timeline-refresh',
  '.timeline-modal',
  '.indicative-step-card',
  '.indicative-label',
  '#resource-investment-profile',
  '.resource-investment-profile',
  '.resource-profile-',
  '#risks-decisions .schema-card'
];

/* These generic selectors conflict with migrated consumers but must not retire
   more-specific schema-card variants that still belong to legacy features. */
export const exactlyRetiredSelectors = [
  '.schema-card h3'
];

export const retiredSelectorTokens = [
  ...retiredProjectSelectorTokens,
  ...explicitlyRetiredSelectorTokens
];
