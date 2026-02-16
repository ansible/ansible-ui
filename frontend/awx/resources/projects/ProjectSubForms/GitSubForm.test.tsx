import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { Project } from '../../../interfaces/Project';
import { GitSubForm } from './GitSubForm';

vi.mock('../../../common/useAwxConfig', () => ({
  useAwxConfig: () => ({}),
}));

vi.mock('../../../access/credentials/components/PageFormCredentialSelect', () => ({
  PageFormCredentialSelect: ({ label }: { label: string }) => (
    <div data-testid="credential-select">{label}</div>
  ),
}));

vi.mock('@ansible/common-ui/utils/useGetDocsUrl', () => ({
  useGetDocsUrl: () => () => 'https://docs.example.com',
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm<Project>({
    defaultValues: {
      scm_type: 'git',
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('GitSubForm', () => {
  it('should render Source control URL label when scm_type is git', () => {
    render(
      <TestWrapper>
        <GitSubForm />
      </TestWrapper>
    );

    expect(screen.getByText('Source control URL')).toBeInTheDocument();
  });

  it('should render Source control branch/tag/commit label when scm_type is git', () => {
    render(
      <TestWrapper>
        <GitSubForm />
      </TestWrapper>
    );

    expect(screen.getByText('Source control branch/tag/commit')).toBeInTheDocument();
  });

  it('should render Source control credential label when scm_type is git', () => {
    render(
      <TestWrapper>
        <GitSubForm />
      </TestWrapper>
    );

    expect(screen.getByText('Source control credential')).toBeInTheDocument();
  });

  it('should render Type Details section when scm_type is git', () => {
    render(
      <TestWrapper>
        <GitSubForm />
      </TestWrapper>
    );

    expect(screen.getByText('Type Details')).toBeInTheDocument();
  });
});
