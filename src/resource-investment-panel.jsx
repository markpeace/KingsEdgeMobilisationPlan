import React, { useMemo } from 'react';
import {
  amountForAcademicYear,
  buildFinancialProfile,
  fteForAcademicYear,
  fundingState,
  isBauLiability
} from './resource-profile-utils.js';
import {
  deliverableForResourceAsk,
  hasResourceProfileForContext,
  stepsForResourceContext,
  workforceModelsForResourceContext
} from './resource-profile-context.js';
import './styles/resource-profile.css';
import './styles/resource-profile-fit.css';

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

function askName(ask) {
  return ask.label || ask.item || ask.role || ask.condition || 'Resource ask';
}

function statusLabel(ask) {
  const state = fundingState(ask);
  if (state === 'confirmed') return 'Confirmed';
  if (state === 'unresolved') return 'Needs approval';
  if (state === 'not-recorded') return 'Status not set';
  return 'Status recorded';
}

function StatusBadge({ ask }) {
  const state = fundingState(ask);
  return <span className={`resource-status-badge resource-status-${state}`}>{statusLabel(ask)}</span>;
}

function MetricCard({ label, value, note, tone = '' }) {
  return <article className={`resource-metric-card ${tone}`.trim()}><strong>{value}</strong><span>{label}</span>{note ? <small>{note}</small> : null}</article>;
}

function SectionHeading({ title, description, aside = null }) {
  return <div className="resource-readable-heading"><div><h3>{title}</h3>{description ? <p>{description}</p> : null}</div>{aside ? <strong className="resource-heading-aside">{aside}</strong> : null}</div>;
}

function deliveryYears(profile) {
  const asks = profile.deliveryInvestmentAsks || [];
  const phases = profile.activeInvestmentPhases?.length ? profile.activeInvestmentPhases : profile.phases;
  return phases.filter((phase) => asks.some((ask) => {
    const amount = amountForAcademicYear(ask, phase.startYear);
    const fte = fteForAcademicYear(ask, phase.startYear);
    return amount !== null || fte > 0;
  }));
}

function appointmentsForContext(context) {
  return workforceModelsForResourceContext(context).flatMap((model) => model.appointments || []);
}

function appointmentForAsk(context, ask) {
  const deliverable = deliverableForResourceAsk(context, ask);
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
  return <div className="resource-appointment-cell"><span className={`resource-appointment-badge is-${basis}`}>{appointmentBasisLabel(appointment)}</span>{appointment?.appointmentLabel && appointment.appointmentLabel !== appointmentBasisLabel(appointment) ? <small>{appointment.appointmentLabel}</small> : null}{appointment?.fundingBasis ? <small>{appointment.fundingBasis}</small> : null}{appointment?.endState ? <small>{appointment.endState}</small> : null}</div>;
}

function permanentAppointments(context) {
  return appointmentsForContext(context).filter((appointment) => appointment.appointmentBasis === 'permanent');
}

function permanentFte(context) {
  return permanentAppointments(context).reduce((total, appointment) => total + (appointment.fte || 0), 0);
}

function peakDeliveryFte(profile) {
  const asks = profile.deliveryInvestmentAsks || [];
  return deliveryYears(profile).reduce((peak, year) => Math.max(peak, asks.reduce((total, ask) => total + fteForAcademicYear(ask, year.startYear), 0)), 0);
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
  return nonStaffBauAsks(profile).reduce((total, ask) => total + (typeof ask.amount === 'number' && Number.isFinite(ask.amount) ? ask.amount : 0), 0);
}

function bauOperatingBudget(context, profile) {
  const permanent = permanentAppointments(context);
  if (!permanent.length) return profile.knownAnnualBauLiability || 0;
  return permanentAnnualRunRate(context, profile) + nonStaffBauAnnual(profile);
}

function YearCell({ ask, year, showFte = false }) {
  const amount = amountForAcademicYear(ask, year.startYear);
  const fte = fteForAcademicYear(ask, year.startYear);
  if (amount === null && !fte) return <span className="resource-year-empty">—</span>;
  return <span className="resource-year-value"><strong>{amount !== null ? formatMoney(amount, ask.currency || 'GBP') : 'Cost TBC'}</strong>{showFte && fte ? <small>{formatFte(fte)}</small> : null}</span>;
}

