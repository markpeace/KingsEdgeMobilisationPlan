import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { buildLookups, projects } from './plan-utils.js';
import {
  buildFinancialProfile,
  fundingState,
  isBauLiability,
  resourceGroups
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

  return (context.item.deliverables || []).flatMap((deliverable) =>
    (deliverable.steps || []).map((step) => ({
      ...step,
      contextId: deliverable.id,
      contextTitle: deliverable.title
    }))
  );
}

function contextSignature(context, steps) {
  return JSON.stringify({
    type: context.type,
    id: context.item.id,
    steps: steps.map((step) => ({
      id: step.id,
      period: step.period,
      resources: step.resources
    }))
  });
}

function askName(ask) {
  return ask.label || ask.item || ask.role || ask.condition || 'Resource ask';
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
  const used = Object.keys(categoryLabels)
    .filter((category) => phases.some((phase) => phase[category] > 0));

  return h('div', {
    className: 'resource-financial-legend',
    'aria-label': 'Financial categories'
  }, ...used.map((category) => h('span', { key: category },
    h('i', { className: `resource-category-swatch resource-category-${category}` }),
    categoryLabels[category]
  )));
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
          h('div', {
            className: 'resource-phase-track',
            'aria-label': `${phase.year}: ${formatMoney(phase.total) || 'no quantified cost'}`
          },
            h('div', { className: 'resource-phase-bar', style: { width: `${barWidth}%` } }, ...segments),
            phase.total === 0 && phase.unquantified
              ? h('span', { className: 'resource-phase-unknown' }, 'Unquantified requirement')
              : null
          ),
          h('div', { className: 'resource-phase-meta' },
            phase.fte
              ? h('span', null, formatFte(phase.fte))
              : h('span', null, 'No new FTE quantified'),
            phase.unresolvedAmount
              ? h('span', { className: 'resource-funding-warning' }, `${formatMoney(phase.unresolvedAmount)} unresolved`)
              : h('span', { className: 'resource-funding-confirmed' }, 'No unresolved quantified amount')
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
        h('h3', null, 'New funded capacity'),
        h('p', null, 'New FTE created or funded by the plan. Existing staff capacity that must be committed is surfaced separately below and is not added to this total.')
      )
    ),
    h('div', { className: 'resource-capacity-table-wrap' },
      h('table', { className: 'resource-capacity-table' },
        h('thead', null,
          h('tr', null,
            h('th', { scope: 'col' }, 'Resource'),
            ...profile.phases.map((phase) =>
              h('th', { scope: 'col', key: phase.year }, phase.year)
            )
          )
        ),
        h('tbody', null,
          ...profile.capacityRows.map((row) => h('tr', { key: row.key },
            h('th', { scope: 'row' }, row.label),
            ...row.values.map((value, index) => h('td', { key: `${row.key}-${index}` },
              value > 0
                ? h('span', {
                    className: 'resource-capacity-cell',
                    style: {
                      backgroundColor: `rgba(23, 107, 155, ${0.18 + (0.72 * (value / maxValue))})`,
                      color: value / maxValue > 0.42 ? '#ffffff' : '#0f4f75'
                    }
                  }, formatFte(value))
                : h('span', { className: 'resource-capacity-empty' }, '—')
            ))
          ))
        )
      )
    )
  );
}

function ExistingCapacityItem({ ask, conditional = false }) {
  const fte = formatFte(ask.fte);
  const metadata = [
    ask.owner ? `Owner: ${ask.owner}` : null,
    ask.periodNeeded ? `Period: ${ask.periodNeeded}` : null,
    ask.confidence ? `Confidence: ${ask.confidence}` : null
  ].filter(Boolean).join(' · ');

  return h('article', {
    className: 'resource-funding-item',
    key: `${ask.sourceStep?.contextId || ''}-${ask.id || askName(ask)}`
  },
    h('div', { className: 'resource-funding-item-heading' },
      h('strong', null, askName(ask)),
      h('span', {
        className: `resource-status-badge ${conditional ? 'resource-status-unresolved' : 'resource-status-confirmed'}`
      }, conditional ? 'Conditional capacity' : 'Existing capacity')
    ),
    h('p', { className: 'resource-funding-value' }, fte || 'FTE not yet quantified'),
    metadata ? h('p', null, metadata) : null,
    ask.rationale ? h('p', null, ask.rationale) : null
  );
}

