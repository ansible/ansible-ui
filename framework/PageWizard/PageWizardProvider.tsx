import { t } from 'i18next';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useURLSearchParams } from '../components/useURLSearchParams';
import type { PageWizardState } from './PageWizardState';
import type { PageWizardParentStep, PageWizardStep } from './types';

export const PageWizardContext = createContext<PageWizardState>({} as PageWizardState);

export function usePageWizard<DataT extends NonNullable<object> = object>() {
  return useContext(PageWizardContext) as unknown as PageWizardState<DataT>;
}

export function isStepVisible(step: PageWizardStep, values: object) {
  return !step.hidden || !step.hidden(values) ? step : null;
}

export function isPageWizardParentStep(step: PageWizardStep): step is PageWizardParentStep {
  return (step as PageWizardParentStep)?.substeps !== undefined;
}

export function PageWizardProvider<DataT extends NonNullable<object>>(props: {
  children: ReactNode;

  /** An array of steps to be rendered in the wizard. */
  steps: PageWizardStep[];

  /** An object with default values for each step, using the step ID as the key. */
  stepDefaults?: { [stepID: string]: Partial<DataT> };

  /** A function that will be called when the wizard is submitted with the final data. */
  onSubmit: (wizardData: DataT) => Promise<void>;
}) {
  const { steps, onSubmit } = props;
  const [isToggleExpanded, setToggleExpanded] = useState(false);
  const [activeStep, setActiveStep] = useState<PageWizardStep | null>(null);
  const [wizardData, setWizardData] = useState<DataT>({} as DataT);
  const [stepData, setStepData] = useState<{ [stepID: string]: Partial<DataT> }>(
    props.stepDefaults ?? {}
  );
  const [stepError, setStepError] = useState<Record<string, object>>({});
  const [submitError, setSubmitError] = useState<Error>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [_, setSearchParams] = useURLSearchParams();
  const flattenedSteps = useMemo(() => getFlattenedSteps(steps), [steps]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      for (const key in props.stepDefaults) {
        if (!steps.find((step) => step.id === key)) {
          // eslint-disable-next-line no-console
          console.warn(`PageWizardProvider: defaultValue key '${key}' not found in steps.`);
        }
      }
    }
  }, [props.stepDefaults, steps]);

  // set initial activeStep
  useEffect(() => {
    const visibleSteps = getVisibleSteps(steps, wizardData);
    if (activeStep || !visibleSteps.length) {
      return;
    }
    if ((visibleSteps[0] as PageWizardParentStep).substeps) {
      setActiveStep((visibleSteps[0] as PageWizardParentStep).substeps[0]);
    } else {
      setActiveStep(visibleSteps[0]);
    }
  }, [activeStep, steps, wizardData]);

  const onNext = useCallback(
    async (formData: object = {}) => {
      const visibleStepsFlattened = getVisibleStepsFlattened(steps, {
        ...wizardData,
        ...formData,
      });

      if (activeStep === null) {
        return Promise.resolve();
      }

      if (!isPageWizardParentStep(activeStep) && activeStep.validate) {
        await activeStep.validate(formData, wizardData);
      }

      const isLastStep =
        activeStep?.id === visibleStepsFlattened[visibleStepsFlattened.length - 1]?.id;
      if (isLastStep) {
        setIsSubmitting(true);
        try {
          await onSubmit(wizardData);
        } catch (e) {
          setSubmitError(e instanceof Error ? e : new Error(t('An error occurred.')));
        } finally {
          setIsSubmitting(false);
        }
        return;
      }

      const activeStepIndex = visibleStepsFlattened.findIndex((step) => step.id === activeStep?.id);
      // If the next step is a parent step, mark its first substep as the next active step
      const nextStep = isPageWizardParentStep(visibleStepsFlattened[activeStepIndex + 1])
        ? visibleStepsFlattened[activeStepIndex + 2]
        : visibleStepsFlattened[activeStepIndex + 1];

      // Clear search params
      setSearchParams(new URLSearchParams(''));
      setWizardData((prev) => ({ ...prev, ...formData }));
      setStepData((prev) => ({ ...prev, [activeStep?.id]: formData }));
      setActiveStep(nextStep);
      return Promise.resolve();
    },
    [activeStep, steps, onSubmit, setSearchParams, wizardData, setSubmitError]
  );

  const onBack = useCallback(() => {
    const visibleStepsFlattened = getVisibleSteps(flattenedSteps, wizardData);

    const activeStepIndex = visibleStepsFlattened.findIndex((step) => step.id === activeStep?.id);
    const previousStep = isPageWizardParentStep(visibleStepsFlattened[activeStepIndex - 1])
      ? visibleStepsFlattened[activeStepIndex - 2]
      : visibleStepsFlattened[activeStepIndex - 1];
    // Clear search params
    setSearchParams(new URLSearchParams(''));
    setActiveStep(previousStep);
  }, [activeStep?.id, flattenedSteps, setSearchParams, wizardData]);

  const contextValue = useMemo(
    () => ({
      wizardData,
      setWizardData,
      stepData,
      setStepData,
      steps: props.steps,
      visibleSteps: getVisibleSteps(steps, wizardData),
      visibleStepsFlattened: getVisibleStepsFlattened(steps, wizardData),
      activeStep,
      setActiveStep,
      stepError,
      setStepError,
      submitError,
      setSubmitError,
      isToggleExpanded,
      setToggleExpanded,
      onNext,
      onBack,
      isSubmitting,
    }),
    [
      wizardData,
      setWizardData,
      stepData,
      setStepData,
      props.steps,
      steps,
      activeStep,
      setActiveStep,
      stepError,
      setStepError,
      submitError,
      setSubmitError,
      isToggleExpanded,
      setToggleExpanded,
      onNext,
      onBack,
      isSubmitting,
    ]
  );

  return (
    <PageWizardContext.Provider value={contextValue as PageWizardState<object>}>
      {props.children}
    </PageWizardContext.Provider>
  );
}

function getFlattenedSteps(steps: PageWizardStep[]) {
  return steps.reduce((acc: PageWizardStep[], step) => {
    acc.push(step);
    if (isPageWizardParentStep(step)) {
      acc.push(...step.substeps);
    }
    return acc;
  }, []);
}

function getVisibleSteps(steps: PageWizardStep[], wizardData: object) {
  return steps.filter((step) => isStepVisible(step, wizardData));
}

function getVisibleStepsFlattened(steps: PageWizardStep[], wizardData: object) {
  const visibleSteps = getVisibleSteps(steps, wizardData);

  return visibleSteps.reduce((acc: PageWizardStep[], step) => {
    acc.push(step);
    if (isPageWizardParentStep(step)) {
      acc.push(...step.substeps);
    }
    return acc;
  }, []);
}
