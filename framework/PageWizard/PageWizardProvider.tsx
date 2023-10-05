import { createContext, ReactNode, useState, useMemo, useEffect } from 'react';

import type { PageWizardStep, PageWizardState } from './types';

export const PageWizardContext = createContext<PageWizardState>({} as PageWizardState);

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

  const visibleSteps = useMemo(() => {
    function isVisible(step: PageWizardStep, values: Partial<T>) {
      if (!step.hidden) {
        return step;
      }

      if (!step.hidden(values)) {
        return step;
      } else {
        return null;
      }
    }

    return props.steps.filter((step) => isVisible(step, wizardData));
  }, [props.steps, wizardData]);

  useEffect(() => {
    if (!activeStep && visibleSteps.length > 0) {
      setActiveStep(visibleSteps[0]);
    }
  }, [activeStep, visibleSteps]);

  return (
    <PageWizardContext.Provider
      value={{
        wizardData,
        setWizardData: setWizardData,
        stepData,
        setStepData: setStepData,
        steps: visibleSteps,
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
