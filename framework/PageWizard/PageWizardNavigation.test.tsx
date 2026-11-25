/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { PageWizardState } from './PageWizardState';
import { PageWizardNavigation } from './PageWizardNavigation';
import * as PageWizardProvider from './PageWizardProvider';

describe('PageWizardNavigation', () => {
  const setActiveStep = vi.fn();

  const parentStep = {
    id: 'parent',
    label: 'Parent',
    substeps: [
      { id: 'child-a', label: 'Child A' },
      { id: 'child-b', label: 'Child B' },
    ],
  };

  const flatSteps = [
    parentStep,
    parentStep.substeps[0],
    parentStep.substeps[1],
    { id: 'review', label: 'Review' },
  ];

  function mockWizardState(overrides: Partial<PageWizardState> = {}): PageWizardState {
    return {
      activeStep: parentStep.substeps[0],
      isToggleExpanded: false,
      stepError: { 'child-a': { message: 'invalid' } },
      visibleSteps: [parentStep, { id: 'review', label: 'Review' }],
      visibleStepsFlattened: flatSteps,
      setActiveStep,
      steps: flatSteps,
      wizardData: {},
      setWizardData: vi.fn(),
      stepData: {},
      setStepData: vi.fn(),
      setStepError: vi.fn(),
      onNext: vi.fn(),
      onBack: vi.fn(),
      isSubmitting: false,
      setSubmitError: vi.fn(),
      setToggleExpanded: vi.fn(),
      ...overrides,
    } as PageWizardState;
  }

  beforeEach(() => {
    vi.restoreAllMocks();
    setActiveStep.mockClear();
  });

  it('renders nav items, highlights parent for active substep, and navigates', async () => {
    const user = userEvent.setup();
    vi.spyOn(PageWizardProvider, 'usePageWizard').mockReturnValue(mockWizardState());

    render(<PageWizardNavigation />);

    expect(screen.getByTestId('wizard-nav')).toHaveClass('pf-v6-c-wizard__nav');
    expect(screen.getByTestId('wizard-nav-item-parent')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-nav-item-child-a')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-nav-item-child-b')).toBeInTheDocument();

    const parentButton = screen.getByTestId('wizard-nav-item-parent').querySelector('button');
    expect(parentButton).toHaveClass('pf-m-current');

    await user.click(screen.getByTestId('wizard-nav-item-parent').querySelector('button')!);
    expect(setActiveStep).toHaveBeenCalledWith(parentStep.substeps[0]);
  });

  it('disables future steps and uses expanded nav class when toggle is expanded', async () => {
    const user = userEvent.setup();
    vi.spyOn(PageWizardProvider, 'usePageWizard').mockReturnValue(
      mockWizardState({ isToggleExpanded: true })
    );

    render(<PageWizardNavigation />);

    expect(screen.getByTestId('wizard-nav')).toHaveClass('pf-m-expanded');
    const reviewButton = screen.getByTestId('wizard-nav-item-review').querySelector('button');
    expect(reviewButton).toBeDisabled();

    await user.click(screen.getByTestId('wizard-nav-item-child-a').querySelector('button')!);
    expect(setActiveStep).toHaveBeenCalledWith(parentStep.substeps[0]);
  });

  it('returns nothing when activeStep is missing', () => {
    vi.spyOn(PageWizardProvider, 'usePageWizard').mockReturnValue(
      mockWizardState({ activeStep: null })
    );
    const { container } = render(<PageWizardNavigation />);
    expect(container).toBeEmptyDOMElement();
  });
});
