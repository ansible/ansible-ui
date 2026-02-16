/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { RulesList } from './RulesList';

vi.mock('../../../common/useAwxConfig', () => ({
  useAwxConfig: () => ({}),
}));

vi.mock('@ansible/common-ui/utils/useGetDocsUrl', () => ({
  useGetDocsUrl: () => 'https://docs.example.com/schedules',
}));

const server = setupServer(
  http.post(
    ({ request }) => request.url.includes('/schedules/preview/'),
    () =>
      HttpResponse.json({
        local: ['2025-02-15T10:00:00-05:00'],
        utc: ['2025-02-15T15:00:00Z'],
      })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('RulesList', () => {
  test('should render Schedule Rules title when ruleType is rules', () => {
    render(
      <MemoryRouter>
        <RulesList ruleType="rules" rules={[]} timezone="America/New_York" needsHeader />
      </MemoryRouter>
    );

    expect(screen.getByText('Schedule Rules')).toBeInTheDocument();
  });

  test('should render Schedule Exceptions title when ruleType is exception', () => {
    render(
      <MemoryRouter>
        <RulesList ruleType="exception" rules={[]} timezone="America/New_York" needsHeader />
      </MemoryRouter>
    );

    expect(screen.getByText('Schedule Exceptions')).toBeInTheDocument();
  });

  test('should render empty state when no rules', () => {
    render(
      <MemoryRouter>
        <RulesList ruleType="rules" rules={[]} timezone="America/New_York" />
      </MemoryRouter>
    );

    expect(screen.getByText('No rules yet')).toBeInTheDocument();
  });

  test('should render rules when provided', () => {
    const rules = [{ id: 1, rule: 'FREQ=DAILY;INTERVAL=1' }];
    render(
      <MemoryRouter>
        <RulesList ruleType="rules" rules={rules} timezone="America/New_York" />
      </MemoryRouter>
    );

    expect(screen.getByText('FREQ=DAILY;INTERVAL=1')).toBeInTheDocument();
  });
});
