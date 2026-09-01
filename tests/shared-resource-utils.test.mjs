import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sharedResourceLinksFromSteps,
  sharedResourceSummary
} from '../src/shared-resource-utils.js';

test('shared resource links aggregate allocations without inferring identity from role text', () => {
  const steps = [
    {
      id: '2.2.1-step-1',
      title: 'Example one',
      resources: {
        existingCapacity: [
          {
            role: 'Deputy Director',
            sharedResourceId: 'edge-deputy-director',
            sharedResourceAllocation: { fte: 0.125 }
          }
        ]
      }
    },
    {
      id: '2.3.1-step-1',
      title: 'Example two',
      resources: {
        existingCapacity: [
          {
            role: 'Different display label',
            sharedResourceId: 'edge-deputy-director',
            sharedResourceAllocation: { fte: 0.125 }
          }
        ]
      }
    }
  ];

  const registry = {
    sharedResources: [
      {
        id: 'edge-deputy-director',
        title: 'Deputy Director, Enrichment & Enhancement',
        totalFte: 1
      }
    ]
  };

  const links = sharedResourceLinksFromSteps(steps);
  const summary = sharedResourceSummary(registry, links);

  assert.equal(links.length, 2);
  assert.equal(summary.length, 1);
  assert.equal(summary[0].title, 'Deputy Director, Enrichment & Enhancement');
  assert.equal(summary[0].allocatedFte, 0.25);
  assert.equal(summary[0].totalFte, 1);
});

test('unregistered shared resources remain visible by stable id', () => {
  const links = sharedResourceLinksFromSteps([
    {
      id: 'example-step',
      resources: {
        newInvestment: [
          { item: 'Shared analytical capacity', sharedResourceId: 'edge-analytics' }
        ]
      }
    }
  ]);

  const summary = sharedResourceSummary({ sharedResources: [] }, links);
  assert.equal(summary[0].title, 'edge-analytics');
  assert.equal(summary[0].allocatedFte, 0);
});
