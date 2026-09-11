/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PageFormTextInput } from '../PageForm/Inputs/PageFormTextInput';
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

  it('should forward optionsData into the step form so inputs auto-discover patterns', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <PageWizardProvider
          steps={[
            {
              id: 'step1',
              label: 'Step 1',
              inputs: <PageFormTextInput name="name" label="Name" />,
            },
          ]}
          stepDefaults={{ step1: { name: '' } }}
          onSubmit={() => Promise.resolve()}
        >
          <PageWizardBody
            onCancel={() => {}}
            optionsData={{
              actions: {
                POST: {
                  name: { pattern: '^[a-z]+$', pattern_description: 'lowercase only' },
                },
              },
            }}
          />
        </PageWizardProvider>
      </MemoryRouter>
    );

    const input = screen.getByLabelText('Name');
    await user.type(input, 'Invalid123');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('lowercase only')).toBeInTheDocument();
    });
  });

  it('should not apply any pattern validation when optionsData is not provided', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <PageWizardProvider
          steps={[
            {
              id: 'step1',
              label: 'Step 1',
              inputs: <PageFormTextInput name="name" label="Name" />,
            },
          ]}
          stepDefaults={{ step1: { name: '' } }}
          onSubmit={() => Promise.resolve()}
        >
          <PageWizardBody onCancel={() => {}} />
        </PageWizardProvider>
      </MemoryRouter>
    );

    const input = screen.getByLabelText('Name');
    await user.type(input, 'Invalid123');
    await user.tab();

    await waitFor(
      () => {
        expect(screen.queryByText(/lowercase only/)).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });
});
