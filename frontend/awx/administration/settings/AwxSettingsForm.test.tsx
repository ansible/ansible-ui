import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxSettingsForm, AwxSettingsOptionsAction } from './AwxSettingsForm';

const mockExecutionEnvironments = [
  {
    id: 1,
    name: 'Default Execution Environment',
    description: 'Default EE for testing',
    image: 'quay.io/ansible/awx-ee:latest',
  },
  {
    id: 2,
    name: 'Custom Execution Environment',
    description: 'Custom EE for testing',
    image: 'custom/ee:latest',
  },
];

const mockSettingsOptions = {
  DEFAULT_EXECUTION_ENVIRONMENT: {
    type: 'field',
    label: 'Default Execution Environment',
    category: 'jobs',
    category_slug: 'jobs',
    help_text: 'The execution environment that will be used by default for jobs.',
    required: false,
  } satisfies AwxSettingsOptionsAction,
};

const mockSettingsData = {
  DEFAULT_EXECUTION_ENVIRONMENT: 1,
};

describe('AwxSettingsForm - DEFAULT_EXECUTION_ENVIRONMENT field', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    server.use(
      http.get(awxAPI`/execution_environments/`, () => {
        return HttpResponse.json({
          count: mockExecutionEnvironments.length,
          results: mockExecutionEnvironments,
        });
      }),
      http.options(awxAPI`/execution_environments/`, () => {
        return new HttpResponse(null, { status: 200 });
      }),
      http.get(awxAPI`/execution_environments/1/`, () => {
        return HttpResponse.json(mockExecutionEnvironments[0]);
      }),
      http.patch(awxAPI`/settings/all/`, async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json(body);
      })
    );
  });

  test('should render execution environment selection field', () => {
    render(
      <MemoryRouter>
        <AwxSettingsForm options={mockSettingsOptions} data={mockSettingsData} />
      </MemoryRouter>
    );

    // Check that the label is rendered
    expect(screen.getByText('Default Execution Environment')).toBeVisible();

    // The PageFormSelectExecutionEnvironment component renders as a menu toggle button
    expect(screen.getByTestId('executionEnvironment')).toBeVisible();
  });

  test('should handle empty/no execution environment selection', () => {
    const emptyData = { DEFAULT_EXECUTION_ENVIRONMENT: null };

    render(
      <MemoryRouter>
        <AwxSettingsForm options={mockSettingsOptions} data={emptyData} />
      </MemoryRouter>
    );

    const menuToggle = screen.getByTestId('executionEnvironment');
    expect(menuToggle).toHaveTextContent('Select execution environment');
  });

  test('should show required indicator when field is marked as required', () => {
    const requiredOptions = {
      DEFAULT_EXECUTION_ENVIRONMENT: {
        ...mockSettingsOptions.DEFAULT_EXECUTION_ENVIRONMENT,
        required: true,
      },
    };

    render(
      <MemoryRouter>
        <AwxSettingsForm options={requiredOptions} data={mockSettingsData} />
      </MemoryRouter>
    );

    // Check for required indicator (asterisk)
    expect(screen.getByText('*')).toBeVisible();
  });
});
