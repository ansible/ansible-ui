/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { PageFormTextInput } from '../PageForm/Inputs/PageFormTextInput';
import { PageWizardBody } from './PageWizardBody';
import { PageWizardProvider } from './PageWizardProvider';

function SetFormError() {
  const { setError } = useFormContext();
  useEffect(() => {
    setError('name', { message: 'Invalid name' });
  }, [setError]);
  return null;
}

describe('PageWizardBody', () => {
  function LocationDisplay() {
    return <div data-testid="location">{useLocation().pathname}</div>;
  }

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

  it('renders a list for multiple newline-separated request errors', async () => {
    const user = userEvent.setup();
    const onSubmit = () =>
      Promise.reject(
        Object.assign(new Error('Could not save'), {
          json: { detail: 'First error\nSecond error' },
        })
      );

    render(
      <MemoryRouter>
        <PageWizardProvider
          steps={[{ id: 'step1', label: 'Step 1', element: <p>Step 1</p> }]}
          onSubmit={onSubmit}
        >
          <PageWizardBody onCancel={() => {}} />
        </PageWizardProvider>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(await screen.findByRole('list')).toBeInTheDocument();
    const list = screen.getByRole('list');
    expect(within(list).getByText('First error')).toBeInTheDocument();
    expect(within(list).getByText('Second error')).toBeInTheDocument();
  });

  it('renders duplicate request errors as separate list items', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <PageWizardProvider
          steps={[{ id: 'step1', label: 'Step 1', element: <p>Step 1</p> }]}
          onSubmit={() =>
            Promise.reject(
              Object.assign(new Error('Could not save'), {
                json: { detail: 'Could not save: Repeated error\nRepeated error' },
              })
            )
          }
        >
          <PageWizardBody onCancel={() => {}} />
        </PageWizardProvider>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(await screen.findAllByText('Repeated error')).toHaveLength(2);
    expect(screen.queryByText('Could not save: Repeated error')).not.toBeInTheDocument();
  });

  it('renders an Error message when the request has no JSON payload', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <PageWizardProvider
          steps={[{ id: 'step1', label: 'Step 1', element: <p>Step 1</p> }]}
          onSubmit={() => Promise.reject(new Error('Request failed'))}
        >
          <PageWizardBody onCancel={() => {}} />
        </PageWizardProvider>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(await screen.findByText('Request failed')).toBeInTheDocument();
  });

  it('navigates back when no cancel callback is provided', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/previous', '/current']} initialIndex={1}>
        <LocationDisplay />
        <PageWizardProvider
          steps={[{ id: 'step1', label: 'Step 1', element: <p>Step 1</p> }]}
          onSubmit={() => Promise.resolve()}
        >
          <PageWizardBody />
        </PageWizardProvider>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/previous');
  });

  it('calls onCancel from the wizard footer', async () => {
    const user = userEvent.setup();
    let cancelled = false;

    render(
      <MemoryRouter>
        <PageWizardProvider
          steps={[{ id: 'step1', label: 'Step 1', element: <p>Step 1</p> }]}
          onSubmit={() => Promise.resolve()}
        >
          <PageWizardBody
            onCancel={() => {
              cancelled = true;
            }}
          />
        </PageWizardProvider>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(cancelled).toBe(true);
  });

  it('shows a spinner while submitting', async () => {
    const user = userEvent.setup();
    let resolveSubmit: () => void = () => undefined;
    const submitting = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });

    render(
      <MemoryRouter>
        <PageWizardProvider
          steps={[{ id: 'step1', label: 'Step 1', element: <p>Step 1</p> }]}
          onSubmit={() => submitting}
        >
          <PageWizardBody onCancel={() => {}} />
        </PageWizardProvider>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Finish' }));
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    resolveSubmit();
  });

  it('renders a single JSON request error without a list', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <PageWizardProvider
          steps={[{ id: 'step1', label: 'Step 1', element: <p>Step 1</p> }]}
          onSubmit={() =>
            Promise.reject(
              Object.assign(new Error('Could not save'), { json: { detail: 'One error' } })
            )
          }
        >
          <PageWizardBody onCancel={() => {}} />
        </PageWizardProvider>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(await screen.findByText('One error')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('tracks validation errors for an input step', async () => {
    render(
      <MemoryRouter>
        <PageWizardProvider
          steps={[
            {
              id: 'step1',
              label: 'Step 1',
              inputs: (
                <>
                  <SetFormError />
                  <PageFormTextInput name="name" label="Name" />
                </>
              ),
            },
          ]}
          onSubmit={() => Promise.resolve()}
        >
          <PageWizardBody onCancel={() => {}} />
        </PageWizardProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('name')).toHaveAttribute('aria-invalid', 'true');
    });
  });
});
