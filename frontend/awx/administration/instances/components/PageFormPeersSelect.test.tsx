/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PageFormPeersSelect } from './PageFormPeersSelect';

function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm();
  return (
    <MemoryRouter>
      <FormProvider {...methods}>{children}</FormProvider>
    </MemoryRouter>
  );
}

describe('PageFormPeersSelect', () => {
  it('should render with Peers label', () => {
    render(
      <TestWrapper>
        <PageFormPeersSelect name="peers" labelHelp="Select peer instances" />
      </TestWrapper>
    );

    expect(screen.getByText('Peers')).toBeInTheDocument();
  });

  it('should render with Select peer placeholder', () => {
    render(
      <TestWrapper>
        <PageFormPeersSelect name="peers" labelHelp="Select peer instances" />
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText('Select peer')).toBeInTheDocument();
  });
});
