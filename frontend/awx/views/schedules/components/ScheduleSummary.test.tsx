import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { ScheduleSummary } from './ScheduleSummary';

const server = setupServer(
  http.post(awxAPI`/schedules/preview/`, () =>
    HttpResponse.json({
      local: ['2025-02-15T10:00:00-05:00'],
      utc: ['2025-02-15T15:00:00Z'],
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ScheduleSummary', () => {
  test('should render No schedule occurrences found when API returns empty', async () => {
    server.use(
      http.post(awxAPI`/schedules/preview/`, () => HttpResponse.json({ local: [], utc: [] }))
    );

    render(<ScheduleSummary rrule="FREQ=DAILY;INTERVAL=1" isLocal={true} />);

    await waitFor(() => {
      expect(screen.getByText('No schedule occurrences found')).toBeInTheDocument();
    });
  });

  test('should render schedule summary with occurrence times when API returns data', async () => {
    render(<ScheduleSummary rrule="FREQ=DAILY;INTERVAL=1" isLocal={true} />);

    await waitFor(
      () => {
        expect(screen.getByText(/2\/15\/25|15\/02\/25|2025/)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  test('should render Schedule summary label when hideColumnTitle is false', () => {
    render(
      <ScheduleSummary rrule="FREQ=DAILY;INTERVAL=1" isLocal={true} hideColumnTitle={false} />
    );

    expect(screen.getByText('Schedule summary')).toBeInTheDocument();
  });
});
