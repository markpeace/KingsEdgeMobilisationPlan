import React, { useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { buildLookups, projects } from './plan-utils.js';
import {
  amountForAcademicYear,
  buildFinancialProfile,
  fteForAcademicYear,
  fundingState,
  isBauLiability,
  resourceGroups
} from './resource-profile-utils.js';
import './styles/resource-profile.css';
import './styles/resource-profile-fit.css';

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

  return (context.item.deliverables || []).flatMap((deliverable) => {
    const fullDeliverable = deliverableById.get(deliverable.id) || deliverable;
    return (fullDeliverable.steps || []).map((step) => ({
      ...step,
      contextId: fullDeliverable.id,
      contextTitle: fullDeliverable.title
    }));
  });
}

function contextSignature(context, steps) {
  const workforceModels = workforceModelsForContext(context);
  return JSON.stringify({
    type: context.type,
    id: context.item.id,
    workforceModels,
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

function workforceModelsForContext(context) {
  if (context.type === 'deliverable') {
    return context.item.workforceModel ? [context.item.workforceModel] : [];
  }
  return (context.item.deliverables || [])
    .map((deliverable) => deliverableById.get(deliverable.id) || deliverable)
    .map((deliverable) => deliverable.workforceModel)
    .filter(Boolean);
}

function appointmentsForContext(context) {
  return workforceModelsForContext(context).flatMap((model) => model.appointments || []);
}

function appointmentForAsk(ask) {
  const deliverable = deliverableById.get(ask.sourceStep?.contextId);
  const appointments = deliverable?.workforceModel?.appointments || [];
  const byId = ask.id ? appointments.find((appointment) => appointment.resourceId === ask.id) : null;
  if (byId) return byId;
  const name = askName(ask).trim().toLowerCase();
  return appointments.find((appointment) => String(appointment.role || '').trim().toLowerCase() === name) || null;
}

function appointmentBasisLabel(appointment) {
  if (!appointment) return 'Not recorded';
  if (appointment.appointmentBasis === 'permanent') return 'Permanent';
  if (appointment.appointmentBasis === 'placement') return 'Placement';
  if (appointment.appointmentBasis === 'fixed-term') return 'Fixed-term';
  if (appointment.appointmentBasis === 'secondment') return 'Secondment';
  return appointment.appointmentLabel || appointment.appointmentBasis || 'Recorded';
}

function AppointmentCell({ appointment }) {
  const basis = appointment?.appointmentBasis || 'unspecified';
  return h('div', { className: 'resource-appointment-cell' },
    h('span', { className: `resource-appointment-badge is-${basis}` }, appointmentBasisLabel(appointment)),
    appointment?.appointmentLabel && appointment.appointmentLabel !== appointmentBasisLabel(appointment)
      ? h('small', null, appointment.appointmentLabel)
      : null,
    appointment?.fundingBasis ? h('small', null, appointment.fundingBasis) : null,
    appointment?.endState ? h('small', null, appointment.endState) : null
  );
}

function allActiveYears(profile) {
  return profile.activeInvestmentPhases?.length ? profile.activeInvestmentPhases : profile.phases;
}

function deliveryYears(profile) {
  const asks = profile.deliveryInvestmentAsks || profile.investmentAsks.filter((ask) => !isBauLiability(ask));
  return allActiveYears(profile).filter((phase) => asks.some((ask) => {
    const amount = amountForAcademicYear(ask, phase.startYear);
    const fte = fteForAcademicYear(ask, phase.startYear);
    return amount !== null || fte > 0;
  }));
}

function peakDeliveryFte(profile) {
  const asks = profile.deliveryInvestmentAsks || [];
  const years = deliveryYears(profile);
  return years.reduce((peak, year) => Math.max(
    peak,
    asks.reduce((total, ask) => total + fteForAcademicYear(ask, year.startYear), 0)
  ), 0);
}

function permanentAppointments(context) {
  return appointmentsForContext(context).filter((appointment) => appointment.appointmentBasis === 'permanent');
}

function permanentFte(context) {
  return permanentAppointments(context).reduce((total, appointment) => total + (appointment.fte || 0), 0);
}

function permanentAnnualRunRate(context, profile) {
  const appointments = permanentAppointments(context);
  const total = appointments.reduce((sum, appointment) => sum + (appointment.annualBauAmount || 0), 0);
  return total || profile.knownAnnualBauLiability || 0;
}

function nonStaffBauAsks(profile) {
  return (profile.bauLiabilityAsks || []).filter((ask) => !(typeof ask.fte === 'number' && ask.fte > 0));
}

function nonStaffBauAnnual(profile) {
  return nonStaffBauAsks(profile).reduce((total, ask) =>
    total + (typeof ask.amount === 'number' && Number.isFinite(ask.amount) ? ask.amount : 0), 0);
}

function bauOperatingBudget(context, profile) {
  const permanent = permanentAppointments(context);
  if (!permanent.length) return profile.knownAnnualBauLiability || 0;
  return permanentAnnualRunRate(context, profile) + nonStaffBauAnnual(profile);
}

function YearCell({ ask, year, showFte = false }) {
  const amount = amountForAcademicYear(ask, year.startYear);
  const fte = fteForAcademicYear(ask, year.startYear);
  if (amount === null && !fte) return h('span', { className: 'resource-year-empty' }, '—');

  return h('span', { className: 'resource-year-value' },
    amount !== null ? h('strong', null, formatMoney(amount, ask.currency || 'GBP')) : h('strong', null, 'Cost TBC'),
    showFte && fte ? h('small', null, formatFte(fte)) : null
  );
}

function FundedPeopleTable({ profile, asks, title, description, tone = '', showAppointment = false }) {
  if (!asks.length) return null;
  const years = deliveryYears(profile);
  const totalFte = Math.max(...years.map((year) => asks.reduce((total, ask) => total + fteForAcademicYear(ask, year.startYear), 0)), 0);
  const totalCost = years.reduce((grandTotal, year) => grandTotal + asks.reduce((yearTotal, ask) => {
    const amount = amountForAcademicYear(ask, year.startYear);
    return yearTotal + (typeof amount === 'number' ? amount : 0);
  }, 0), 0);

  return h('div', { className: `resource-table-block ${tone}`.trim() },
    h('div', { className: 'resource-subheading' },
      h('div', null,
        h('h4', null, title),
        description ? h('p', null, description) : null
      ),
      h('strong', null, `${formatFte(totalFte) || 'FTE TBC'} · ${formatMoney(totalCost) || 'cost TBC'} profiled`)
    ),
    h('div', { className: 'resource-readable-table-wrap' },
      h('table', { className: 'resource-readable-table resource-multiyear-table resource-workforce-table' },
        h('thead', null,
          h('tr', null,
            h('th', { scope: 'col' }, 'Role'),
            showAppointment ? h('th', { scope: 'col' }, 'Appointment / end-state') : null,
            ...years.map((year) => h('th', { scope: 'col', key: year.year }, year.year)),
            h('th', { scope: 'col' }, 'Funding status')
          )
        ),
        h('tbody', null,
          ...asks.map((ask) => h('tr', { key: ask.id || `${ask.sourceStep?.id}-${askName(ask)}` },
            h('th', { scope: 'row' },
              h('strong', null, askName(ask)),
              ask.owner ? h('small', null, ask.owner) : null,
              ask.periodNeeded ? h('small', null, ask.periodNeeded) : null
            ),
            showAppointment ? h('td', null, h(AppointmentCell, { appointment: appointmentForAsk(ask) })) : null,
            ...years.map((year) => h('td', { key: `${ask.id || askName(ask)}-${year.year}` },
              h(YearCell, { ask, year, showFte: true })
            )),
            h('td', null, h(StatusBadge, { ask }))
          ))
        ),
        h('tfoot', null,
          h('tr', null,
            h('th', { scope: 'row' }, 'Subtotal'),
            showAppointment ? h('td', null, '') : null,
            ...years.map((year) => {
              const yearAmount = asks.reduce((total, ask) => {
                const amount = amountForAcademicYear(ask, year.startYear);
                return total + (typeof amount === 'number' ? amount : 0);
              }, 0);
              const yearFte = asks.reduce((total, ask) => total + fteForAcademicYear(ask, year.startYear), 0);
              return h('td', { key: `total-${title}-${year.year}` },
                yearAmount || yearFte
                  ? h('span', { className: 'resource-year-value' },
                      h('strong', null, yearAmount ? formatMoney(yearAmount) : 'Cost TBC'),
                      yearFte ? h('small', null, formatFte(yearFte)) : null
                    )
                  : '—'
              );
            }),
            h('td', null, '')
          )
        )
      )
    )
  );
}

function ExistingPeopleTable({ asks, conditional = false, unquantified = false }) {
  if (!asks.length) return null;
  const title = conditional
    ? 'Conditional capacity'
    : unquantified
      ? 'On-demand specialist contribution'
      : 'Existing capacity to protect';
  const description = conditional
    ? 'Only required if the stated trigger applies. This is not included in the committed baseline.'
    : unquantified
      ? 'Existing specialist input that is important, but does not warrant a standing FTE allocation.'
      : 'Protected time from existing teams. This is a delivery commitment, not a new appointment.';

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

function WorkforceModelCallout({ context }) {
  const models = workforceModelsForContext(context).filter((model) => model.summary);
  if (!models.length) return null;
  return h('aside', { className: 'resource-workforce-callout' },
    h('strong', null, context.type === 'deliverable' ? 'Appointment model' : 'Workforce model'),
    ...models.map((model, index) => h('p', { key: `workforce-model-${index}` }, model.summary))
  );
}

function CapacitySummary({ profile }) {
  const committed = profile.existingCapacityFte || 0;
  const conditional = profile.conditionalExistingCapacityFte || 0;
  const onDemand = profile.unquantifiedExistingCapacityAsks?.length || 0;
  if (!committed && !conditional && !onDemand) return null;

  return h('div', { className: 'resource-capacity-strip', 'aria-label': 'Existing institutional capacity' },
    committed ? h('span', null,
      h('strong', null, formatFte(committed)),
      ' existing capacity to protect'
    ) : null,
    conditional ? h('span', null,
      h('strong', null, formatFte(conditional, 'Up to ')),
      ' conditional capacity'
    ) : null,
    onDemand ? h('span', null,
      h('strong', null, String(onDemand)),
      ` on-demand specialist ${onDemand === 1 ? 'contribution' : 'contributions'}`
    ) : null
  );
}

function PeopleAndCapacityPanel({ profile }) {
  const fundedPeople = (profile.deliveryInvestmentAsks || []).filter((ask) => typeof ask.fte === 'number');
  const permanent = fundedPeople.filter((ask) => appointmentForAsk(ask)?.appointmentBasis === 'permanent');
  const timeLimited = fundedPeople.filter((ask) => {
    const basis = appointmentForAsk(ask)?.appointmentBasis;
    return basis && basis !== 'permanent';
  });
  const unspecified = fundedPeople.filter((ask) => !appointmentForAsk(ask));
  const hasAppointmentModel = permanent.length || timeLimited.length;
  const required = profile.committedExistingCapacityAsks || [];
  const conditional = profile.conditionalExistingCapacityAsks || [];
  const unquantified = profile.unquantifiedExistingCapacityAsks || [];
  if (!fundedPeople.length && !required.length && !conditional.length && !unquantified.length) return null;

  return h('section', { className: 'resource-profile-section resource-people-section' },
    h(SectionHeading, {
      title: 'People and capacity',
      description: 'Who needs appointing, which roles are enduring or time-limited, and what existing institutional capacity must be protected.'
    }),
    hasAppointmentModel ? h(React.Fragment, null,
      h(FundedPeopleTable, {
        profile,
        asks: permanent,
        title: 'Permanent core to appoint',
        description: 'These roles are intended to be permanent appointments from the outset. Mobilisation funds the initial period; recurrent BAU funding takes over at the stated transition point.',
        tone: 'is-permanent',
        showAppointment: true
      }),
      h(FundedPeopleTable, {
        profile,
        asks: timeLimited,
        title: 'Time-limited / developmental appointments',
        description: 'Additional capacity used for a defined mobilisation purpose. These roles do not automatically transfer into BAU.',
        tone: 'is-time-limited',
        showAppointment: true
      }),
      h(FundedPeopleTable, {
        profile,
        asks: unspecified,
        title: 'Appointment basis still to define',
        description: 'Funded roles whose permanent, fixed-term or other appointment basis has not yet been recorded.',
        tone: 'is-unspecified',
        showAppointment: true
      })
    ) : h(FundedPeopleTable, {
      profile,
      asks: fundedPeople,
      title: 'New funded roles',
      description: 'Each academic-year column shows the FTE and cash requirement during mobilisation. Appointment basis has not yet been modelled for this deliverable.'
    }),
    h(ExistingPeopleTable, { asks: required }),
    h(ExistingPeopleTable, { asks: conditional, conditional: true }),
    h(ExistingPeopleTable, { asks: unquantified, unquantified: true })
  );
}

function OtherInvestmentPanel({ profile }) {
  const asks = (profile.deliveryInvestmentAsks || []).filter((ask) => typeof ask.fte !== 'number');
  if (!asks.length) return null;
  const years = deliveryYears(profile);
  const total = years.reduce((grandTotal, year) => grandTotal + asks.reduce((yearTotal, ask) => {
    const amount = amountForAcademicYear(ask, year.startYear);
    return yearTotal + (typeof amount === 'number' ? amount : 0);
  }, 0), 0);

  return h('section', { className: 'resource-profile-section resource-other-investment-section' },
    h(SectionHeading, {
      title: 'Other investment',
      description: 'Mobilisation cash requirements that are not appointments, such as platforms, tooling, student employment or direct delivery costs.',
      aside: total ? formatMoney(total) : null
    }),
    h('div', { className: 'resource-readable-table-wrap' },
      h('table', { className: 'resource-readable-table resource-multiyear-table' },
        h('thead', null,
          h('tr', null,
            h('th', { scope: 'col' }, 'Investment'),
            ...years.map((year) => h('th', { scope: 'col', key: year.year }, year.year)),
            h('th', { scope: 'col' }, 'Funding status')
          )
        ),
        h('tbody', null,
          ...asks.map((ask) => h('tr', { key: ask.id || `${ask.sourceStep?.id}-${askName(ask)}` },
            h('th', { scope: 'row' },
              h('strong', null, askName(ask)),
              ask.owner ? h('small', null, ask.owner) : null,
              ask.periodNeeded ? h('small', null, ask.periodNeeded) : null
            ),
            ...years.map((year) => h('td', { key: `${ask.id || askName(ask)}-${year.year}` },
              h(YearCell, { ask, year })
            )),
            h('td', null, h(StatusBadge, { ask }))
          ))
        )
      )
    )
  );
}

function YearlyInvestmentStrip({ profile, context }) {
  const years = deliveryYears(profile).filter((phase) => phase.total > 0 || phase.unquantified > 0);
  if (!years.length) return null;
  const deliveryAsks = profile.deliveryInvestmentAsks || [];
  const permanentIds = new Set(permanentAppointments(context).map((appointment) => appointment.resourceId));

  return h('div', { className: 'resource-year-strip', 'aria-label': 'Mobilisation investment by academic year' },
    ...years.map((phase) => {
      const amount = deliveryAsks.reduce((total, ask) => {
        const value = amountForAcademicYear(ask, phase.startYear);
        return total + (typeof value === 'number' ? value : 0);
      }, 0);
      const fte = deliveryAsks.reduce((total, ask) => total + fteForAcademicYear(ask, phase.startYear), 0);
      const permanent = deliveryAsks.reduce((total, ask) => permanentIds.has(ask.id)
        ? total + fteForAcademicYear(ask, phase.startYear)
        : total, 0);
      const temporary = Math.max(0, fte - permanent);
      const capacityNote = permanentIds.size
        ? `${formatFte(fte)} funded · ${formatFte(permanent)} permanent${temporary ? ` + ${formatFte(temporary)} time-limited` : ''}`
        : fte ? `${formatFte(fte)} new funded` : null;

      return h('div', { className: 'resource-year-summary', key: phase.year },
        h('span', null, phase.year),
        h('strong', null, amount ? formatMoney(amount) : 'Cost TBC'),
        capacityNote ? h('small', null, capacityNote) : null
      );
    })
  );
}

function BauAnchor({ profile, context }) {
  const bauAsks = profile.bauLiabilityAsks || [];
  const permanent = permanentAppointments(context);
  if (!bauAsks.length && !permanent.length) return null;

  const staffingAnnual = permanentAnnualRunRate(context, profile);
  const operatingAsks = permanent.length ? nonStaffBauAsks(profile) : [];
  const operatingAnnual = operatingAsks.reduce((total, ask) =>
    total + (typeof ask.amount === 'number' && Number.isFinite(ask.amount) ? ask.amount : 0), 0);
  const totalAnnual = bauOperatingBudget(context, profile);
  const totalFte = permanent.length
    ? permanent.reduce((total, appointment) => total + (appointment.fte || 0), 0)
    : bauAsks.reduce((total, ask) => total + (typeof ask.fte === 'number' ? ask.fte : 0), 0);

  return h('section', { className: 'resource-profile-section resource-bau-section' },
    h(SectionHeading, {
      title: 'BAU destination',
      description: permanent.length
        ? 'The enduring people and operating budget this mobilisation is designed to leave behind. Permanent posts are intended to be permanent from initial appointment; recurrent non-staff capabilities are shown separately so the full BAU budget is visible.'
        : 'The recurrent capability the mobilisation is intended to hand into normal institutional operation. BAU run-rate is shown separately and is not added to mobilisation investment.',
      aside: totalAnnual ? `${formatMoney(totalAnnual)} / year total` : null
    }),
    permanent.length ? h(React.Fragment, null,
      h('div', { className: 'resource-table-block is-permanent' },
        h('div', { className: 'resource-subheading' },
          h('div', null,
            h('h4', null, 'Permanent staffing'),
            h('p', null, 'The enduring establishment carried into BAU. This subtotal is staffing only.')
          ),
          h('strong', null, staffingAnnual ? `${formatMoney(staffingAnnual)} / year` : 'Cost TBC')
        ),
        h('div', { className: 'resource-readable-table-wrap' },
          h('table', { className: 'resource-readable-table resource-bau-table' },
            h('thead', null,
              h('tr', null,
                h('th', { scope: 'col' }, 'Permanent role'),
                h('th', { scope: 'col' }, 'FTE'),
                h('th', { scope: 'col' }, 'Annual BAU run-rate'),
                h('th', { scope: 'col' }, 'BAU from'),
                h('th', { scope: 'col' }, 'BAU owner')
              )
            ),
            h('tbody', null,
              ...permanent.map((appointment) => h('tr', { key: appointment.resourceId || appointment.role },
                h('th', { scope: 'row' },
                  h('strong', null, appointment.role),
                  h('small', null, appointment.appointmentLabel || 'Permanent post')
                ),
                h('td', { className: 'resource-cell-number' }, formatFte(appointment.fte || 0)),
                h('td', { className: 'resource-cell-money' }, appointment.annualBauAmount
                  ? `${formatMoney(appointment.annualBauAmount, appointment.currency || 'GBP')} / year`
                  : 'TBC'),
                h('td', null, appointment.bauFrom || 'TBC'),
                h('td', null, appointment.bauOwner || 'TBC')
              ))
            ),
            h('tfoot', null,
              h('tr', null,
                h('th', { scope: 'row' }, 'Permanent staffing subtotal'),
                h('td', null, totalFte ? formatFte(totalFte) : 'TBC'),
                h('td', null, staffingAnnual ? `${formatMoney(staffingAnnual)} / year` : 'TBC'),
                h('td', null, permanent[0]?.bauFrom || 'TBC'),
                h('td', null, permanent[0]?.bauOwner || 'TBC')
              )
            )
          )
        )
      ),
      operatingAsks.length ? h('div', { className: 'resource-table-block resource-bau-operating-block' },
        h('div', { className: 'resource-subheading' },
          h('div', null,
            h('h4', null, 'Recurrent operating budget'),
            h('p', null, 'Non-staff capabilities that are part of the intended BAU operating model rather than temporary mobilisation costs.')
          ),
          h('strong', null, operatingAnnual ? `${formatMoney(operatingAnnual)} / year` : 'Cost TBC')
        ),
        h('div', { className: 'resource-readable-table-wrap' },
          h('table', { className: 'resource-readable-table resource-bau-operating-table' },
            h('thead', null,
              h('tr', null,
                h('th', { scope: 'col' }, 'Recurrent capability / budget'),
                h('th', { scope: 'col' }, 'Annual budget'),
                h('th', { scope: 'col' }, 'From'),
                h('th', { scope: 'col' }, 'Owner'),
                h('th', { scope: 'col' }, 'Funding status')
              )
            ),
            h('tbody', null,
              ...operatingAsks.map((ask) => h('tr', { key: ask.id || askName(ask) },
                h('th', { scope: 'row' },
                  h('strong', null, askName(ask)),
                  ask.rationale ? h('small', null, ask.rationale) : null
                ),
                h('td', { className: 'resource-cell-money' }, typeof ask.amount === 'number'
                  ? `${formatMoney(ask.amount, ask.currency || 'GBP')} / year`
                  : 'TBC'),
                h('td', null, ask.periodNeeded || 'TBC'),
                h('td', null, ask.owner || 'TBC'),
                h('td', null, h(StatusBadge, { ask }))
              ))
            )
          )
        )
      ) : null,
      h('div', { className: 'resource-bau-total' },
        h('span', null, 'Total BAU operating budget'),
        h('strong', null, totalAnnual ? `${formatMoney(totalAnnual)} / year` : 'Not quantified'),
        operatingAnnual
          ? h('small', null, `${formatMoney(staffingAnnual)} staffing + ${formatMoney(operatingAnnual)} recurrent non-staff budget`)
          : h('small', null, 'Current recurrent baseline')
      )
    ) : h('div', { className: 'resource-readable-table-wrap' },
      h('table', { className: 'resource-readable-table resource-bau-table' },
        h('thead', null,
          h('tr', null,
            h('th', { scope: 'col' }, 'Recurrent commitment'),
            h('th', { scope: 'col' }, 'FTE'),
            h('th', { scope: 'col' }, 'Annual run-rate'),
            h('th', { scope: 'col' }, 'From'),
            h('th', { scope: 'col' }, 'Owner')
          )
        ),
        h('tbody', null,
          ...bauAsks.map((ask) => h('tr', { key: ask.id || `${ask.sourceStep?.id}-${askName(ask)}` },
            h('th', { scope: 'row' }, askName(ask)),
            h('td', { className: 'resource-cell-number' }, typeof ask.fte === 'number' ? formatFte(ask.fte) : '—'),
            h('td', { className: 'resource-cell-money' }, typeof ask.amount === 'number' ? `${formatMoney(ask.amount, ask.currency || 'GBP')} / year` : 'TBC'),
            h('td', null, ask.periodNeeded || 'TBC'),
            h('td', null, ask.owner || 'TBC')
          ))
        )
      )
    ),
    bauAsks.length ? h('div', { className: 'resource-bau-funding-list' },
      ...bauAsks.map((ask) => h('div', { className: 'resource-bau-funding-note', key: `funding-${ask.id || askName(ask)}` },
        h('div', null,
          h('strong', null, askName(ask)),
          h(StatusBadge, { ask })
        ),
        h('p', null, [
          ask.fundingRoute || null,
          ask.decisionNeededBy ? `Decision by ${ask.decisionNeededBy}` : null
        ].filter(Boolean).join(' · '))
      ))
    ) : null
  );
}

function FinancialPhasing({ profile }) {
  const phases = deliveryYears(profile);
  if (!phases.length) return null;
  const asks = profile.deliveryInvestmentAsks || [];
  return h('section', { className: 'resource-secondary-section' },
    h('h4', null, 'Mobilisation cost by academic year'),
    h('div', { className: 'resource-readable-table-wrap' },
      h('table', { className: 'resource-readable-table resource-phasing-table' },
        h('thead', null,
          h('tr', null,
            h('th', { scope: 'col' }, 'Academic year'),
            h('th', { scope: 'col' }, 'Quantified spend'),
            h('th', { scope: 'col' }, 'Funded FTE'),
            h('th', { scope: 'col' }, 'Unresolved value')
          )
        ),
        h('tbody', null,
          ...phases.map((phase) => {
            const total = asks.reduce((sum, ask) => {
              const amount = amountForAcademicYear(ask, phase.startYear);
              return sum + (typeof amount === 'number' ? amount : 0);
            }, 0);
            const fte = asks.reduce((sum, ask) => sum + fteForAcademicYear(ask, phase.startYear), 0);
            const unresolved = asks.filter((ask) => fundingState(ask) !== 'confirmed').reduce((sum, ask) => {
              const amount = amountForAcademicYear(ask, phase.startYear);
              return sum + (typeof amount === 'number' ? amount : 0);
            }, 0);
            return h('tr', { key: phase.year },
              h('th', { scope: 'row' }, phase.year),
              h('td', { className: 'resource-cell-money' }, total ? formatMoney(total) : '—'),
              h('td', { className: 'resource-cell-number' }, fte ? formatFte(fte) : '—'),
              h('td', null, unresolved ? formatMoney(unresolved) : '—')
            );
          })
        )
      )
    )
  );
}

function FundingPanel({ profile }) {
  const unquantified = new Set(profile.unquantifiedInvestmentAsks || []);
  const exceptions = profile.investmentAsks
    .filter((ask) => fundingState(ask) !== 'confirmed' || unquantified.has(ask));
  if (!exceptions.length) return null;

  return h('section', { className: 'resource-secondary-section' },
    h('h4', null, 'Decisions still to close'),
    h('div', { className: 'resource-decision-list' },
      ...exceptions.map((ask) => h('article', { className: 'resource-decision-item', key: ask.id || askName(ask) },
        h('div', null,
          h('strong', null, askName(ask)),
          h(StatusBadge, { ask })
        ),
        h('p', null, [
          isBauLiability(ask) ? 'BAU recurrent funding' : 'Mobilisation investment',
          ask.decisionNeededBy ? `Decision by ${ask.decisionNeededBy}` : null,
          ask.fundingRoute || null,
          ask.confidence || null
        ].filter(Boolean).join(' · '))
      ))
    )
  );
}

function SourceStatement({ steps, profile, contextType }) {
  const sourceSteps = steps.filter((step) => resourceGroups(step).length > 0).length;
  const location = contextType === 'deliverable'
    ? 'Open the delivery-step detail above for the authored resource records.'
    : 'Open the relevant deliverable for the authored resource records.';
  return h('p', { className: 'subtle resource-profile-source' },
    `Derived from ${profile.asks.length} resource asks across ${sourceSteps} delivery ${sourceSteps === 1 ? 'step' : 'steps'}. ${location}`
  );
}

function ResourceInvestmentProfile({ context, steps }) {
  const profile = useMemo(() => buildFinancialProfile(steps), [steps]);
  const summaryTitle = context.type === 'project'
    ? 'Project resources and investment'
    : 'Resources and investment';
  const mobilisationUnresolved = (profile.deliveryInvestmentAsks || []).filter((ask) => fundingState(ask) !== 'confirmed').length;
  const bauUnresolved = (profile.bauLiabilityAsks || []).filter((ask) => fundingState(ask) !== 'confirmed').length;
  const years = deliveryYears(profile);
  const cashValue = profile.knownInvestment > 0 ? formatMoney(profile.knownInvestment) : 'Not quantified';
  const cashNote = years.length > 1
    ? `Quantified mobilisation investment across ${years.length} academic years`
    : 'Quantified mobilisation investment';
  const permanent = permanentFte(context);
  const peakFte = peakDeliveryFte(profile);
  const staffingRunRate = permanentAnnualRunRate(context, profile);
  const recurrentNonStaff = nonStaffBauAnnual(profile);
  const bauBudget = bauOperatingBudget(context, profile);
  const hasWorkforceModel = workforceModelsForContext(context).length > 0;
  const temporaryPeak = Math.max(0, peakFte - permanent);

  const summaryCards = hasWorkforceModel ? [
    h(MetricCard, {
      key: 'cash',
      label: 'Mobilisation investment',
      value: cashValue,
      note: cashNote,
      tone: 'resource-summary-cash'
    }),
    h(MetricCard, {
      key: 'permanent',
      label: 'Permanent posts to establish',
      value: permanent ? formatFte(permanent) : 'None recorded',
      note: permanent ? 'Appoint as enduring institutional posts' : 'No permanent appointment model recorded',
      tone: 'resource-summary-permanent'
    }),
    h(MetricCard, {
      key: 'peak',
      label: 'Peak mobilisation team',
      value: peakFte ? formatFte(peakFte) : 'Not quantified',
      note: permanent && temporaryPeak
        ? `${formatFte(permanent)} permanent + ${formatFte(temporaryPeak)} time-limited`
        : 'Peak concurrent funded FTE',
      tone: 'resource-summary-new'
    }),
    h(MetricCard, {
      key: 'bau',
      label: 'BAU operating budget',
      value: bauBudget ? `${formatMoney(bauBudget)} / year` : 'Not quantified',
      note: permanent && recurrentNonStaff
        ? `${formatMoney(staffingRunRate)} staffing + ${formatMoney(recurrentNonStaff)} recurrent non-staff`
        : permanent
          ? `${formatFte(permanent)} recurrent staffing`
          : 'Recurrent liability where planned',
      tone: 'resource-summary-bau'
    })
  ] : [
    h(MetricCard, {
      key: 'cash',
      label: 'Mobilisation investment',
      value: cashValue,
      note: cashNote,
      tone: 'resource-summary-cash'
    }),
    h(MetricCard, {
      key: 'funded',
      label: 'New funded capacity',
      value: peakFte ? formatFte(peakFte) : 'Not quantified',
      note: 'Peak concurrent funded FTE during the plan',
      tone: 'resource-summary-new'
    }),
    h(MetricCard, {
      key: 'existing',
      label: 'Existing capacity to commit',
      value: profile.existingCapacityFte > 0 ? formatFte(profile.existingCapacityFte) : 'Not quantified',
      note: 'Protected time from current establishment',
      tone: 'resource-summary-existing'
    }),
    h(MetricCard, {
      key: 'bau',
      label: 'BAU operating budget',
      value: bauBudget ? `${formatMoney(bauBudget)} / year` : 'Not recorded',
      note: 'Recurrent commitment where one is planned',
      tone: 'resource-summary-bau'
    })
  ];

  return h('section', {
    id: 'resource-investment-profile',
    className: 'panel resource-investment-profile'
  },
    h('header', { className: 'resource-profile-titlebar' },
      h('h2', null, summaryTitle),
      h('p', null, 'A decision-ready view of mobilisation spend, appointments, existing institutional capacity and the intended business-as-usual landing.')
    ),
    h('div', { className: 'resource-profile-body resource-readable-body' },
      h('div', { className: 'resource-profile-summary-grid resource-readable-summary' }, ...summaryCards),
      h(WorkforceModelCallout, { context }),
      h(CapacitySummary, { profile }),
      h(YearlyInvestmentStrip, { profile, context }),
      mobilisationUnresolved || bauUnresolved
        ? h('p', { className: 'resource-attention-line' },
            mobilisationUnresolved
              ? h('strong', null, `${mobilisationUnresolved} mobilisation ${mobilisationUnresolved === 1 ? 'item needs' : 'items need'} approval or validation. `)
              : null,
            bauUnresolved
              ? h('span', null, `${bauUnresolved} BAU recurrent ${bauUnresolved === 1 ? 'commitment still needs' : 'commitments still need'} its funding route closed.`)
              : null
          )
        : null,
      h(PeopleAndCapacityPanel, { profile }),
      h(BauAnchor, { profile, context }),
      h(OtherInvestmentPanel, { profile }),
      h('details', { className: 'resource-secondary-detail' },
        h('summary', null,
          h('strong', null, 'Planning detail'),
          h('span', null, 'Annual totals, open decisions and source records')
        ),
        h('div', { className: 'resource-secondary-detail-body' },
          h(FinancialPhasing, { profile }),
          h(FundingPanel, { profile }),
          h(SourceStatement, { steps, profile, contextType: context.type })
        )
      )
    )
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
