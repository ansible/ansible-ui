import { PageSection } from '@patternfly/react-core';
import { useCallback, useEffect } from 'react';
import { useFormState } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { PageForm } from '../PageForm/PageForm';
import { ErrorAdapter } from '../PageForm/typesErrorAdapter';
import { PageWizardFooter } from './PageWizardFooter';
import { usePageWizard } from './PageWizardProvider';

export function PageWizardBody<T>(props: {
  onCancel?: () => void;
  onSubmit: (wizardData: T) => Promise<void>;
  errorAdapter?: ErrorAdapter;
  isVertical?: boolean;
  singleColumn?: boolean;
}) {
  const navigate = useNavigate();
  const { onSubmit, onCancel, errorAdapter } = props;
  const { activeStep, steps, stepData, wizardData, setWizardData, setStepData, setActiveStep } =
    usePageWizard();

  const onClose = useCallback((): void => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  }, [navigate, onCancel]);

  const onNext = useCallback(
    (formData: object) => {
      if (activeStep !== null) {
        const isLastStep = activeStep?.id === steps[steps.length - 1].id;
        if (isLastStep) {
          return onSubmit(wizardData as T);
        }

        const activeStepIndex = steps.findIndex((step) => step.id === activeStep?.id);
        const nextStep = steps[activeStepIndex + 1];

        setWizardData((prev: object) => ({ ...prev, ...formData }));
        setStepData((prev) => ({ ...prev, [activeStep?.id]: formData }));

        setActiveStep(nextStep);
      }
      return Promise.resolve();
    },
    [activeStep, wizardData, onSubmit, steps, setWizardData, setStepData, setActiveStep]
  );

  const onBack = useCallback(() => {
    const activeStepIndex = steps.findIndex((step) => step.id === activeStep?.id);
    const previousStep = steps[activeStepIndex - 1];

    setActiveStep(previousStep);
  }, [activeStep, steps, setActiveStep]);

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
            isVertical={props.isVertical}
            singleColumn={props.singleColumn}
          >
            <StepErrors />
            {activeStep.inputs}
          </PageForm>
        ) : (
          <div
            data-cy={`wizard-section-${activeStep.id}`}
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <PageSection variant="light" isFilled hasOverflowScroll>
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