function WorkforceCallout({ context }) {
  const models = workforceModelsForResourceContext(context).filter((model) => model.summary);
  if (!models.length) return null;
  return <aside className="resource-workforce-callout"><strong>{context.type === 'deliverable' ? 'Appointment model' : 'Workforce model'}</strong>{models.map((model, index) => <p key={index}>{model.summary}</p>)}</aside>;
}

function CapacityStrip({ profile }) {
  const committed = profile.existingCapacityFte || 0;
  const conditional = profile.conditionalExistingCapacityFte || 0;
  const onDemand = profile.unquantifiedExistingCapacityAsks?.length || 0;
  if (!committed && !conditional && !onDemand) return null;
  return <div className="resource-capacity-strip" aria-label="Existing institutional capacity">{committed ? <span><strong>{formatFte(committed)}</strong> existing capacity to protect</span> : null}{conditional ? <span><strong>{formatFte(conditional, 'Up to ')}</strong> conditional capacity</span> : null}{onDemand ? <span><strong>{onDemand}</strong> on-demand specialist {onDemand === 1 ? 'contribution' : 'contributions'}</span> : null}</div>;
}

function YearStrip({ profile, context }) {
  const years = deliveryYears(profile).filter((phase) => phase.total > 0 || phase.unquantified > 0 || phase.fte > 0);
  if (!years.length) return null;
  const asks = profile.deliveryInvestmentAsks || [];
  const permanentIds = new Set(permanentAppointments(context).map((appointment) => appointment.resourceId));
  return <div className="resource-year-strip" aria-label="Mobilisation investment by academic year">{years.map((phase) => {
    const amount = asks.reduce((total, ask) => {
      const value = amountForAcademicYear(ask, phase.startYear);
      return total + (typeof value === 'number' ? value : 0);
    }, 0);
    const fte = asks.reduce((total, ask) => total + fteForAcademicYear(ask, phase.startYear), 0);
    const permanent = asks.reduce((total, ask) => permanentIds.has(ask.id) ? total + fteForAcademicYear(ask, phase.startYear) : total, 0);
    const temporary = Math.max(0, fte - permanent);
    const note = permanentIds.size ? `${formatFte(fte)} funded · ${formatFte(permanent)} permanent${temporary ? ` + ${formatFte(temporary)} time-limited` : ''}` : fte ? `${formatFte(fte)} new funded` : null;
    return <div className="resource-year-summary" key={phase.year}><span>{phase.year}</span><strong>{amount ? formatMoney(amount) : 'Cost TBC'}</strong>{note ? <small>{note}</small> : null}</div>;
  })}</div>;
}

function FundedTable({ profile, context, asks, title, description, showAppointment = false, tone = '' }) {
  if (!asks.length) return null;
  const years = deliveryYears(profile);
  const totalCost = years.reduce((grand, year) => grand + asks.reduce((subtotal, ask) => subtotal + (amountForAcademicYear(ask, year.startYear) || 0), 0), 0);
  const peakFte = years.reduce((peak, year) => Math.max(peak, asks.reduce((total, ask) => total + fteForAcademicYear(ask, year.startYear), 0)), 0);
  return <div className={`resource-table-block ${tone}`.trim()}><div className="resource-subheading"><div><h4>{title}</h4>{description ? <p>{description}</p> : null}</div><strong>{formatFte(peakFte) || 'FTE TBC'} · {formatMoney(totalCost) || 'cost TBC'} profiled</strong></div><div className="resource-readable-table-wrap"><table className="resource-readable-table resource-multiyear-table resource-workforce-table"><thead><tr><th scope="col">Role / capacity</th>{showAppointment ? <th scope="col">Appointment / end-state</th> : null}{years.map((year) => <th scope="col" key={year.year}>{year.year}</th>)}<th scope="col">Funding status</th></tr></thead><tbody>{asks.map((ask) => <tr key={ask.id || `${ask.sourceStep?.id}-${askName(ask)}`}><th scope="row"><strong>{askName(ask)}</strong>{ask.owner ? <small>{ask.owner}</small> : null}{ask.periodNeeded ? <small>{ask.periodNeeded}</small> : null}</th>{showAppointment ? <td><AppointmentCell appointment={appointmentForAsk(context, ask)} /></td> : null}{years.map((year) => <td key={`${ask.id || askName(ask)}-${year.year}`}><YearCell ask={ask} year={year} showFte /></td>)}<td><StatusBadge ask={ask} /></td></tr>)}</tbody></table></div></div>;
}