function ExistingCapacityPanel({ profile }) {
  const required = profile.committedExistingCapacityAsks || [];
  const conditional = profile.conditionalExistingCapacityAsks || [];
  const unquantified = profile.unquantifiedExistingCapacityAsks || [];
  if (!required.length && !conditional.length && !unquantified.length) return null;

  return h('section', { className: 'resource-profile-section resource-existing-section' },
    h('div', { className: 'resource-section-heading' },
      h('div', null,
        h('h3', null, 'Existing capacity to commit'),
        h('p', null, 'Existing roles and specialist capacity that the plan relies on. Quantified allocations are surfaced as FTE but are not counted as new funded posts or cash investment.')
      )
    ),
    required.length
      ? h('div', { className: 'resource-funding-list' },
          ...required.map((ask) => h(ExistingCapacityItem, { ask, key: ask.id || askName(ask) }))
        )
      : null,
    conditional.length
      ? h('div', null,
          h('div', { className: 'resource-section-heading' },
            h('div', null,
              h('h3', null, 'Conditional existing capacity'),
              h('p', null, 'Capacity required only if the stated delivery or role assumption cannot be met. It is shown separately and is not added to the committed existing-capacity baseline.')
            )
          ),
          h('div', { className: 'resource-funding-list' },
            ...conditional.map((ask) => h(ExistingCapacityItem, { ask, conditional: true, key: ask.id || askName(ask) }))
          )
        )
      : null,
    unquantified.length
      ? h('div', null,
          h('div', { className: 'resource-section-heading' },
            h('div', null,
              h('h3', null, 'Existing contributions not yet quantified'),
              h('p', null, 'These existing-capacity dependencies remain visible until an FTE, workload allocation or other explicit commitment is agreed.')
            )
          ),
          h('div', { className: 'resource-funding-list' },
            ...unquantified.map((ask) => h(ExistingCapacityItem, { ask, key: ask.id || askName(ask) }))
          )
        )
      : null
  );
}

function FundingPanel({ profile, contextType }) {
  const exceptions = profile.investmentAsks
    .filter((ask) => fundingState(ask) !== 'confirmed' || typeof ask.amount !== 'number')
    .sort((a, b) => (b.amount || 0) - (a.amount || 0));

  if (!exceptions.length) return null;

  const sourceLocation = contextType === 'deliverable'
    ? 'the Delivery timeline step details above'
    : 'the relevant deliverable step details';

  return h('section', { className: 'resource-profile-section resource-funding-section' },
    h('div', { className: 'resource-section-heading' },
      h('div', null,
        h('h3', null, 'Funding and valuation decisions'),
        h('p', null, 'The material asks that remain indicative, unconfirmed or unquantified.')
      ),
      h('span', { className: 'resource-exception-count' },
        `${exceptions.length} open ${exceptions.length === 1 ? 'item' : 'items'}`
      )
    ),
    h('div', { className: 'resource-funding-list' },
      ...exceptions.slice(0, 8).map((ask) => {
        const state = fundingState(ask);
        return h('article', { className: 'resource-funding-item', key: ask.id },
          h('div', { className: 'resource-funding-item-heading' },
            h('strong', null, askName(ask)),
            h('span', { className: `resource-status-badge resource-status-${state}` },
              statusLabel(state)
            )
          ),
          h('p', { className: 'resource-funding-value' }, amountLabel(ask)),
          h('p', null, [
            ask.owner ? `Owner: ${ask.owner}` : null,
            ask.decisionNeededBy ? `Decision by: ${ask.decisionNeededBy}` : null,
            ask.fundingRoute ? `Route: ${ask.fundingRoute}` : null,
            ask.confidence ? `Confidence: ${ask.confidence}` : null
          ].filter(Boolean).join(' · ')),
          ask.riskIfMissing
            ? h('p', { className: 'resource-funding-risk' },
                h('strong', null, 'If unresolved: '),
                ask.riskIfMissing
              )
            : null
        );
      })
    ),
    exceptions.length > 8
      ? h('p', { className: 'subtle' },
          `${exceptions.length - 8} further items remain in ${sourceLocation}.`
        )
      : null
  );
}

function SourceStatement({ steps, profile, contextType }) {
  const sourceSteps = steps.filter((step) => resourceGroups(step).length > 0).length;
  const location = contextType === 'deliverable'
    ? 'Open step detail in the Delivery timeline above to inspect the authored records.'
    : 'Open the relevant deliverable to inspect its authored step records.';

  return h('p', { className: 'subtle resource-profile-source' },
    `Generated at runtime from ${profile.asks.length} resource asks across ${sourceSteps} delivery ${sourceSteps === 1 ? 'step' : 'steps'} in the JSON. ${location}`
  );
}

