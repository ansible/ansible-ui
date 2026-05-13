/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PageFormTextInput } from '../PageForm/Inputs/PageFormTextInput';
import { PageWizard } from './PageWizard';

describe('PageWizard', () => {
  const Review = () => {
    return <h1>Review</h1>;
  };

  const steps = [
    {
      id: 'hidden',
      label: 'Hidden',
      inputs: <input type="text" />,
      hidden: () => true,
    },
    {
      id: 'welcome',
      label: 'Welcome',
      element: <h1>Welcome</h1>,
    },
    {
      id: 'inputs',
      label: 'Inputs',
      inputs: (
        <>
          <PageFormTextInput label="Input 1" name="input_1" />
          <PageFormTextInput label="Input 2" name="input_2" />
        </>
      ),
    },
    {
      id: 'review',
      label: 'Review',
      element: <Review />,
    },
  ];

  const defaultStepDefaults = {
    inputs: {
      input_1: 'value 1',
      input_2: 'value 2',
    },
  };

  const renderWizard = (onCancel = vi.fn(), onSubmit = vi.fn().mockResolvedValue(undefined)) => {
    return render(
      <MemoryRouter>
        <PageWizard
          steps={steps}
          onCancel={onCancel}
          onSubmit={onSubmit}
          stepDefaults={defaultStepDefaults}
        />
      </MemoryRouter>
    );
  };

  it('should render with correct steps', async () => {
    const user = userEvent.setup();
    renderWizard();

    // In jsdom, wizard may be collapsed - expand it first
    const toggle = screen.queryByTestId('wizard-toggle');
    if (toggle) {
      await user.click(toggle);
    }

    const navItems = screen.getAllByRole('listitem');
    const navTexts = navItems.map((item) => item.textContent);

    expect(navTexts).toContain('Welcome');
    expect(navTexts).toContain('Inputs');
    expect(navTexts).toContain('Review');
  });

  it('should hide step when hidden is set to true', async () => {
    const user = userEvent.setup();
    renderWizard();

    // In jsdom, wizard may be collapsed - expand it first
    const toggle = screen.queryByTestId('wizard-toggle');
    if (toggle) {
      await user.click(toggle);
    }

    const navItems = screen.getAllByRole('listitem');
    const navTexts = navItems.map((item) => item.textContent);

    expect(navTexts).not.toContain('Hidden');
  });

  it('should disable back button on initial step', () => {
    renderWizard();

    expect(screen.getByTestId('wizard-next')).not.toBeDisabled();
    expect(screen.getByTestId('wizard-next')).toHaveTextContent('Next');
    expect(screen.getByTestId('wizard-back')).toBeDisabled();
    expect(screen.getByTestId('wizard-back')).toHaveTextContent('Back');
    expect(screen.getByTestId('wizard-cancel')).toHaveTextContent('Cancel');
  });

  it('should navigate to next step when clicking next in the footer', async () => {
    const user = userEvent.setup();
    renderWizard();

    // Initial state: Welcome step active
    expect(screen.getByTestId('wizard-section-welcome')).toHaveTextContent('Welcome');

    // Click Next to go to Inputs step
    await user.click(screen.getByTestId('wizard-next'));

    // Wait for the Inputs step content to appear
    await waitFor(() => {
      expect(screen.getByText('Input 1')).toBeInTheDocument();
    });
  });

  it('should navigate to previous step when clicking back in the footer', async () => {
    const user = userEvent.setup();
    renderWizard();

    // Navigate to inputs step
    await user.click(screen.getByTestId('wizard-next'));

    await waitFor(() => {
      expect(screen.getByText('Input 1')).toBeInTheDocument();
    });

    // Click back
    await user.click(screen.getByTestId('wizard-back'));

    await waitFor(() => {
      expect(screen.getByTestId('wizard-section-welcome')).toHaveTextContent('Welcome');
    });
  });

  it('should handle onCancel callback', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <MemoryRouter>
        <PageWizard
          steps={steps}
          onCancel={onCancel}
          onSubmit={vi.fn()}
          stepDefaults={defaultStepDefaults}
        />
      </MemoryRouter>
    );

    const cancelContainer = screen.getByTestId('wizard-cancel');
    const cancelButton = cancelContainer.querySelector('button');
    expect(cancelButton).toBeInTheDocument();
    await user.click(cancelButton!);

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('should handle onSubmit callback', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    // Use simpler steps for this test
    const simpleSteps = [
      { id: 'welcome', label: 'Welcome', element: <h1>Welcome</h1> },
      { id: 'review', label: 'Review', element: <h1>Review</h1> },
    ];

    render(
      <MemoryRouter>
        <PageWizard steps={simpleSteps} onCancel={vi.fn()} onSubmit={onSubmit} stepDefaults={{}} />
      </MemoryRouter>
    );

    // Navigate to review step
    await user.click(screen.getByTestId('wizard-next'));
    await waitFor(() => {
      expect(screen.getByTestId('wizard-section-review')).toHaveTextContent('Review');
    });

    // Click Finish
    await user.click(screen.getByTestId('wizard-next'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce();
    });
  });

  describe('Substeps', () => {
    const stepsWithSubsteps = [
      {
        id: 'welcome',
        label: 'Welcome',
        element: <h1>Welcome</h1>,
      },
      {
        id: 'parentStep',
        label: 'Parent step',
        substeps: [
          {
            id: 'substepA',
            label: 'Substep A',
            element: <h1>Substep A</h1>,
          },
          {
            id: 'substepB',
            label: 'Substep B',
            element: <h1>Substep B</h1>,
          },
        ],
      },
    ];

    it('should navigate through substeps', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <PageWizard
            steps={stepsWithSubsteps}
            onCancel={vi.fn()}
            onSubmit={vi.fn().mockResolvedValue(undefined)}
            stepDefaults={{}}
          />
        </MemoryRouter>
      );

      // Initial state: Welcome
      expect(screen.getByTestId('wizard-section-welcome')).toHaveTextContent('Welcome');

      // Navigate to Substep A
      await user.click(screen.getByTestId('wizard-next'));

      await waitFor(() => {
        expect(screen.getByTestId('wizard-section-substepA')).toHaveTextContent('Substep A');
      });

      // Navigate to Substep B
      await user.click(screen.getByTestId('wizard-next'));

      await waitFor(() => {
        expect(screen.getByTestId('wizard-section-substepB')).toHaveTextContent('Substep B');
      });

      // Finish button should appear
      expect(screen.getByTestId('wizard-next')).toHaveTextContent('Finish');
    });

    it('should navigate back through substeps', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <PageWizard
            steps={stepsWithSubsteps}
            onCancel={vi.fn()}
            onSubmit={vi.fn().mockResolvedValue(undefined)}
            stepDefaults={{}}
          />
        </MemoryRouter>
      );

      // Navigate to Substep A
      await user.click(screen.getByTestId('wizard-next'));
      await waitFor(() => {
        expect(screen.getByTestId('wizard-section-substepA')).toHaveTextContent('Substep A');
      });

      // Navigate back to Welcome
      await user.click(screen.getByTestId('wizard-back'));
      await waitFor(() => {
        expect(screen.getByTestId('wizard-section-welcome')).toHaveTextContent('Welcome');
      });
    });
  });
});
