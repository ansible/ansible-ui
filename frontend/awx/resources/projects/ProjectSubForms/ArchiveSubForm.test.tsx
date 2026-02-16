import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { Project } from '../../../interfaces/Project';
import { ArchiveSubForm } from './ArchiveSubForm';

vi.mock('../../../access/credentials/components/PageFormCredentialSelect', () => ({
  PageFormCredentialSelect: ({ label }: { label: string }) => (
    <div data-testid="credential-select">{label}</div>
  ),
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm<Project>({
    defaultValues: {
      scm_type: 'archive',
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('ArchiveSubForm', () => {
  it('should render Source control URL label when scm_type is archive', () => {
    render(
      <TestWrapper>
        <ArchiveSubForm />
      </TestWrapper>
    );

    expect(screen.getByText('Source control URL')).toBeInTheDocument();
  });

  it('should render Source control credential label when scm_type is archive', () => {
    render(
      <TestWrapper>
        <ArchiveSubForm />
      </TestWrapper>
    );

    expect(screen.getByText('Source control credential')).toBeInTheDocument();
  });

  it('should render Type Details section when scm_type is archive', () => {
    render(
      <TestWrapper>
        <ArchiveSubForm />
      </TestWrapper>
    );

    expect(screen.getByText('Type Details')).toBeInTheDocument();
  });
});
