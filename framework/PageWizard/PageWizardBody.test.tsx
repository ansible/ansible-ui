/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PageWizardBody } from './PageWizardBody';
import { PageWizardProvider } from './PageWizardProvider';

describe('PageWizardBody', () => {
  it('should render the provided element within a page section', () => {
    render(
      <MemoryRouter>
        <PageWizardProvider
          steps={[{ id: 'step1', label: 'Step 1', element: <p>Step 1</p> }]}
          onSubmit={() => Promise.resolve()}
        >
          <PageWizardBody onCancel={() => {}} />
        </PageWizardProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('wizard-section-step1')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-footer')).toBeInTheDocument();
    expect(screen.getByText('Step 1')).toBeInTheDocument();
  });

  it('should render the provided inputs within a form', () => {
    const { container } = render(
      <MemoryRouter>
        <PageWizardProvider
          steps={[{ id: 'step1', label: 'Step 1', inputs: <input data-testid="mocked-input" /> }]}
          onSubmit={() => Promise.resolve()}
        >
          <PageWizardBody onCancel={() => {}} />
        </PageWizardProvider>
      </MemoryRouter>
    );

    expect(container.querySelector('form')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-footer')).toBeInTheDocument();
    expect(screen.getByTestId('mocked-input')).toBeInTheDocument();
  });
});
