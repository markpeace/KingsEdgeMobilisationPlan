import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { buildLookups, periodLabel, projects } from './plan-utils.js';
import {
  buildFinancialProfile,
  fundingState,
  isBauLiability,
  resourceGroups,
  valueKind
} from './resource-profile-utils.js';

const h = React.createElement;
const { deliverables } = buildLookups(projects);
const deliverableById = new Map(deliverables.map((deliverable) => [deliverable.id, deliverable]));
const projectById = new Map(projects.map((project) => [project.id, project]));

const categoryLabels = {
  mobilisation: 'Mobilisation and establishment',
  'central-support': 'Portfolio leadership and coordination',
  'convenor-capacity': 'Convenor capacity',
  'project-capacity': 'Project capacity',
  'community-activity': 'Community activity',
  'project-direct-costs': 'Project direct costs',
  other: 'Other investment'
};

function formatMoney(amount, currency = 'GBP') {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return null;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

function formatFte(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return `${new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 }).format(value)} FTE`;
}

function currentRouteContext() {
  const hash = String(window.location.hash || '');
  const deliverableMatch = hash.match(/#\/deliverables\/([^/?#]+)/);
  if (deliverableMatch) {
    const deliverable = deliverableById.get(decodeURIComponent(deliverableMatch[1]));
    return deliverable ? { type: 'deliverable', item: deliverable } : null;
  }
  const projectMatch = hash.match(/#\/projects\/([^/?#]+)/);
  if (projectMatch) {
    const project = projectById.get(decodeURIComponent(projectMatch[1]));
    return project ? { type: 'project', item: project } : null;
  }
  return null;
}

function stepsForContext(context) {
  if (context.type === 'deliverable') {
    return (context.item.steps || []).map((step) => ({
      ...step,
      contextId: context.item.id,
      contextTitle: context.item.title
    }));
  }
  return (context.item.deliverables || []).flatMap((deliverable) => (deliverable.steps || []).map((step) => ({
    ...step,
    contextId: deliverable.id,
    contextTitle: deliverable.title
  })));
}

function contextSignature(context, steps) {
  return JSON.stringify({
    type: context.type,
    id: context.item.id,
    steps: steps.map((step) => ({ id: step.id, period: step.period, resources: step.resources }))
  });
}

function askName(ask) {
  return ask.label || ask.item || ask.role || ask.condition || 'Resource ask';
}

function askDescription(ask) {
  return ask.rationale || ask.contribution || ask.whatItUnlocks || ask.notes || '';
}

function amountLabel(ask) {
  const money = formatMoney(ask.amount, ask.currency || 'GBP');
  if (money) return isBauLiability(ask) ? `${money} annual recurrent` : money;
  return ask.estimatedCost || ask.additionalCost || 'Value not yet quantified';
}

function statusLabel(state) {
  if (state === 'confirmed') return 'Confirmed or commissioned';
  if (state === 'unresolved') return 'Funding unresolved';
  if (state === 'not-recorded') return 'Funding status not recorded';
  return 'Funding status recorded';
}

function MetricCard({ label, value, note, tone = '' }) {
  return h('article', { className: `resource-metric-card ${tone}`.trim() },
    h('strong', null, value),
    h('span', null, label),
    note ? h('small', null, note) : null
  );
}

function FinancialLegend({ phases }) {
  const used = Object.keys(categoryLabels).filter((category) => phases.some((phase) => phase[category] > 0));
  return h('div', { className: 'resource-financial-legend', 'aria-label': 'Financial categories' },
    ...used.map((category) => h('span', { key: category },
      h('i', { className: `resource-category-swatch resource-category-${category}` }),
      categoryLabels[category]
    ))
  );
}

function FinancialPhasing({ profile }) {
  const maxTotal = Math.max(...profile.phases.map((phase) => phase.total), 1);
  return h('section', { className: 'resource-profile-section resource-phasing-section' },
    h('div', { className: 'resource-section-heading' },
      h('div', null,
        h('h3', null, 'Annual expenditure profile'),
        h('p', null, 'In-year investment is shown once. Annual recurrent commitments continue from their start year. Unknown values remain visible rather than becoming zero.')
      )
    ),
    h(FinancialLegend, { phases: profile.phases }),
    h('div', { className: 'resource-phase-chart' },
      ...profile.phases.map((phase) => {
        const barWidth = phase.total > 0 ? Math.max(4, (phase.total / maxTotal) * 100) : 0;
        const segments = Object.keys(categoryLabels)
          .filter((category) => phase[category] > 0)
          .map((category) => h('span', {
            key: category,
            className: `resource-phase-segment resource-category-${category}`,
            style: { width: `${(phase[category] / phase.total) * 100}%` },
            title: `${categoryLabels[category]}: ${formatMoney(phase[category])}`
          }));
        return h('article', { className: 'resource-phase-row', key: phase.year },
          h('div', { className: 'resource-phase-label' },
            h('strong', null, phase.year),
            h('span', null, phase.total ? formatMoney(phase.total) : 'No quantified cost'),
            phase.unquantified ? h('em', null, `${phase.unquantified} unquantified`) : null
          ),
          h('div', { className: 'resource-phase-track', 'aria-label': `${phase.year}: ${formatMoney(phase.total) || 'no quantified cost'}` },
            h('div', { className: 'resource-phase-bar', style: { width: `${barWidth}%` } }, ...segments),
            phase.total === 0 && phase.unquantified ? h('span', { className: 'resource-phase-unknown' }, 'Unquantified requirement') : null
          ),
          h('div', { className: 'resource-phase-meta' },
            phase.fte ? h('span', null, formatFte(phase.fte)) : h('span', null, 'No new FTE quantified'),
            phase.unresolvedAmount ? h('span', { className: 'resource-funding-warning' }, `${formatMoney(phase.unresolvedAmount)} unresolved`) : h('span', { className: 'resource-funding-confirmed' }, 'No unresolved quantified amount')
          )
        );
      })
    )
  );
}

function CapacityProfile({ profile }) {
  if (!profile.capacityRows.length) return null;
  const maxValue = Math.max(...profile.capacityRows.flatMap((row) => row.values), 1);
  return h('section', { className: 'resource-profile-section resource-capacity-section' },
    h('div', { className: 'resource-section-heading' },
      h('div', null,
        h('h3', null, 'New capacity profile'),
        h('p', null, 'Repeated step references are consolidated into continuing resource families. Existing establishment is listed separately and is not added to new funded FTE.')
      )
    ),
    h('div', { className: 'resource-capacity-table-wrap' },
      h('table', { className: 'resource-capacity-table' },
        h('thead', null,
          h('tr', null,
            h('th', { scope: 'col' }, 'Resource'),
            ...profile.phases.map((phase) => h('th', { scope: 'col', key: phase.year }, phase.year))
          )
        ),
        h('tbody', null,
          ...profile.capacityRows.map((row) => h('tr', { key: row.key },
            h('th', { scope: 'row' }, row.label),
            ...row.values.map((value, index) => h('td', { key: `${row.key}-${index}` },
              value > 0 ? h('span', {
                className: 'resource-capacity-cell',
                style: {
                  backgroundColor: `rgba(23, 107, 155, ${0.18 + (0.72 * (value / maxValue))})`,
                  color: value / maxValue > 0.42 ? '#ffffff' : '#0f4f75'
                }
              }, formatFte(value)) : h('span', { className: 'resource-capacity-empty' }, '—')
            ))
          ))
        )
      )
    )
  );
}

function FundingPanel({ profile }) {
  const exceptions = profile.investmentAsks
    .filter((ask) => fundingState(ask) !== 'confirmed' || typeof ask.amount !== 'number')
    .sort((a, b) => (b.amount || 0) - (a.amount || 0));
  if (!exceptions.length) return null;

  return h('section', { className: 'resource-profile-section resource-funding-section' },
    h('div', { className: 'resource-section-heading' },
      h('div', null,
        h('h3', null, 'Funding and valuation decisions'),
        h('p', null, 'The material asks that remain indicative, unconfirmed or unquantified.')
      ),
      h('span', { className: 'resource-exception-count' }, `${exceptions.length} open ${exceptions.length === 1 ? 'item' : 'items'}`)
    ),
    h('div', { className: 'resource-funding-list' },
      ...exceptions.slice(0, 8).map((ask) => {
        const state = fundingState(ask);
        return h('article', { className: 'resource-funding-item', key: ask.id },
          h('div', { className: 'resource-funding-item-heading' },
            h('strong', null, askName(ask)),
            h('span', { className: `resource-status-badge resource-status-${state}` }, statusLabel(state))
          ),
          h('p', { className: 'resource-funding-value' }, amountLabel(ask)),
          h('p', null, [
            ask.owner ? `Owner: ${ask.owner}` : null,
            ask.decisionNeededBy ? `Decision by: ${ask.decisionNeededBy}` : null,
            ask.fundingRoute ? `Route: ${ask.fundingRoute}` : null,
            ask.confidence ? `Confidence: ${ask.confidence}` : null
          ].filter(Boolean).join(' · ')),
          ask.riskIfMissing ? h('p', { className: 'resource-funding-risk' }, h('strong', null, 'If unresolved: '), ask.riskIfMissing) : null
        );
      })
    ),
    exceptions.length > 8 ? h('p', { className: 'subtle' }, `${exceptions.length - 8} further items are available in the step-level audit below.`) : null
  );
}

function AskCard({ ask, step }) {
  const kind = valueKind(ask);
  const state = fundingState(ask);
  return h('article', { className: `resource-ask-card resource-ask-${ask.askType || 'item'} ${isBauLiability(ask) ? 'is-bau-liability' : ''}`.trim() },
    h('div', { className: 'resource-ask-heading' },
      h('span', { className: 'resource-ask-title-line' },
        h('strong', null, askName(ask)),
        isBauLiability(ask) ? h('em', { className: 'resource-bau-badge' }, 'Annual recurrent') : null,
        kind === 'cash-equivalent' ? h('em', { className: 'resource-value-badge' }, 'Cash-equivalent') : null,
        kind === 'unquantified' ? h('em', { className: 'resource-value-badge resource-value-unquantified' }, 'Unquantified') : null
      ),
      h('span', null, periodLabel(ask.periodNeeded || step.period))
    ),
    askDescription(ask) ? h('p', null, askDescription(ask)) : null,
    h('p', { className: 'resource-ask-meta' }, [
      amountLabel(ask),
      ask.fte ? formatFte(ask.fte) : null,
      ask.owner ? `Owner: ${ask.owner}` : null,
      ask.fundingRoute ? `Funding route: ${ask.fundingRoute}` : null,
      ask.confidence ? `Confidence: ${ask.confidence}` : null
    ].filter(Boolean).join(' · ')),
    ask.askType === 'new-investment' ? h('span', { className: `resource-status-badge resource-status-${state}` }, statusLabel(state)) : null,
    ask.riskIfMissing ? h('p', { className: 'resource-ask-risk' }, h('strong', null, 'If missing: '), ask.riskIfMissing) : null
  );
}

function StepAudit({ steps, contextType }) {
  const visibleSteps = steps.filter((step) => resourceGroups(step).length > 0);
  if (!visibleSteps.length) return null;
  return h('section', { className: 'resource-profile-section resource-audit-section' },
    h('div', { className: 'resource-section-heading' },
      h('div', null,
        h('h3', null, 'Step-level resource audit'),
        h('p', null, 'Every roll-up remains traceable to the authored ask on its delivery step.')
      )
    ),
    h('div', { className: 'resource-step-sequence' },
      ...visibleSteps.map((step) => {
        const groups = resourceGroups(step);
        const count = groups.reduce((total, group) => total + group.items.length, 0);
        return h('details', { className: 'resource-step-group', key: step.id },
          h('summary', null,
            h('span', { className: 'resource-step-period' }, periodLabel(step.period)),
            h('span', { className: 'resource-step-title' },
              h('strong', null, contextType === 'project' ? `${step.contextId} · ${step.title}` : step.title),
              contextType === 'project' ? h('span', null, step.contextTitle) : null
            ),
            h('span', { className: 'resource-step-count' }, `${count} ${count === 1 ? 'ask' : 'asks'}`)
          ),
          h('div', { className: 'resource-step-body' },
            ...groups.map((group) => h('section', { className: `resource-ask-group resource-ask-group-${group.key}`, key: group.key },
              h('h4', null, group.label),
              h('div', { className: 'resource-ask-list' },
                ...group.items.map((ask) => h(AskCard, { ask, step, key: ask.id }))
              )
            ))
          )
        );
      })
    )
  );
}

function ResourceInvestmentProfile({ context, steps }) {
  const [expanded, setExpanded] = useState(false);
  const profile = useMemo(() => buildFinancialProfile(steps), [steps]);
  const summaryTitle = context.type === 'project' ? 'Project resource and investment profile' : 'Resource and investment profile';
  const firstPhase = profile.firstOperatingPhase;
  const fundingResolvedCount = profile.investmentAsks.filter((ask) => fundingState(ask) === 'confirmed').length;

  return h('section', { id: 'resource-investment-profile', className: 'panel resource-investment-profile' },
    h('button', {
      type: 'button',
      className: 'resource-profile-summary',
      'aria-expanded': expanded,
      onClick: () => setExpanded((value) => !value)
    },
      h('span', { className: 'resource-profile-heading' },
        h('strong', null, summaryTitle),
        h('em', null, 'Phased expenditure, recurrent commitment and capacity derived from delivery-step asks.')
      ),
      h('span', { className: 'resource-profile-toggle', 'aria-hidden': 'true' }, expanded ? '−' : '+')
    ),
    expanded ? h('div', { className: 'resource-profile-body' },
      h('p', { className: 'subtle resource-profile-explainer' }, 'The delivery steps remain the source of truth. Figures marked cash-equivalent represent planning valuations of protected capacity and must be replaced by grade-based release, workload-allocation or backfill costs before approval.'),
      h('div', { className: 'resource-profile-summary-grid' },
        h(MetricCard, {
          label: 'Mobilisation and establishment',
          value: formatMoney(profile.mobilisationCost) || 'Not quantified',
          note: 'One-off costs only'
        }),
        h(MetricCard, {
          label: firstPhase ? `First full operating year · ${firstPhase.year}` : 'First operating year',
          value: firstPhase?.total ? formatMoney(firstPhase.total) : 'Not quantified',
          note: firstPhase?.unquantified ? `${firstPhase.unquantified} additional unquantified asks` : 'In-year requirement'
        }),
        h(MetricCard, {
          label: 'Exit annual run-rate',
          value: formatMoney(profile.exitRunRate) || 'Not quantified',
          note: 'Annual recurrent commitment at the end-state',
          tone: 'resource-summary-bau'
        }),
        h(MetricCard, {
          label: 'Peak new funded capacity',
          value: formatFte(profile.peakFte) || 'Not quantified',
          note: 'Maximum concurrent new FTE'
        })
      ),
      h('div', { className: 'resource-profile-quality-line' },
        h('span', null, `${profile.valueKinds.cash} cash asks`),
        h('span', null, `${profile.valueKinds.cashEquivalent} cash-equivalent asks`),
        h('span', null, `${profile.valueKinds.unquantified} unquantified asks`),
        h('span', null, `${fundingResolvedCount}/${profile.investmentAsks.length} investment asks confirmed or commissioned`)
      ),
      h(FinancialPhasing, { profile }),
      h(CapacityProfile, { profile }),
      h(FundingPanel, { profile }),
      profile.existingCapacityAsks.length ? h('section', { className: 'resource-profile-section resource-existing-section' },
        h('div', { className: 'resource-section-heading' },
          h('div', null,
            h('h3', null, 'Existing establishment and contribution'),
            h('p', null, `${profile.existingCapacityAsks.length} existing-capacity asks remain visible but are not treated as new investment or added to funded FTE.`)
          )
        )
      ) : null,
      h(StepAudit, { steps, contextType: context.type })
    ) : null
  );
}

let profileRoot = null;
let mountNode = null;
let mountedSignature = '';
let renderToken = 0;

function clearProfile() {
  if (profileRoot) profileRoot.unmount();
  profileRoot = null;
  mountNode?.remove();
  mountNode = null;
  mountedSignature = '';
}

function targetForContext(context) {
  if (context.type === 'deliverable') return document.getElementById('route-through');
  return document.querySelector('.project-deliverable-panel');
}

function placeMount(context, target) {
  if (!mountNode) {
    mountNode = document.createElement('div');
    mountNode.id = 'resource-investment-profile-root';
  }
  if (context.type === 'deliverable') target.append(mountNode);
  else target.insertAdjacentElement('afterend', mountNode);
  if (!profileRoot) profileRoot = createRoot(mountNode);
}

function renderProfile(attempt = 0, token = renderToken) {
  if (token !== renderToken) return;
  const context = currentRouteContext();
  if (!context) {
    clearProfile();
    return;
  }

  const steps = stepsForContext(context);
  if (!steps.some((step) => resourceGroups(step).length > 0)) {
    clearProfile();
    return;
  }

  const target = targetForContext(context);
  if (!target) {
    if (attempt < 6) window.requestAnimationFrame(() => renderProfile(attempt + 1, token));
    return;
  }

  const signature = contextSignature(context, steps);
  const placementChanged = !mountNode || !mountNode.isConnected || (context.type === 'deliverable' ? mountNode.parentElement !== target : mountNode.previousElementSibling !== target);
  if (placementChanged) {
    if (profileRoot) profileRoot.unmount();
    profileRoot = null;
    mountNode?.remove();
    mountNode = null;
    placeMount(context, target);
  }

  if (mountedSignature === signature) return;
  mountedSignature = signature;
  profileRoot.render(h(ResourceInvestmentProfile, { context, steps }));
}

function scheduleRender() {
  renderToken += 1;
  const token = renderToken;
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => renderProfile(0, token)));
}

window.addEventListener('hashchange', scheduleRender);
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleRender, { once: true });
else scheduleRender();