function ExistingTable({ asks, conditional = false, unquantified = false }) {
  if (!asks.length) return null;
  const title = conditional ? 'Conditional capacity' : unquantified ? 'On-demand specialist contribution' : 'Existing capacity to protect';
  const description = conditional ? 'Only required if the stated trigger applies. It is not included in committed baseline capacity.' : unquantified ? 'Existing specialist input needed on demand, without a standing FTE allocation.' : 'Protected time from current teams. This is a delivery commitment, not a new appointment.';
  return <div className={`resource-table-block ${conditional ? 'is-conditional' : ''}`}><div className="resource-subheading"><div><h4>{title}</h4><p>{description}</p></div></div><div className="resource-readable-table-wrap"><table className="resource-readable-table resource-existing-table"><thead><tr><th scope="col">Role / contribution</th><th scope="col">{conditional ? 'Maximum' : 'Commitment'}</th><th scope="col">When needed</th><th scope="col">Owner</th></tr></thead><tbody>{asks.map((ask) => <tr key={`${ask.sourceStep?.contextId || ''}-${ask.id || askName(ask)}`}><th scope="row">{askName(ask)}</th><td>{typeof ask.fte === 'number' ? formatFte(ask.fte, conditional ? 'Up to ' : '') : 'As required'}</td><td>{ask.periodNeeded || 'TBC'}</td><td>{ask.owner || 'TBC'}</td></tr>)}</tbody></table></div></div>;
}

function PeopleSection({ profile, context }) {
  const funded = (profile.deliveryInvestmentAsks || []).filter((ask) => typeof ask.fte === 'number');
  const permanent = funded.filter((ask) => appointmentForAsk(context, ask)?.appointmentBasis === 'permanent');
  const temporary = funded.filter((ask) => {
    const basis = appointmentForAsk(context, ask)?.appointmentBasis;
    return basis && basis !== 'permanent';
  });
  const unspecified = funded.filter((ask) => !appointmentForAsk(context, ask));
  const hasAppointmentModel = workforceModelsForResourceContext(context).length > 0;
  const required = profile.committedExistingCapacityAsks || [];
  const conditional = profile.conditionalExistingCapacityAsks || [];
  const unquantified = profile.unquantifiedExistingCapacityAsks || [];
  if (!funded.length && !required.length && !conditional.length && !unquantified.length) return null;
  return <section className="resource-profile-section resource-people-section"><SectionHeading title="People and capacity" description="Who needs appointing, which capacity is temporary, and what existing institutional time must be protected." />{hasAppointmentModel ? <><FundedTable profile={profile} context={context} asks={permanent} title="Permanent core to appoint" description="Enduring institutional posts. Mobilisation funds their initial period and BAU funding takes over at the stated transition point." showAppointment tone="is-permanent" /><FundedTable profile={profile} context={context} asks={temporary} title="Time-limited / developmental appointments" description="Additional mobilisation capacity with no automatic BAU continuation." showAppointment tone="is-time-limited" /><FundedTable profile={profile} context={context} asks={unspecified} title="Appointment basis still to define" description="Funded capacity whose permanent, fixed-term or other employment basis has not yet been recorded." showAppointment tone="is-unspecified" /></> : <FundedTable profile={profile} context={context} asks={funded} title="New funded roles or capacity" description="Funded FTE during mobilisation. Appointment basis has not yet been modelled for this deliverable." />}<ExistingTable asks={required} /><ExistingTable asks={conditional} conditional /><ExistingTable asks={unquantified} unquantified /></section>;
}