function ResourceInvestmentProfile({ context, steps }) {
  const [expanded, setExpanded] = useState(false);
  const profile = useMemo(() => buildFinancialProfile(steps), [steps]);
  const summaryTitle = context.type === 'project'
    ? 'Project resource and investment profile'
    : 'Resource and investment profile';
  const firstPhase = profile.firstOperatingPhase;
  const fundingResolvedCount = profile.investmentAsks
    .filter((ask) => fundingState(ask) === 'confirmed').length;
  const existingCapacityValue = profile.existingCapacityFte > 0
    ? formatFte(profile.existingCapacityFte)
    : profile.distinctExistingCapacityAsks.length
      ? 'Not quantified'
      : 'None recorded';
  const existingCapacityNote = profile.conditionalExistingCapacityFte > 0
    ? `Plus up to ${formatFte(profile.conditionalExistingCapacityFte)} conditional`
    : profile.unquantifiedExistingCapacityAsks.length
      ? `${profile.unquantifiedExistingCapacityAsks.length} further unquantified ${profile.unquantifiedExistingCapacityAsks.length === 1 ? 'ask' : 'asks'}`
      : 'Existing roles to be committed';

  return h('section', {
    id: 'resource-investment-profile',
    className: 'panel resource-investment-profile'
  },
    h('button', {
      type: 'button',
      className: 'resource-profile-summary',
      'aria-expanded': expanded,
      onClick: () => setExpanded((value) => !value)
    },
      h('span', { className: 'resource-profile-heading' },
        h('strong', null, summaryTitle),
        h('em', null, 'Phased expenditure, new funded capacity and existing institutional capacity derived from delivery-step asks.')
      ),
      h('span', { className: 'resource-profile-toggle', 'aria-hidden': 'true' },
        expanded ? '−' : '+'
      )
    ),
    expanded ? h('div', { className: 'resource-profile-body' },
      h('p', { className: 'subtle resource-profile-explainer' },
        'The delivery steps remain the source of truth. New funded FTE and existing institutional capacity are shown separately so an existing-role commitment cannot disappear inside the delivery narrative or be mistaken for new investment. Conditional capacity is excluded from the committed baseline until its trigger applies.'
      ),
      h('div', { className: 'resource-profile-summary-grid' },
        h(MetricCard, {
          label: 'Mobilisation and establishment',
          value: formatMoney(profile.mobilisationCost) || 'Not quantified',
          note: 'One-off costs only'
        }),
        h(MetricCard, {
          label: firstPhase
            ? `First full operating year · ${firstPhase.year}`
            : 'First operating year',
          value: firstPhase?.total ? formatMoney(firstPhase.total) : 'Not quantified',
          note: firstPhase?.unquantified
            ? `${firstPhase.unquantified} additional unquantified asks`
            : 'In-year requirement'
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
        }),
        h(MetricCard, {
          label: 'Existing capacity required',
          value: existingCapacityValue,
          note: existingCapacityNote,
          tone: 'resource-summary-existing'
        })
      ),
      h('div', { className: 'resource-profile-quality-line' },
        h('span', null, `${profile.valueKinds.cash} cash asks`),
        h('span', null, `${profile.valueKinds.cashEquivalent} cash-equivalent asks`),
        h('span', null, `${profile.valueKinds.unquantified} unquantified investment asks`),
        h('span', null, `${profile.distinctExistingCapacityAsks.length} existing-capacity ${profile.distinctExistingCapacityAsks.length === 1 ? 'ask' : 'asks'}`),
        h('span', null,
          `${fundingResolvedCount}/${profile.investmentAsks.length} investment asks confirmed or commissioned`
        )
      ),
      h(FinancialPhasing, { profile }),
      h(CapacityProfile, { profile }),
      h(ExistingCapacityPanel, { profile }),
      h(FundingPanel, { profile, contextType: context.type }),
      h(SourceStatement, { steps, profile, contextType: context.type })
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
  if (context.type === 'deliverable') return document.getElementById('governance');
  return document.querySelector('.project-deliverable-panel');
}

function correctlyPlaced(context, target) {
  if (!mountNode?.isConnected) return false;
  if (context.type === 'deliverable') {
    return mountNode.parentElement === target.parentElement
      && mountNode.nextElementSibling === target;
  }
  return mountNode.previousElementSibling === target;
}

function placeMount(context, target) {
  if (!mountNode) {
    mountNode = document.createElement('div');
    mountNode.id = 'resource-investment-profile-root';
  }

  if (context.type === 'deliverable') {
    const timeline = document.getElementById('route-through');
    const timelineOrder = timeline ? window.getComputedStyle(timeline).order : '4';
    mountNode.style.order = timelineOrder === 'auto' ? '4' : timelineOrder;
    target.insertAdjacentElement('beforebegin', mountNode);
  } else {
    mountNode.style.removeProperty('order');
    target.insertAdjacentElement('afterend', mountNode);
  }

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
    if (attempt < 10) {
      window.requestAnimationFrame(() => renderProfile(attempt + 1, token));
    }
    return;
  }

  const signature = contextSignature(context, steps);
  if (!correctlyPlaced(context, target)) {
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
  window.requestAnimationFrame(() =>
    window.requestAnimationFrame(() => renderProfile(0, token))
  );
}

window.addEventListener('hashchange', scheduleRender);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleRender, { once: true });
} else {
  scheduleRender();
}
