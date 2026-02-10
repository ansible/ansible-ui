/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PageWizardFooter } from './PageWizardFooter';
import { PageWizardContext } from './PageWizardProvider';

describe('PageWizardFooter', () => {
  const step1 = { id: 'step1', label: 'Step 1', element: <p>Step 1</p> };
  const step2 = { id: 'step2', label: 'Step 2', element: <p>Step 2</p> };
  const step3 = { id: 'step3', label: 'Step 3', element: <p>Step 3</p> };

  const wizardContext = {
    activeStep: step1,
    steps: [step1, step2, step3],
    visibleSteps: [step1, step2, step3],
    visibleStepsFlattened: [step1, step2, step3],
    isToggleExpanded: false,
    setActiveStep: () => {},
    setStepData: () => {},
    setStepError: () => {},
    setToggleExpanded: () => {},
    setWizardData: () => {},
    stepData: {},
    stepError: {},
    wizardData: {},
    onNext: () => Promise.resolve(),
    onBack: () => {},
    setSubmitError: () => {},
    isSubmitting: false,
  };

  it('should show "Finish" instead of "Next" if active step is the last step', () => {
    render(
      <PageWizardContext.Provider value={{ ...wizardContext, activeStep: step3 }}>
        <PageWizardFooter onNext={() => {}} onBack={() => {}} onCancel={() => {}} />
      </PageWizardContext.Provider>
    );
    expect(screen.getByTestId('wizard-next')).toHaveTextContent('Finish');
  });

  it('should disable back button if active step is the first step', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();

    render(
      <PageWizardContext.Provider value={wizardContext}>
        <PageWizardFooter onNext={onNext} onBack={() => {}} onCancel={() => {}} />
      </PageWizardContext.Provider>
    );

    expect(screen.getByTestId('wizard-next')).toHaveTextContent('Next');
    expect(screen.getByTestId('wizard-back')).toBeDisabled();

    await user.click(screen.getByTestId('wizard-next'));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('should enable back button if active step is not the first step', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();

    render(
      <PageWizardContext.Provider value={{ ...wizardContext, activeStep: step2 }}>
        <PageWizardFooter onNext={() => {}} onBack={onBack} onCancel={() => {}} />
      </PageWizardContext.Provider>
    );

    expect(screen.getByTestId('wizard-back')).toHaveTextContent('Back');
    expect(screen.getByTestId('wizard-back')).not.toBeDisabled();

    await user.click(screen.getByTestId('wizard-back'));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('should handle onCancel callback', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <PageWizardContext.Provider value={wizardContext}>
        <PageWizardFooter onNext={() => {}} onBack={() => {}} onCancel={onCancel} />
      </PageWizardContext.Provider>
    );

    const cancelContainer = screen.getByTestId('wizard-cancel');
    expect(cancelContainer).toHaveTextContent('Cancel');
    // Click the button inside the cancel container
    const cancelButton = cancelContainer.querySelector('button');
    expect(cancelButton).toBeInTheDocument();
    await user.click(cancelButton!);
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