function OtherInvestmentSection({ profile }) {
  const asks = (profile.deliveryInvestmentAsks || []).filter((ask) => typeof ask.fte !== 'number');
  if (!asks.length) return null;
  const years = deliveryYears(profile);
  const total = years.reduce((grand, year) => grand + asks.reduce((subtotal, ask) => subtotal + (amountForAcademicYear(ask, year.startYear) || 0), 0), 0);
  return <section className="resource-profile-section resource-other-investment-section"><SectionHeading title="Other investment" description="Mobilisation cash requirements that are not standing funded FTE, such as commissioning, platforms, tooling, student employment or direct delivery." aside={total ? formatMoney(total) : null} /><div className="resource-readable-table-wrap"><table className="resource-readable-table resource-multiyear-table"><thead><tr><th scope="col">Investment</th>{years.map((year) => <th scope="col" key={year.year}>{year.year}</th>)}<th scope="col">Funding status</th></tr></thead><tbody>{asks.map((ask) => <tr key={ask.id || `${ask.sourceStep?.id}-${askName(ask)}`}><th scope="row"><strong>{askName(ask)}</strong>{ask.owner ? <small>{ask.owner}</small> : null}</th>{years.map((year) => <td key={`${ask.id || askName(ask)}-${year.year}`}><YearCell ask={ask} year={year} /></td>)}<td><StatusBadge ask={ask} /></td></tr>)}</tbody></table></div></section>;
}

function BauSection({ profile, context }) {
  const bauAsks = profile.bauLiabilityAsks || [];
  const permanent = permanentAppointments(context);
  if (!bauAsks.length && !permanent.length) return null;
  const staffing = permanentAnnualRunRate(context, profile);
  const operating = permanent.length ? nonStaffBauAsks(profile) : [];
  const operatingAnnual = operating.reduce((total, ask) => total + (ask.amount || 0), 0);
  const totalAnnual = bauOperatingBudget(context, profile);
  return <section className="resource-profile-section resource-bau-section"><SectionHeading title="BAU destination" description="The enduring people and operating budget the mobilisation is designed to leave behind. Recurrent BAU is shown separately from mobilisation investment." aside={totalAnnual ? `${formatMoney(totalAnnual)} / year total` : null} />{permanent.length ? <><div className="resource-table-block is-permanent"><div className="resource-subheading"><div><h4>Permanent staffing</h4><p>The enduring establishment carried into BAU.</p></div><strong>{staffing ? `${formatMoney(staffing)} / year` : 'Cost TBC'}</strong></div><div className="resource-readable-table-wrap"><table className="resource-readable-table resource-bau-table"><thead><tr><th scope="col">Permanent role</th><th scope="col">FTE</th><th scope="col">Annual BAU run-rate</th><th scope="col">BAU from</th><th scope="col">BAU owner</th></tr></thead><tbody>{permanent.map((appointment) => <tr key={appointment.resourceId || appointment.role}><th scope="row"><strong>{appointment.role}</strong><small>{appointment.appointmentLabel || 'Permanent post'}</small></th><td>{formatFte(appointment.fte || 0)}</td><td>{appointment.annualBauAmount ? `${formatMoney(appointment.annualBauAmount, appointment.currency || 'GBP')} / year` : 'TBC'}</td><td>{appointment.bauFrom || 'TBC'}</td><td>{appointment.bauOwner || 'TBC'}</td></tr>)}</tbody></table></div></div>{operating.length ? <div className="resource-table-block resource-bau-operating-block"><div className="resource-subheading"><div><h4>Recurrent operating budget</h4><p>Non-staff capabilities that continue as part of BAU.</p></div><strong>{operatingAnnual ? `${formatMoney(operatingAnnual)} / year` : 'Cost TBC'}</strong></div><div className="resource-readable-table-wrap"><table className="resource-readable-table resource-bau-operating-table"><thead><tr><th scope="col">Capability / budget</th><th scope="col">Annual budget</th><th scope="col">From</th><th scope="col">Owner</th><th scope="col">Funding status</th></tr></thead><tbody>{operating.map((ask) => <tr key={ask.id || askName(ask)}><th scope="row"><strong>{askName(ask)}</strong></th><td>{typeof ask.amount === 'number' ? `${formatMoney(ask.amount, ask.currency || 'GBP')} / year` : 'TBC'}</td><td>{ask.periodNeeded || 'TBC'}</td><td>{ask.owner || 'TBC'}</td><td><StatusBadge ask={ask} /></td></tr>)}</tbody></table></div></div> : null}<div className="resource-bau-total"><span>Total BAU operating budget</span><strong>{totalAnnual ? `${formatMoney(totalAnnual)} / year` : 'Not quantified'}</strong>{operatingAnnual ? <small>{formatMoney(staffing)} staffing + {formatMoney(operatingAnnual)} recurrent non-staff</small> : null}</div></> : <div className="resource-readable-table-wrap"><table className="resource-readable-table resource-bau-table"><thead><tr><th scope="col">Recurrent commitment</th><th scope="col">FTE</th><th scope="col">Annual run-rate</th><th scope="col">From</th><th scope="col">Owner</th></tr></thead><tbody>{bauAsks.map((ask) => <tr key={ask.id || askName(ask)}><th scope="row">{askName(ask)}</th><td>{typeof ask.fte === 'number' ? formatFte(ask.fte) : '—'}</td><td>{typeof ask.amount === 'number' ? `${formatMoney(ask.amount, ask.currency || 'GBP')} / year` : 'TBC'}</td><td>{ask.periodNeeded || 'TBC'}</td><td>{ask.owner || 'TBC'}</td></tr>)}</tbody></table></div>}</section>;
}

