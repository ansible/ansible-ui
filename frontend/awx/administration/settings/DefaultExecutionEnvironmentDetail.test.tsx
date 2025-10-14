import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { ExecutionEnvironment } from '../../interfaces/ExecutionEnvironment';
import { DefaultExecutionEnvironmentDetail } from './DefaultExecutionEnvironmentDetail';
import { AwxSettingsOptionsAction } from './AwxSettingsForm';

const mockExecutionEnvironment: ExecutionEnvironment = {
  id: 1,
  type: 'execution_environment',
  url: '/api/v2/execution_environments/1/',
  related: {
    named_url: '/api/v2/execution_environments/Default EE++Default EE/',
    activity_stream: '/api/v2/execution_environments/1/activity_stream/',
    unified_job_templates: '/api/v2/execution_environments/1/unified_job_templates/',
    copy: '/api/v2/execution_environments/1/copy/',
  },
  summary_fields: {
    user_capabilities: {
      edit: true,
      delete: false,
      copy: true,
    },
    organization: {
      id: 1,
      name: 'Default',
    },
  },
  created: '2023-01-01T00:00:00.000000Z',
  modified: '2023-01-01T00:00:00.000000Z',
  name: 'Default EE',
  description: 'Default execution environment',
  organization: 1,
  image: 'quay.io/ansible/ansible-runner:latest',
  managed: true,
  credential: null,
  pull: 'missing',
};

const mockOption: AwxSettingsOptionsAction = {
  type: 'field',
  label: 'Default Execution Environment',
  help_text: 'The default execution environment to use for job execution',
  category: 'jobs',
  category_slug: 'jobs',
  required: false,
};

describe('DefaultExecutionEnvironmentDetail', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('should fetch and display execution environment name', async () => {
    server.use(
      http.get(awxAPI`/execution_environments/1/`, () => {
        return HttpResponse.json(mockExecutionEnvironment);
      })
    );

    render(<DefaultExecutionEnvironmentDetail option={mockOption} id={1} />);

    // Should show loading initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Should show execution environment name after loading
    await waitFor(() => {
      expect(screen.getByText('Default EE')).toBeInTheDocument();
    });

    // Should show the label from the option
    expect(screen.getByText('Default Execution Environment')).toBeInTheDocument();
  });

  test('should display error message when loading fails', async () => {
    server.use(
      http.get(awxAPI`/execution_environments/1/`, () => {
        return HttpResponse.json({ message: 'Not found' }, { status: 404 });
      })
    );

    render(<DefaultExecutionEnvironmentDetail option={mockOption} id={1} />);

    // Should show error message after failed API call
    await waitFor(() => {
      expect(screen.getByText('Error loading execution environment')).toBeInTheDocument();
    });

    // Should show the label from the option
    expect(screen.getByText('Default Execution Environment')).toBeInTheDocument();
  });
});
