import React from 'react';
import { sharedResourceRegistry } from './shared-resource-registry.js';
import {
  sharedResourceLinksFromSteps,
  sharedResourceSummary
} from './shared-resource-utils.js';

function formatFte(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '';
  return `${number.toFixed(number % 1 === 0 ? 1 : 3).replace(/0+$/, '').replace(/\.$/, '')} FTE`;
}

export default function SharedResourcePanel({ steps = [] }) {
  const links = sharedResourceLinksFromSteps(steps);
  const resources = sharedResourceSummary(sharedResourceRegistry, links);
  if (!resources.length) return null;

  return (
    <section className="shared-resource-panel" aria-labelledby="shared-resource-heading">
      <div className="shared-resource-panel__heading">
        <p className="eyebrow">Shared resources</p>
        <h3 id="shared-resource-heading">How this plan contributes to coherent capacity</h3>
        <p>Linked asks are parts of wider posts or capabilities used across more than one deliverable. The underlying resource is defined once and allocations show where its capacity is consumed.</p>
      </div>
      <div className="shared-resource-panel__list">
        {resources.map((resource) => (
          <article className="shared-resource-card" key={resource.id}>
            <div className="shared-resource-card__title-row">
              <h4>{resource.title}</h4>
              {resource.allocatedFte > 0 ? <strong>{formatFte(resource.allocatedFte)} allocated here</strong> : null}
            </div>
            {resource.summary ? <p>{resource.summary}</p> : null}
            <dl className="shared-resource-card__meta">
              {resource.totalFte !== null ? <><dt>Coherent resource</dt><dd>{formatFte(resource.totalFte)}</dd></> : null}
              {resource.appointmentBasis ? <><dt>Appointment basis</dt><dd>{resource.appointmentBasis}</dd></> : null}
              {resource.fundingBasis ? <><dt>Funding basis</dt><dd>{resource.fundingBasis}</dd></> : null}
              {resource.bauDestination ? <><dt>BAU destination</dt><dd>{resource.bauDestination}</dd></> : null}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