function PlanningDetail({ profile, steps }) {
  const years = deliveryYears(profile);
  const unresolved = profile.investmentAsks.filter((ask) => fundingState(ask) !== 'confirmed');
  return <details className="resource-secondary-detail"><summary><strong>Planning detail</strong><span>Annual totals, open decisions and source records</span></summary><div className="resource-secondary-detail-body">{years.length ? <section className="resource-secondary-section"><h4>Mobilisation cost by academic year</h4><div className="resource-readable-table-wrap"><table className="resource-readable-table resource-phasing-table"><thead><tr><th scope="col">Academic year</th><th scope="col">Quantified spend</th><th scope="col">Funded FTE</th></tr></thead><tbody>{years.map((phase) => <tr key={phase.year}><th scope="row">{phase.year}</th><td>{phase.total ? formatMoney(phase.total) : '—'}</td><td>{phase.fte ? formatFte(phase.fte) : '—'}</td></tr>)}</tbody></table></div></section> : null}{unresolved.length ? <section className="resource-secondary-section"><h4>Decisions still to close</h4><div className="resource-decision-list">{unresolved.map((ask) => <article className="resource-decision-item" key={ask.id || askName(ask)}><div><strong>{askName(ask)}</strong><StatusBadge ask={ask} /></div><p>{[isBauLiability(ask) ? 'BAU recurrent funding' : 'Mobilisation investment', ask.decisionNeededBy ? `Decision by ${ask.decisionNeededBy}` : null, ask.fundingRoute || null, ask.confidence || null].filter(Boolean).join(' · ')}</p></article>)}</div></section> : null}<p className="subtle resource-profile-source">Derived from {profile.asks.length} resource asks across {steps.filter((step) => (step.resources?.existingCapacity?.length || 0) + (step.resources?.newInvestment?.length || 0) + (step.resources?.enablingConditions?.length || 0) > 0).length} delivery steps. Step-level resource records remain authoritative.</p></div></details>;
}

