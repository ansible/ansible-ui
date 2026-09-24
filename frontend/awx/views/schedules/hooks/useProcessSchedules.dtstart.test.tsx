import { renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { ScheduleFormWizard } from '../types';
import { useProcessSchedule } from './useProcessSchedules';

vi.mock('react-router-dom', () => ({
  useParams: () => ({}) as Record<string, string | undefined>,
}));

let capturedBody: { rrule?: string } | undefined;

const server = setupServer(
  http.post(awxAPI`/job_templates/:id/schedules/`, async ({ request }) => {
    capturedBody = (await request.json()) as { rrule?: string };
    return HttpResponse.json({ id: 1, rrule: capturedBody?.rrule });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  capturedBody = undefined;
});
afterAll(() => server.close());

describe('useProcessSchedule - AAP-76525 regression', () => {
  test('submits DTSTART derived from the current Start date/time, not a stale value left in the rule', async () => {
    const { result } = renderHook(() => useProcessSchedule());

    const payloadData = {
      name: 'Weekly schedule',
      schedule_type: 'job_template',
      resource: { id: 5, type: 'job_template' },
      // The user edited the wizard's Start date/time to 5:30 PM...
      startDateTime: { date: '2024-01-01', time: '5:30 PM' },
      timezone: 'UTC',
      // ...but the rule string still embeds the ORIGINAL 5:00 PM start time,
      // e.g. because the Rules step's correction effect never re-ran for
      // this edit. The submitted DTSTART must reflect 5:30 PM regardless.
      rules: [{ id: 1, rule: 'DTSTART:20240101T170000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO' }],
      exceptions: [],
    } as unknown as ScheduleFormWizard;

    await result.current(payloadData);

    expect(capturedBody?.rrule).toContain('DTSTART:20240101T173000Z');
    expect(capturedBody?.rrule).not.toContain('170000');
  });
});
