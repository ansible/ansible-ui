import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { Project } from '../../../interfaces/Project';
import { SvnSubForm } from './SvnSubForm';

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
      scm_type: 'svn',
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('SvnSubForm', () => {
  it('should render Source control URL label when scm_type is svn', () => {
    render(
      <TestWrapper>
        <SvnSubForm />
      </TestWrapper>
    );

    expect(screen.getByText('Source control URL')).toBeInTheDocument();
  });

  it('should render Type Details section when scm_type is svn', () => {
    render(
      <TestWrapper>
        <SvnSubForm />
      </TestWrapper>
    );

    expect(screen.getByText('Type Details')).toBeInTheDocument();
  });
});