export function ResourceInvestmentProfile({ context }) {
  const steps = useMemo(() => stepsForResourceContext(context), [context]);
  const profile = useMemo(() => buildFinancialProfile(steps), [steps]);
  if (!hasResourceProfileForContext(context)) return null;

  const workforceModels = workforceModelsForResourceContext(context);
  const permanent = permanentFte(context);
  const peak = peakDeliveryFte(profile);
  const temporaryPeak = Math.max(0, peak - permanent);
  const staffingRunRate = permanentAnnualRunRate(context, profile);
  const recurrentNonStaff = nonStaffBauAnnual(profile);
  const bauBudget = bauOperatingBudget(context, profile);
  const years = deliveryYears(profile);
  const cashValue = profile.knownInvestment > 0 ? formatMoney(profile.knownInvestment) : 'Not quantified';
  const cards = workforceModels.length ? [
    <MetricCard key="cash" label="Mobilisation investment" value={cashValue} note={years.length > 1 ? `Quantified across ${years.length} academic years` : 'Quantified mobilisation investment'} tone="resource-summary-cash" />,
    <MetricCard key="permanent" label="Permanent posts to establish" value={permanent ? formatFte(permanent) : 'None recorded'} note={permanent ? 'Appoint as enduring institutional posts' : 'No permanent appointment model recorded'} tone="resource-summary-permanent" />,
    <MetricCard key="peak" label="Peak mobilisation team" value={peak ? formatFte(peak) : 'Not quantified'} note={permanent && temporaryPeak ? `${formatFte(permanent)} permanent + ${formatFte(temporaryPeak)} time-limited` : 'Peak concurrent funded FTE'} tone="resource-summary-new" />,
    <MetricCard key="bau" label="BAU operating budget" value={bauBudget ? `${formatMoney(bauBudget)} / year` : 'Not quantified'} note={permanent && recurrentNonStaff ? `${formatMoney(staffingRunRate)} staffing + ${formatMoney(recurrentNonStaff)} recurrent non-staff` : permanent ? `${formatFte(permanent)} recurrent staffing` : 'Recurrent liability where planned'} tone="resource-summary-bau" />
  ] : [
    <MetricCard key="cash" label="Mobilisation investment" value={cashValue} note={years.length > 1 ? `Quantified across ${years.length} academic years` : 'Quantified mobilisation investment'} tone="resource-summary-cash" />,
    <MetricCard key="funded" label="New funded capacity" value={peak ? formatFte(peak) : 'Not quantified'} note="Peak concurrent funded FTE during the plan" tone="resource-summary-new" />,
    <MetricCard key="existing" label="Existing capacity to commit" value={profile.existingCapacityFte > 0 ? formatFte(profile.existingCapacityFte) : 'Not quantified'} note="Protected time from current establishment" tone="resource-summary-existing" />,
    <MetricCard key="bau" label="BAU operating budget" value={bauBudget ? `${formatMoney(bauBudget)} / year` : 'Not recorded'} note="Recurrent commitment where one is planned" tone="resource-summary-bau" />
  ];

  const mobilisationUnresolved = (profile.deliveryInvestmentAsks || []).filter((ask) => fundingState(ask) !== 'confirmed').length;
  const bauUnresolved = (profile.bauLiabilityAsks || []).filter((ask) => fundingState(ask) !== 'confirmed').length;

  return <section id="resource-investment-profile" className="panel resource-investment-profile"><header className="resource-profile-titlebar"><h2>{context.type === 'project' ? 'Project resources and investment' : 'Resources and investment'}</h2><p>A decision-ready view of mobilisation spend, appointments, existing institutional capacity and the intended business-as-usual landing.</p></header><div className="resource-profile-body resource-readable-body"><div className="resource-profile-summary-grid resource-readable-summary">{cards}</div><WorkforceCallout context={context} /><CapacityStrip profile={profile} /><YearStrip profile={profile} context={context} />{mobilisationUnresolved || bauUnresolved ? <p className="resource-attention-line">{mobilisationUnresolved ? <strong>{mobilisationUnresolved} mobilisation {mobilisationUnresolved === 1 ? 'item needs' : 'items need'} approval or validation. </strong> : null}{bauUnresolved ? <span>{bauUnresolved} BAU recurrent {bauUnresolved === 1 ? 'commitment still needs' : 'commitments still need'} its funding route closed.</span> : null}</p> : null}<PeopleSection profile={profile} context={context} /><BauSection profile={profile} context={context} /><OtherInvestmentSection profile={profile} /><PlanningDetail profile={profile} steps={steps} /></div></section>;
}

export default ResourceInvestmentProfile;
