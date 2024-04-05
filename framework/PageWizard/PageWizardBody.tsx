import { PageSection } from '@patternfly/react-core';
import { useCallback, useEffect } from 'react';
import { useFormState } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageForm } from '../PageForm/PageForm';
import { PageWizardFooter } from './PageWizardFooter';
import { usePageWizard, isStepVisible } from './PageWizardProvider';
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
    allSteps,
    setActiveStep,
    setStepData,
    setVisibleSteps,
    setWizardData,
    stepData,
    visibleSteps,
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
      const filteredSteps = allSteps.filter((step) =>
        isStepVisible(step, { ...wizardData, ...formData })
      );

      if (activeStep === null) {
        return Promise.resolve();
      }

      if (activeStep.validate) {
        await activeStep.validate(formData, wizardData);
      }

      const isLastStep = activeStep?.id === filteredSteps[filteredSteps.length - 1]?.id;
      if (isLastStep) {
        return onSubmit(wizardData as T);
      }

      const activeStepIndex = filteredSteps.findIndex((step) => step.id === activeStep?.id);
      const nextStep = filteredSteps[activeStepIndex + 1];

      // Clear search params
      setSearchParams(new URLSearchParams(''));
      setWizardData((prev: object) => ({ ...prev, ...formData }));
      setStepData((prev) => ({ ...prev, [activeStep?.id]: formData }));
      setVisibleSteps(filteredSteps);
      setActiveStep(nextStep);
      return Promise.resolve();
    },
    [
      activeStep,
      allSteps,
      onSubmit,
      setActiveStep,
      setSearchParams,
      setStepData,
      setVisibleSteps,
      setWizardData,
      wizardData,
    ]
  );

  const onBack = useCallback(() => {
    const activeStepIndex = visibleSteps.findIndex((step) => step.id === activeStep?.id);
    const previousStep = visibleSteps[activeStepIndex - 1];
    // Clear search params
    setSearchParams(new URLSearchParams(''));
    setActiveStep(previousStep);
  }, [visibleSteps, setSearchParams, setActiveStep, activeStep?.id]);

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
