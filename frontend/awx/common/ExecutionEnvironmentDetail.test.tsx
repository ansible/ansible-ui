import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import { ExecutionEnvironmentDetail } from './ExecutionEnvironmentDetail';

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    useGetPageUrl: () => (route: string, options?: { params?: { id?: number } }) =>
      `/execution-environments/${String(options?.params?.id ?? '')}`,
  };
});

const mockExecutionEnvironment = {
  id: 1,
  name: 'test-ee',
  description: '',
  image: 'quay.io/ansible/awx-ee',
};

describe('ExecutionEnvironmentDetail', () => {
  test('should render execution environment name as link', () => {
    render(
      <MemoryRouter>
        <ExecutionEnvironmentDetail
          executionEnvironment={mockExecutionEnvironment}
          isDefaultEnvironment={false}
        />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: 'test-ee' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', expect.stringContaining('/1'));
  });

  test('should render Missing resource when execution environment is undefined', () => {
    render(
      <MemoryRouter>
        <ExecutionEnvironmentDetail
          executionEnvironment={undefined}
          isDefaultEnvironment={false}
          verifyMissingVirtualEnv={false}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Missing resource')).toBeInTheDocument();
  });
});
