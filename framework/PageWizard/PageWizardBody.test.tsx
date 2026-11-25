/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PageFormTextInput } from '../PageForm/Inputs/PageFormTextInput';
import { PageWizardBody } from './PageWizardBody';
import { PageWizardContext } from './PageWizardProvider';
import type { PageWizardState } from './PageWizardState';
import { PageWizardProvider } from './PageWizardProvider';

function MockWizardProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: Partial<PageWizardState>;
}) {
  const base: PageWizardState = {
    steps: [],
    visibleSteps: [],
    visibleStepsFlattened: [],
    activeStep: { id: 'step1', label: 'Step 1', element: <p>Step content</p> },
    setActiveStep: vi.fn(),
    wizardData: {},
    setWizardData: vi.fn(),
    stepData: {},
    setStepData: vi.fn(),
    stepError: {},
    setStepError: vi.fn(),
    onNext: vi.fn(),
    onBack: vi.fn(),
    isSubmitting: false,
    setSubmitError: vi.fn(),
    isToggleExpanded: false,
    setToggleExpanded: vi.fn(),
  };
  return (
    <PageWizardContext.Provider value={{ ...base, ...value }}>
      {children}
    </PageWizardContext.Provider>
  );
}

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

  it('shows a spinner while submitting', () => {
    render(
      <MemoryRouter>
        <MockWizardProvider value={{ isSubmitting: true, activeStep: null }}>
          <PageWizardBody onCancel={() => {}} />
        </MockWizardProvider>
      </MemoryRouter>
    );

    expect(document.querySelector('.pf-v6-c-spinner')).toBeInTheDocument();
  });

  it('renders submit error alerts', () => {
    render(
      <MemoryRouter>
        <MockWizardProvider
          value={{
            submitError: new Error('Wizard failed'),
          }}
        >
          <PageWizardBody onCancel={() => {}} />
        </MockWizardProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Wizard failed')).toBeInTheDocument();
  });

  it('shows generic and string submit errors', () => {
    render(
      <MemoryRouter>
        <MockWizardProvider value={{ submitError: new Error('Something went wrong') }}>
          <PageWizardBody onCancel={() => {}} />
        </MockWizardProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    render(
      <MemoryRouter>
        <MockWizardProvider value={{ submitError: { code: 500 } as unknown as Error }}>
          <PageWizardBody onCancel={() => {}} />
        </MockWizardProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('An error occurred.')).toBeInTheDocument();
  });

  it('shows JSON details on structured submit errors', () => {
    const error = Object.assign(new Error('Validation failed'), {
      json: { name: 'Name is invalid', field: 'Required' },
    });
    render(
      <MemoryRouter>
        <MockWizardProvider value={{ submitError: error }}>
          <PageWizardBody onCancel={() => {}} />
        </MockWizardProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Validation failed')).toBeInTheDocument();
    expect(screen.getByText('Name is invalid')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('calls onCancel from the wizard footer', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <MemoryRouter>
        <MockWizardProvider
          value={{ activeStep: { id: 'step1', label: 'Step 1', element: <p>X</p> } }}
        >
          <PageWizardBody onCancel={onCancel} />
        </MockWizardProvider>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });
});
