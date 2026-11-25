import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getAppointments} from './calendar';

// Phase 5 characterization test: this locks in CURRENT behavior, not desired
// behavior. getAppointments() is a documented TODO stub (see calendar.ts) that
// always returns the same two mock entries regardless of the requested range.
// If this test ever needs to change because the function starts doing real
// work, that's expected — update the test to match the new (real) contract,
// don't just delete it to make a refactor pass.

test('getAppointments returns the current hardcoded two-entry mock, regardless of range', async () => {
  const start = new Date('2026-01-01T00:00:00Z');
  const end = new Date('2026-01-31T00:00:00Z');

  const appointments = await getAppointments(start, end);

  assert.equal(appointments.length, 2);
  assert.deepEqual(
    appointments.map(a => a.title),
    ['Meeting with John', 'Meeting with Jane']
  );
});

test('getAppointments does not actually filter by the requested range (documented gap)', async () => {
  const farPast = new Date('2000-01-01T00:00:00Z');
  const farFuture = new Date('2000-01-02T00:00:00Z');

  const appointments = await getAppointments(farPast, farFuture);

  // A real implementation would return [] for a range with no appointments.
  // The current stub ignores its arguments entirely — this assertion exists
  // to make that gap visible to CI, not to endorse it.
  assert.equal(appointments.length, 2);
});
