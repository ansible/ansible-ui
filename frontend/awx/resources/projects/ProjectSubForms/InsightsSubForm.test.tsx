import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { Project } from '../../../interfaces/Project';
import { InsightsSubForm } from './InsightsSubForm';

vi.mock('../../../access/credentials/components/PageFormCredentialSelect', () => ({
  PageFormCredentialSelect: ({ label }: { label: string }) => (
    <div data-testid="credential-select">{label}</div>
  ),
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm<Project>({
    defaultValues: {
      scm_type: 'insights',
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('InsightsSubForm', () => {
  it('should render when scm_type is insights', () => {
    render(
      <TestWrapper>
        <InsightsSubForm />
      </TestWrapper>
    );

    expect(screen.getByText('Type Details')).toBeInTheDocument();
  });

  it('should render Insights credential label when scm_type is insights', () => {
    render(
      <TestWrapper>
        <InsightsSubForm />
      </TestWrapper>
    );

    expect(screen.getByText('Insights credential')).toBeInTheDocument();
  });
});
