import { PageSection } from '@patternfly/react-core';
import { useCallback, useEffect } from 'react';
import { useFormState } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageForm } from '../PageForm/PageForm';
import { PageWizardFooter } from './PageWizardFooter';
import { usePageWizard, isPageWizardParentStep } from './PageWizardProvider';
import type { PageWizardBody } from './types';
import { t } from 'i18next';

export function PageWizardBody<T>({
  onCancel,
  onSubmit,
  disableGrid,
  errorAdapter,
  isVertical,
  singleColumn,
}: PageWizardBody<T>) {
  const navigate = useNavigate();
  const {
    activeStep,
    setActiveStep,
    setStepData,
    setWizardData,
    stepData,
    visibleStepsFlattened,
    wizardData,
  } = usePageWizard();
  const [_, setSearchParams] = useSearchParams();

  const onClose = useCallback((): void => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  }, [navigate, onCancel]);

  const onNext = useCallback(
    async (formData: object) => {
      if (activeStep === null) {
        return Promise.resolve();
      }

      if (!isPageWizardParentStep(activeStep) && activeStep.validate) {
        await activeStep.validate(formData, wizardData);
      }

      const isLastStep =
        activeStep?.id === visibleStepsFlattened[visibleStepsFlattened.length - 1]?.id;
      if (isLastStep) {
        return onSubmit(wizardData as T);
      }

      const activeStepIndex = visibleStepsFlattened.findIndex((step) => step.id === activeStep?.id);
      // If the next step is a parent step, mark its first substep as the next active step
      const nextStep = isPageWizardParentStep(visibleStepsFlattened[activeStepIndex + 1])
        ? visibleStepsFlattened[activeStepIndex + 2]
        : visibleStepsFlattened[activeStepIndex + 1];

      // Clear search params
      setSearchParams(new URLSearchParams(''));
      setWizardData((prev: object) => ({ ...prev, ...formData }));
      setStepData((prev) => ({ ...prev, [activeStep?.id]: formData }));
      setActiveStep(nextStep);
      return Promise.resolve();
    },
    [
      activeStep,
      onSubmit,
      setActiveStep,
      setSearchParams,
      setStepData,
      setWizardData,
      visibleStepsFlattened,
      wizardData,
    ]
  );

  const onBack = useCallback(() => {
    const activeStepIndex = visibleStepsFlattened.findIndex((step) => step.id === activeStep?.id);
    // If the previous step is a parent step, mark its first substep as the next active step
    const previousStep = isPageWizardParentStep(visibleStepsFlattened[activeStepIndex - 1])
      ? visibleStepsFlattened[activeStepIndex - 2]
      : visibleStepsFlattened[activeStepIndex - 1];
    // Clear search params
    setSearchParams(new URLSearchParams(''));
    setActiveStep(previousStep);
  }, [visibleStepsFlattened, setSearchParams, setActiveStep, activeStep?.id]);

  return (
    <>
      {activeStep !== null &&
        ('inputs' in activeStep ? (
          <PageForm
            key={activeStep.id}
            onSubmit={onNext}
            footer={<PageWizardFooter onBack={onBack} onCancel={onClose} />}
            defaultValue={stepData[activeStep.id]}
            errorAdapter={errorAdapter}
            disableGrid={disableGrid}
            isVertical={isVertical}
            singleColumn={singleColumn}
            isWizard
          >
            <StepErrors />
            {activeStep.inputs}
          </PageForm>
        ) : (
          <div
            data-cy={`wizard-section-${activeStep.id}`}
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <PageSection
              aria-label={t('Wizard step content')}
              hasOverflowScroll
              isFilled
              variant="light"
            >
              {activeStep?.element}
            </PageSection>
            <PageWizardFooter onNext={() => void onNext({})} onBack={onBack} onCancel={onClose} />
          </div>
        ))}
    </>
  );
}

function StepErrors() {
  const { activeStep, setStepError } = usePageWizard();
  const { errors } = useFormState();
  const formErrors = JSON.stringify(errors);

  useEffect(() => {
    if (Object.keys(errors).length === 0) {
      setStepError({});
    } else if (activeStep) {
      setStepError({ [activeStep.id]: errors });
    }
  }, [errors, activeStep, setStepError, formErrors]);

  return null;
}
