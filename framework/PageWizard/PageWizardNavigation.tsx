import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { isPageWizardParentStep, usePageWizard } from './PageWizardProvider';
import { PageWizardParentStep } from './types';
import { useCallback } from 'react';

export function PageWizardNavigation() {
  const {
    activeStep,
    isToggleExpanded,
    stepError,
    visibleSteps, // Top-level steps (including parent steps of substeps)
    visibleStepsFlattened, // Flattened list containing all visible steps including substeps
  } = usePageWizard();
  const navClassName = isToggleExpanded
    ? 'pf-v5-c-wizard__nav pf-m-expanded'
    : 'pf-v5-c-wizard__nav bg-lighten';

  const goToStepByIndex = useGoToStepByIndex();

  if (!activeStep) return;

  return (
    <nav className={navClassName} aria-label="Steps" data-cy="wizard-nav">
      <ol className="pf-v5-c-wizard__nav-list">
        {visibleSteps.map((step) => {
          /** Index of current step in flattened list */
          const index = visibleStepsFlattened.findIndex(
            (visibleStep) => step.id === visibleStep.id
          );
          const activeStepIndex = visibleStepsFlattened.findIndex(
            (step) => step.id === activeStep.id
          );
          const isDisabled = index > activeStepIndex;

          const className =
            'pf-v5-c-wizard__nav-link' + // eslint-disable-line i18next/no-literal-string
            (activeStep.id === step.id ||
            (isPageWizardParentStep(step) &&
              step.substeps?.some((substep) => substep.id === activeStep.id))
              ? // eslint-disable-next-line i18next/no-literal-string
                ' pf-m-current' // If the active step is a substep, highlight its parent step as active using className pf-m-current
              : '') + // eslint-disable-line i18next/no-literal-string
            (isDisabled ? ' pf-m-disabled' : ''); // eslint-disable-line i18next/no-literal-string

          return (
            <li
              className="pf-v5-c-wizard__nav-item"
              data-cy={`wizard-nav-item-${step.id}`}
              key={index}
            >
              <button
                className={className}
                onClick={() => goToStepByIndex(index)}
                disabled={isDisabled}
              >
                {' '}
                {step.label}
                {stepError[step.id] && activeStep.id === step.id && (
                  <span style={{ marginLeft: '8px' }}>
                    <ExclamationCircleIcon color="#C9190B" />
                  </span>
                )}
              </button>
              {
                /** Nav for substeps */
                isPageWizardParentStep(step) ? (
                  <SubstepsNav step={step} activeStepIndex={activeStepIndex} />
                ) : null
              }
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function SubstepsNav(props: { step: PageWizardParentStep; activeStepIndex: number }) {
  const {
    activeStep,
    stepError,
    visibleStepsFlattened, // Flattened list containing all visible steps including substeps
  } = usePageWizard();
  const { step, activeStepIndex } = props;
  const goToStepByIndex = useGoToStepByIndex();

  if (!activeStep) return;
  return (
    <ol className="pf-v5-c-wizard__nav-list">
      {step.substeps.map((substep) => {
        /** Index of current step in flattened list */
        const indexOfSubstep = visibleStepsFlattened.findIndex(
          (visibleStep) => substep.id === visibleStep.id
        );
        const isDisabled = indexOfSubstep > activeStepIndex;

        const className =
          'pf-v5-c-wizard__nav-link' + // eslint-disable-line i18next/no-literal-string
          (activeStep.id === substep.id
            ? // eslint-disable-next-line i18next/no-literal-string
              ' pf-m-current'
            : '') +
          (isDisabled ? ' pf-m-disabled' : ''); // eslint-disable-line i18next/no-literal-string

        return (
          <li
            className="pf-v5-c-wizard__nav-item"
            data-cy={`wizard-nav-item-${substep.id}`}
            key={substep.id}
          >
            <button
              className={className}
              onClick={() => goToStepByIndex(indexOfSubstep)}
              disabled={isDisabled}
            >
              {' '}
              {substep.label}
              {stepError[substep.id] && activeStep.id === substep.id && (
                <span style={{ marginLeft: '8px' }}>
                  <ExclamationCircleIcon color="#C9190B" />
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function useGoToStepByIndex() {
  const { setActiveStep, visibleStepsFlattened } = usePageWizard();

  return useCallback(
    (index: number) => {
      const step = visibleStepsFlattened[index];
      if (step) {
        if (isPageWizardParentStep(step)) {
          setActiveStep(step.substeps[0]);
        } else {
          setActiveStep(step);
        }
      }
    },
    [setActiveStep, visibleStepsFlattened]
  );
}
