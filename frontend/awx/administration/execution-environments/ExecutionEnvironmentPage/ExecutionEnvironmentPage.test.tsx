import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { ExecutionEnvironmentPage } from './ExecutionEnvironmentPage';

const createMockExecutionEnvironment = (
  overrides: Partial<ExecutionEnvironment> = {}
): ExecutionEnvironment => ({
  id: 1,
  type: 'execution_environment',
  url: '/api/v2/execution_environments/1/',
  related: {
    named_url: '/api/v2/execution_environments/Test EE++Test EE/',
    activity_stream: '/api/v2/execution_environments/1/activity_stream/',
    unified_job_templates: '/api/v2/execution_environments/1/unified_job_templates/',
    copy: '/api/v2/execution_environments/1/copy/',
  },
  summary_fields: {
    user_capabilities: {
      edit: true,
      delete: true,
      copy: true,
    },
    organization: {
      id: 1,
      name: 'Default',
    },
  },
  created: '2023-01-01T00:00:00.000000Z',
  modified: '2023-01-01T00:00:00.000000Z',
  name: 'Test EE',
  description: 'Test execution environment',
  organization: 1,
  image: 'quay.io/ansible/awx-ee:latest',
  managed: false,
  credential: null,
  pull: 'missing',
  ...overrides,
});

let mockExecutionEnvironment: ExecutionEnvironment;

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGetItem: vi.fn(() => ({
    data: mockExecutionEnvironment,
    error: null,
    refresh: vi.fn(),
  })),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => vi.fn(() => '/mock-url'),
    usePageNavigate: () => vi.fn(),
  };
});

vi.mock('../../../access/common/useViewActivityStream', () => ({
  useViewActivityStream: vi.fn(() => []),
}));

vi.mock('../hooks/useExecutionEnvRowActions', () => ({
  useExecutionEnvRowActions: vi.fn(() => []),
}));

describe('ExecutionEnvironmentPage - Tab Visibility', () => {
  describe('when execution environment is managed', () => {
    beforeEach(() => {
      mockExecutionEnvironment = createMockExecutionEnvironment({
        managed: true,
        organization: 1,
      });
    });

    it('should not show User Access and Team Access tabs for managed EEs', () => {
      render(
        <MemoryRouter>
          <ExecutionEnvironmentPage />
        </MemoryRouter>
      );

      expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Templates' })).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'User Access' })).not.toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'Team Access' })).not.toBeInTheDocument();
    });
  });

  describe('when execution environment is global (no organization)', () => {
    beforeEach(() => {
      mockExecutionEnvironment = createMockExecutionEnvironment({
        managed: false,
        organization: null as unknown as number,
      });
    });

    it('should not show User Access and Team Access tabs for global EEs', () => {
      render(
        <MemoryRouter>
          <ExecutionEnvironmentPage />
        </MemoryRouter>
      );

      expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Templates' })).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'User Access' })).not.toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'Team Access' })).not.toBeInTheDocument();
    });
  });

  describe('when execution environment is regular (not managed, has organization)', () => {
    beforeEach(() => {
      mockExecutionEnvironment = createMockExecutionEnvironment({
        managed: false,
        organization: 1,
      });
    });

    it('should show all tabs including User Access and Team Access', () => {
      render(
        <MemoryRouter>
          <ExecutionEnvironmentPage />
        </MemoryRouter>
      );

      expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Templates' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'User Access' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Team Access' })).toBeInTheDocument();
    });
  });
});
