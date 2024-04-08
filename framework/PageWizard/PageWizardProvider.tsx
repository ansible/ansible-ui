import { createContext, ReactNode, useState, useEffect, useContext, useMemo } from 'react';

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
}) {
  const [isToggleExpanded, setToggleExpanded] = useState(false);
  const [activeStep, setActiveStep] = useState<PageWizardStep | null>(null);
  const [wizardData, setWizardData] = useState<Partial<T>>({});
  const [stepData, setStepData] = useState<Record<string, object>>(props.defaultValue ?? {});
  const [stepError, setStepError] = useState<Record<string, object>>({});
  const [visibleSteps, setVisibleSteps] = useState<PageWizardStep[]>(() => {
    return props.steps.filter((step) => isStepVisible(step, wizardData));
  });
  const allSteps = useMemo(() => {
    return props.steps.reduce((acc: PageWizardStep[], step) => {
      acc.push(step);
      if (isPageWizardParentStep(step)) {
        acc.push(...step.substeps);
      }
      return acc;
    }, []);
  }, [props.steps]);
  const [visibleStepsFlattened, setVisibleStepsFlattened] = useState<PageWizardStep[]>(() => {
    return allSteps.filter((step) => isStepVisible(step, wizardData));
  });

  useEffect(() => {
    if (!activeStep && visibleSteps.length > 0) {
      if ((visibleSteps[0] as PageWizardParentStep).substeps) {
        setActiveStep((visibleSteps[0] as PageWizardParentStep).substeps[0]);
      } else {
        setActiveStep(visibleSteps[0]);
      }
    }
  }, [activeStep, visibleSteps]);

  useEffect(() => {
    if (visibleSteps.length) {
      const flattened = visibleSteps.reduce((acc: PageWizardStep[], step) => {
        acc.push(step);
        if (isPageWizardParentStep(step)) {
          acc.push(...step.substeps);
        }
        return acc;
      }, []);
      setVisibleStepsFlattened(flattened);
    }
  }, [visibleSteps]);

  return (
    <PageWizardContext.Provider
      value={{
        wizardData,
        setWizardData: setWizardData,
        stepData,
        setStepData: setStepData,
        allSteps: allSteps,
        visibleSteps,
        setVisibleSteps: setVisibleSteps,
        visibleStepsFlattened: visibleStepsFlattened,
        setVisibleStepsFlattened: setVisibleStepsFlattened,
        activeStep,
        setActiveStep: setActiveStep,
        stepError,
        setStepError: setStepError,
        isToggleExpanded: isToggleExpanded,
        setToggleExpanded: setToggleExpanded,
      }}
    >
      {props.children}
    </PageWizardContext.Provider>
  );
}
