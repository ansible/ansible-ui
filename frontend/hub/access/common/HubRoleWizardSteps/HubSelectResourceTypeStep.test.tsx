/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { HubSelectResourceTypeStep } from './HubSelectResourceTypeStep';

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => ({
    wizardData: { resourceType: '' },
    stepData: {},
    activeStep: null,
    setWizardData: vi.fn(),
    setStepData: vi.fn(),
  }),
}));

function FormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({ defaultValues: { resourceType: '' } });
  return (
    <FormProvider {...methods}>
      <MemoryRouter>{children}</MemoryRouter>
    </FormProvider>
  );
}

describe('HubSelectResourceTypeStep', () => {
  it('renders resource type field', async () => {
    render(
      <FormWrapper>
        <HubSelectResourceTypeStep />
      </FormWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Resource type')).toBeInTheDocument();
      expect(screen.getByText('Select a resource type')).toBeInTheDocument();
    });
  });
});
