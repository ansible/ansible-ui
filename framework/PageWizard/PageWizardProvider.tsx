import {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from 'react';
import { useURLSearchParams } from '../components/useURLSearchParams';
import type { PageWizardStep, PageWizardState, PageWizardParentStep } from './types';

export const PageWizardContext = createContext<PageWizardState>({} as PageWizardState);
export function usePageWizard() {
  return useContext(PageWizardContext);
}

export function isStepVisible(step: PageWizardStep, values: object) {
  return !step.hidden || !step.hidden(values) ? step : null;
}

export function isPageWizardParentStep(step: PageWizardStep): step is PageWizardParentStep {
  return (step as PageWizardParentStep)?.substeps !== undefined;
}

export function PageWizardProvider<T extends object>(props: {
  children: ReactNode;
  steps: PageWizardStep[];
  defaultValue?: Record<string, object>;
  onSubmit: (wizardData: T) => Promise<void>;
}) {
  const { steps, onSubmit } = props;
  const [isToggleExpanded, setToggleExpanded] = useState(false);
  const [activeStep, setActiveStep] = useState<PageWizardStep | null>(null);
  const [wizardData, setWizardData] = useState<Partial<T>>({});
  const [stepData, setStepData] = useState<Record<string, object>>(props.defaultValue ?? {});
  const [stepError, setStepError] = useState<Record<string, object>>({});
  const [submitError, setSubmitError] = useState<Error>();

  const [_, setSearchParams] = useURLSearchParams();
  const flattenedSteps = useMemo(() => getFlattenedSteps(steps), [steps]);

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
    [activeStep, steps, onSubmit, setSearchParams, wizardData]
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

  return (
    <PageWizardContext.Provider
      value={{
        wizardData,
        setWizardData: setWizardData,
        stepData,
        setStepData: setStepData,
        steps: props.steps,
        visibleSteps: getVisibleSteps(steps, wizardData),
        visibleStepsFlattened: getVisibleStepsFlattened(steps, wizardData),
        activeStep,
        setActiveStep: setActiveStep,
        stepError,
        setStepError: setStepError,
        submitError,
        setSubmitError: setSubmitError,
        isToggleExpanded: isToggleExpanded,
        setToggleExpanded: setToggleExpanded,
        onNext,
        onBack,
      }}
    >
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
