import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sharedResourceLinksFromSteps,
  sharedResourcePlanSummary,
  sharedResourceSummary,
  sumFteByAcademicYear
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

test('planned allocations aggregate by academic year for selected deliverables', () => {
  const registry = {
    sharedResources: [
      {
        id: 'edge-project-officers',
        title: 'Project Officers',
        totalFte: 2,
        yearlyProfile: [
          { academicYear: '2026/27', fte: 1, amount: 35000 },
          { academicYear: '2027/28', fte: 2, amount: 70000 }
        ],
        allocationPlan: [
          {
            deliverableId: '2.1.1',
            yearlyProfile: [
              { academicYear: '2026/27', fte: 0.1 },
              { academicYear: '2027/28', fte: 0.2 }
            ]
          },
          {
            deliverableId: '2.1.2',
            yearlyProfile: [
              { academicYear: '2026/27', fte: 0.05 },
              { academicYear: '2027/28', fte: 0.1 }
            ]
          },
          {
            deliverableId: '2.2.1',
            yearlyProfile: [
              { academicYear: '2026/27', fte: 0.05 },
              { academicYear: '2027/28', fte: 0.1 }
            ]
          }
        ]
      }
    ]
  };

  const summary = sharedResourcePlanSummary(registry, ['2.1.1', '2.1.2']);
  assert.equal(summary.length, 1);
  assert.equal(summary[0].plannedAllocationByYear.get('2026/27'), 0.15);
  assert.equal(summary[0].plannedAllocationByYear.get('2027/28'), 0.3);
});

test('sumFteByAcademicYear ignores malformed entries and adds valid profiles', () => {
  const totals = sumFteByAcademicYear([
    { yearlyProfile: [{ academicYear: '2026/27', fte: 0.1 }, { academicYear: '2027/28', fte: 0.2 }] },
    { yearlyProfile: [{ academicYear: '2026/27', fte: 0.05 }, { fte: 0.5 }] }
  ]);

  assert.equal(totals.get('2026/27'), 0.15);
  assert.equal(totals.get('2027/28'), 0.2);
});
