import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { BecomeMethodField } from './BecomeMethodField';

function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('BecomeMethodField', () => {
  it('should render with correct label', () => {
    render(
      <TestWrapper>
        <BecomeMethodField
          fieldOptions={{ id: 'become_method', label: 'Privilege Escalation Method' }}
          isRequired={true}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Privilege Escalation Method')).toBeInTheDocument();
  });

  it('should render with placeholder', () => {
    render(
      <TestWrapper>
        <BecomeMethodField
          fieldOptions={{ id: 'become_method', label: 'Privilege Escalation Method' }}
          isRequired={false}
        />
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText('Select a privilege escalation method')).toBeInTheDocument();
  });
});
