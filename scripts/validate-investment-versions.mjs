import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const baseline = read('../src/data/investment-case.json');
const v2 = read('../src/data/v2/investment-case.json');
const plan = read('../src/data/v2/kings-edge-plan.json');
const related = read('../src/data/v2/enabling-projects.json');
const crosswalk = read('../src/data/v2/crosswalk.json');
const sum = (numbers) => numbers.reduce((total, value) => total + value, 0);
const optionIds = ['economy', 'core', 'enhanced'];
const option = (id) => baseline.options.find((entry) => entry.id === id);
const area = (id) => baseline.areas.find((entry) => entry.id === id);
const pool = (id) => v2.accountingPools.find((entry) => entry.id === id);

assert.equal(baseline.version, 'v1');
assert.equal(v2.version, 'v2');
assert.deepEqual(baseline.options.map(({ id }) => id), optionIds);
assert.deepEqual(baseline.options.map(({ total }) => total), [2903572, 3582751, 4851907]);
assert.deepEqual(option('core').inYear, [673042, 1306432, 1603277]);
assert.equal(baseline.earlyAsk.amount, 184153);
assert.equal(baseline.earlyAsk.includedInSubstantive2026_27Case, true);
assert.equal(sum(baseline.earlyAsk.items.map(({ amount }) => amount)), baseline.earlyAsk.amount);
assert.equal(baseline.commissioning.coreBauAnnualFromJuly2029, 175000);

for (const id of optionIds) {
  assert.equal(sum(option(id).inYear), option(id).total, `${id} annual profile`);
  assert.equal(sum(baseline.areas.map((entry) => entry.optionTotals[id])), option(id).total, `${id} V1 areas`);
  assert.equal(sum(v2.accountingPools.map((entry) => entry.optionTotals[id])), option(id).total, `${id} V2 pools`);
  assert.equal(sum(baseline.infrastructureService.options[id].inYear), baseline.infrastructureService.options[id].total);
  const commission = sum(baseline.commissioning.options[id]);
  assert.equal(pool('purpose-recognition').optionTotals[id], area('architecture').optionTotals[id] - baseline.infrastructureService.options[id].total);
  assert.equal(pool('experiential-education').optionTotals[id], area('experiential').optionTotals[id]);
  assert.equal(pool('opportunity-transitions').optionTotals[id], baseline.infrastructureService.options[id].total + commission);
  assert.equal(pool('student-life').optionTotals[id], area('beyond-course').optionTotals[id] - commission);
  assert.equal(pool('insight-reputation').optionTotals[id], area('graduate-futures').optionTotals[id]);
}

for (const [index, amount] of option('core').inYear.entries()) {
  assert.equal(sum(v2.accountingPools.map((entry) => entry.coreInYear[index])), amount, `Core ${baseline.academicYears[index]} bridge`);
  assert.equal(pool('purpose-recognition').coreInYear[index], area('architecture').coreInYear[index] - baseline.infrastructureService.options.core.inYear[index]);
  assert.equal(pool('opportunity-transitions').coreInYear[index], baseline.infrastructureService.options.core.inYear[index] + baseline.commissioning.options.core[index]);
  assert.equal(pool('student-life').coreInYear[index], area('beyond-course').coreInYear[index] - baseline.commissioning.options.core[index]);
}
for (const entry of v2.accountingPools) assert.equal(sum(entry.coreInYear), entry.optionTotals.core, `${entry.id} annual bridge`);

const projectIds = new Set(plan.projects.map(({ id }) => id));
const deliverableIds = new Set([...plan.projects, ...related].flatMap(({ deliverables }) => deliverables.map(({ id }) => id)));
assert.equal(v2.projects.length, 6);
assert.equal(v2.accountingPools.length, 5);
assert.equal(pool('insight-reputation').unapportioned, true);
assert.deepEqual(new Set(v2.projects.map(({ id }) => id)), projectIds);
assert.deepEqual(new Set(v2.accountingPools.flatMap(({ v2Projects }) => v2Projects)), projectIds);
for (const project of v2.projects) {
  assert.ok(projectIds.has(project.id));
  assert.ok(project.deliverables.length);
  for (const id of project.deliverables) assert.ok(deliverableIds.has(id), `Missing ${id}`);
}
assert.equal(new Set(v2.projects.flatMap(({ deliverables }) => deliverables)).size, 19);
for (const item of baseline.earlyAsk.items) for (const id of item.v1Deliverables) {
  const mapped = crosswalk.deliverables[id]?.v2DeliverableIds || [id];
  for (const target of mapped) assert.ok(deliverableIds.has(target), `Early ask ${id} → ${target} missing`);
}
assert.deepEqual(v2.investmentChoices.map(({ id }) => id), optionIds);

console.log('Investment V1/V2 reconciliation passed: Economy, Core, Enhanced, three Core years, six projects, nineteen deliverables and early ask references.');
