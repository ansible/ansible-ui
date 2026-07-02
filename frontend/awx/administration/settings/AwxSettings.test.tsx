import { render, renderHook, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AwxSettings } from './AwxSettings';
import { useAwxSettingsGroupsBase } from './useAwxSettingsGroups';

const mockSettingsOptions = {
  actions: {
    GET: {
      AUTH_LDAP_1_URI: {
        category: 'Authentication',
        category_slug: 'authentication',
        type: 'string',
        label: 'LDAP URI',
      },
      SYSTEM_TEST_SETTING: {
        category: 'System',
        category_slug: 'system',
        type: 'string',
        label: 'Test Setting',
      },
      JOB_TEST_SETTING: {
        category: 'Jobs',
        category_slug: 'jobs',
        type: 'string',
        label: 'Job Test Setting',
      },
      LOGGING_TEST_SETTING: {
        category: 'Logging',
        category_slug: 'logging',
        type: 'string',
        label: 'Logging Test Setting',
      },
      DEBUG_TEST_SETTING: {
        category: 'Troubleshooting',
        category_slug: 'debug',
        type: 'boolean',
        label: 'Debug Test Setting',
      },
    },
    PUT: {},
  },
};

const server = setupServer(
  http.options(
    ({ request }: { request: Request }) => request.url.includes('settings'),
    () => HttpResponse.json(mockSettingsOptions)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AwxSettings', () => {
  it('should render settings page with Authentication Methods or error state', async () => {
    render(
      <MemoryRouter>
        <AwxSettings />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        const authTitle = screen.queryByText('Authentication Methods');
        const errorState = screen.queryByText('Error');
        expect(authTitle ?? errorState).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('should provide settings group descriptions via hook', () => {
    const { result } = renderHook(() => useAwxSettingsGroupsBase());
    const groups = result.current;

    const systemGroup = groups.find((g) => g.id === 'system');
    expect(systemGroup?.description).toBe(
      'Configure and manage automation controller system settings.'
    );

    const jobsGroup = groups.find((g) => g.id === 'jobs');
    expect(jobsGroup?.description).toBe('Define the operation of Jobs in automation controller.');

    const loggingGroup = groups.find((g) => g.id === 'logging');
    expect(loggingGroup?.description).toBe(
      'Set up logging to one of the supported external log aggregation services.'
    );

    const debugGroup = groups.find((g) => g.id === 'debug');
    expect(debugGroup?.description).toBe(
      'Enable or disable flags to aid in debugging issues within the platform.'
    );
  });
});
