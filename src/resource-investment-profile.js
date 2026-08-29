import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { buildLookups, projects } from './plan-utils.js';
import {
  buildFinancialProfile,
  fundingState,
  isBauLiability,
  resourceGroups
} from './resource-profile-utils.js';
import './styles/resource-profile.css';

const h = React.createElement;
const { deliverables } = buildLookups(projects);
const deliverableById = new Map(deliverables.map((deliverable) => [deliverable.id, deliverable]));
const projectById = new Map(projects.map((project) => [project.id, project]));

function formatMoney(amount, currency = 'GBP') {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return null;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

function formatFte(value, prefix = '') {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return `${prefix}${new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 }).format(value)} FTE`;
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

function conciseStatus(state) {
  if (state === 'confirmed') return 'Confirmed';
  if (state === 'unresolved') return 'Needs approval';
  if (state === 'not-recorded') return 'Status not set';
  return 'Status recorded';
}

function MetricCard({ label, value, note, tone = '' }) {
  return h('article', { className: `resource-metric-card ${tone}`.trim() },
    h('strong', null, value),
    h('span', null, label),
    note ? h('small', null, note) : null
  );
}

function SectionHeading({ title, description, aside = null }) {
  return h('div', { className: 'resource-readable-heading' },
    h('div', null,
      h('h3', null, title),
      description ? h('p', null, description) : null
    ),
    aside ? h('strong', { className: 'resource-heading-aside' }, aside) : null
  );
}

function StatusBadge({ ask }) {
  const state = fundingState(ask);
  return h('span', { className: `resource-status-badge resource-status-${state}` }, conciseStatus(state));
}

function FundedPeopleTable({ asks }) {
  if (!asks.length) return null;
  const totalCost = asks.reduce((total, ask) => total + (typeof ask.amount === 'number' ? ask.amount : 0), 0);
  const totalFte = asks.reduce((total, ask) => total + (typeof ask.fte === 'number' ? ask.fte : 0), 0);

  return h('div', { className: 'resource-table-block' },
    h('div', { className: 'resource-subheading' },
      h('div', null,
        h('h4', null, 'New or funded roles'),
        h('p', null, 'Posts created or funded through the plan.')
      ),
      h('strong', null, `${formatFte(totalFte) || 'FTE TBC'} · ${formatMoney(totalCost) || 'cost TBC'}`)
    ),
    h('div', { className: 'resource-readable-table-wrap' },
      h('table', { className: 'resource-readable-table' },
        h('thead', null,
          h('tr', null,
            h('th', { scope: 'col' }, 'Role'),
            h('th', { scope: 'col' }, 'FTE'),
            h('th', { scope: 'col' }, 'Planning cost'),
            h('th', { scope: 'col' }, 'When needed'),
            h('th', { scope: 'col' }, 'Status')
          )
        ),
        h('tbody', null,
          ...asks.map((ask) => h('tr', { key: ask.id || `${ask.sourceStep?.id}-${askName(ask)}` },
            h('th', { scope: 'row' },
              h('strong', null, askName(ask)),
              ask.owner ? h('small', null, ask.owner) : null
            ),
            h('td', { className: 'resource-cell-number' }, formatFte(ask.fte) || 'TBC'),
            h('td', { className: 'resource-cell-money' }, formatMoney(ask.amount, ask.currency || 'GBP') || 'TBC'),
            h('td', null, ask.periodNeeded || 'TBC'),
            h('td', null, h(StatusBadge, { ask }))
          ))
        )
      )
    )
  );
}

function ExistingPeopleTable({ asks, conditional = false, unquantified = false }) {
  if (!asks.length) return null;
  const title = conditional
    ? 'Conditional existing capacity'
    : unquantified
      ? 'Existing contributions not yet quantified'
      : 'Existing roles to commit';
  const description = conditional
    ? 'Only required if the stated trigger applies. This is not included in the committed baseline.'
    : unquantified
      ? 'Important existing-team contributions that still need an explicit workload or FTE agreement.'
      : 'Protected time from existing teams. This is a real delivery commitment, but not new funded headcount.';

  return h('div', { className: `resource-table-block ${conditional ? 'is-conditional' : ''}`.trim() },
    h('div', { className: 'resource-subheading' },
      h('div', null,
        h('h4', null, title),
        h('p', null, description)
      )
    ),
    h('div', { className: 'resource-readable-table-wrap' },
      h('table', { className: 'resource-readable-table resource-existing-table' },
        h('thead', null,
          h('tr', null,
            h('th', { scope: 'col' }, 'Role / contribution'),
            h('th', { scope: 'col' }, conditional ? 'Maximum' : 'Commitment'),
            h('th', { scope: 'col' }, 'When needed'),
            h('th', { scope: 'col' }, 'Owner')
          )
        ),
        h('tbody', null,
          ...asks.map((ask) => h('tr', { key: `${ask.sourceStep?.contextId || ''}-${ask.id || askName(ask)}` },
            h('th', { scope: 'row' }, askName(ask)),
            h('td', { className: 'resource-cell-number' },
              typeof ask.fte === 'number'
                ? formatFte(ask.fte, conditional ? 'Up to ' : '')
                : 'As required'
            ),
            h('td', null, ask.periodNeeded || 'TBC'),
            h('td', null, ask.owner || 'TBC')
          ))
        )
      )
    )
  );
}

function PeopleAndCapacityPanel({ profile }) {
  const fundedPeople = profile.investmentAsks.filter((ask) => typeof ask.fte === 'number');
  const required = profile.committedExistingCapacityAsks || [];
  const conditional = profile.conditionalExistingCapacityAsks || [];
  const unquantified = profile.unquantifiedExistingCapacityAsks || [];
  if (!fundedPeople.length && !required.length && !conditional.length && !unquantified.length) return null;

  return h('section', { className: 'resource-profile-section resource-people-section' },
    h(SectionHeading, {
      title: 'People and capacity',
      description: 'The team the plan funds, plus the existing staff time the institution must genuinely commit.'
    }),
    h(FundedPeopleTable, { asks: fundedPeople }),
    h(ExistingPeopleTable, { asks: required }),
    h(ExistingPeopleTable, { asks: conditional, conditional: true }),
    h(ExistingPeopleTable, { asks: unquantified, unquantified: true })
  );
}

function OtherInvestmentPanel({ profile }) {
  const asks = profile.investmentAsks.filter((ask) => typeof ask.fte !== 'number');
  if (!asks.length) return null;
  const total = asks.reduce((sum, ask) => sum + (typeof ask.amount === 'number' ? ask.amount : 0), 0);

  return h('section', { className: 'resource-profile-section resource-other-investment-section' },
    h(SectionHeading, {
      title: 'Other investment',
      description: 'Cash requirements that are not new posts, such as platforms, tooling, student employment or direct delivery costs.',
      aside: total ? formatMoney(total) : null
    }),
    h('div', { className: 'resource-readable-table-wrap' },
      h('table', { className: 'resource-readable-table' },
        h('thead', null,
          h('tr', null,
            h('th', { scope: 'col' }, 'Investment'),
            h('th', { scope: 'col' }, 'Amount'),
            h('th', { scope: 'col' }, 'When needed'),
            h('th', { scope: 'col' }, 'Status')
          )
        ),
        h('tbody', null,
          ...asks.map((ask) => h('tr', { key: ask.id || `${ask.sourceStep?.id}-${askName(ask)}` },
            h('th', { scope: 'row' },
              h('strong', null, askName(ask)),
              ask.owner ? h('small', null, ask.owner) : null
            ),
            h('td', { className: 'resource-cell-money' },
              typeof ask.amount === 'number'
                ? `${formatMoney(ask.amount, ask.currency || 'GBP')}${isBauLiability(ask) ? ' / year' : ''}`
                : 'TBC'
            ),
            h('td', null, ask.periodNeeded || 'TBC'),
            h('td', null, h(StatusBadge, { ask }))
          ))
        )
      )
    )
  );
}

function FinancialPhasing({ profile }) {
  if (!profile.phases.length) return null;
  return h('section', { className: 'resource-secondary-section' },
    h('h4', null, 'Cost by academic year'),
    h('div', { className: 'resource-readable-table-wrap' },
      h('table', { className: 'resource-readable-table resource-phasing-table' },
        h('thead', null,
          h('tr', null,
            h('th', { scope: 'col' }, 'Academic year'),
            h('th', { scope: 'col' }, 'Quantified spend'),
            h('th', { scope: 'col' }, 'New funded FTE'),
            h('th', { scope: 'col' }, 'Unresolved value')
          )
        ),
        h('tbody', null,
          ...profile.phases.map((phase) => h('tr', { key: phase.year },
            h('th', { scope: 'row' }, phase.year),
            h('td', { className: 'resource-cell-money' }, phase.total ? formatMoney(phase.total) : '—'),
            h('td', { className: 'resource-cell-number' }, phase.fte ? formatFte(phase.fte) : '—'),
            h('td', null, phase.unresolvedAmount ? formatMoney(phase.unresolvedAmount) : '—')
          ))
        )
      )
    )
  );
}

function FundingPanel({ profile }) {
  const exceptions = profile.investmentAsks
    .filter((ask) => fundingState(ask) !== 'confirmed' || typeof ask.amount !== 'number');
  if (!exceptions.length) return null;

  return h('section', { className: 'resource-secondary-section' },
    h('h4', null, 'Funding and valuation decisions still open'),
    h('div', { className: 'resource-decision-list' },
      ...exceptions.map((ask) => h('article', { className: 'resource-decision-item', key: ask.id || askName(ask) },
        h('div', null,
          h('strong', null, askName(ask)),
          h(StatusBadge, { ask })
        ),
        h('p', null, [
          typeof ask.amount === 'number' ? formatMoney(ask.amount, ask.currency || 'GBP') : 'Value TBC',
          ask.decisionNeededBy ? `Decision by ${ask.decisionNeededBy}` : null,
          ask.confidence ? ask.confidence : null
        ].filter(Boolean).join(' · '))
      ))
    )
  );
}

function SourceStatement({ steps, profile, contextType }) {
  const sourceSteps = steps.filter((step) => resourceGroups(step).length > 0).length;
  const location = contextType === 'deliverable'
    ? 'Open the delivery-step detail above for the authored records.'
    : 'Open the relevant deliverable for the authored records.';
  return h('p', { className: 'subtle resource-profile-source' },
    `Derived from ${profile.asks.length} resource asks across ${sourceSteps} delivery ${sourceSteps === 1 ? 'step' : 'steps'}. ${location}`
  );
}

function ResourceInvestmentProfile({ context, steps }) {
  const [expanded, setExpanded] = useState(false);
  const profile = useMemo(() => buildFinancialProfile(steps), [steps]);
  const summaryTitle = context.type === 'project'
    ? 'Project resources and investment'
    : 'Resources and investment';
  const unresolvedCount = profile.investmentAsks.filter((ask) => fundingState(ask) !== 'confirmed').length;
  const cashValue = profile.knownInvestment > 0 ? formatMoney(profile.knownInvestment) : 'Not quantified';
  const cashNote = profile.knownAnnualBauLiability > 0
    ? `Plus ${formatMoney(profile.knownAnnualBauLiability)} annual recurrent`
    : 'Quantified time-limited and in-year spend';
  const existingValue = profile.existingCapacityFte > 0
    ? formatFte(profile.existingCapacityFte)
    : profile.distinctExistingCapacityAsks.length
      ? 'Not quantified'
      : 'None recorded';
  const conditionalValue = profile.conditionalExistingCapacityFte > 0
    ? formatFte(profile.conditionalExistingCapacityFte, 'Up to ')
    : 'None quantified';

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
        h('em', null, 'People, existing capacity and cash needed to deliver the plan.')
      ),
      h('span', { className: 'resource-profile-toggle', 'aria-hidden': 'true' }, expanded ? '−' : '+')
    ),
    expanded ? h('div', { className: 'resource-profile-body resource-readable-body' },
      h('p', { className: 'resource-profile-intro' },
        'Read the plan as three separate commitments: new funded roles, protected capacity from existing teams, and cash or non-staff investment. Conditional capacity is shown separately and is not counted in the baseline.'
      ),
      h('div', { className: 'resource-profile-summary-grid resource-readable-summary' },
        h(MetricCard, {
          label: 'Known cash investment',
          value: cashValue,
          note: cashNote,
          tone: 'resource-summary-cash'
        }),
        h(MetricCard, {
          label: 'New funded capacity',
          value: formatFte(profile.peakFte) || 'Not quantified',
          note: 'Maximum concurrent new FTE',
          tone: 'resource-summary-new'
        }),
        h(MetricCard, {
          label: 'Existing capacity to commit',
          value: existingValue,
          note: 'Protected time from current establishment',
          tone: 'resource-summary-existing'
        }),
        h(MetricCard, {
          label: 'Conditional capacity',
          value: conditionalValue,
          note: 'Only if the stated trigger applies',
          tone: 'resource-summary-conditional'
        })
      ),
      unresolvedCount
        ? h('p', { className: 'resource-attention-line' },
            h('strong', null, `${unresolvedCount} investment ${unresolvedCount === 1 ? 'item still needs' : 'items still need'} approval or validation.`),
            ' The role and investment tables below show exactly which ones.'
          )
        : null,
      h(PeopleAndCapacityPanel, { profile }),
      h(OtherInvestmentPanel, { profile }),
      h('details', { className: 'resource-secondary-detail' },
        h('summary', null,
          h('strong', null, 'More detail'),
          h('span', null, 'Cost phasing, open funding assumptions and source records')
        ),
        h('div', { className: 'resource-secondary-detail-body' },
          h(FinancialPhasing, { profile }),
          h(FundingPanel, { profile }),
          h(SourceStatement, { steps, profile, contextType: context.type })
        )
      )
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
