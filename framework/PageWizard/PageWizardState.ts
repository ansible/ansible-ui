import { Dispatch, SetStateAction } from 'react';
import { PageWizardStep } from './types';

export interface PageWizardState<DataT extends NonNullable<object> = object> {
  steps: PageWizardStep[];

  visibleSteps: PageWizardStep[]; // Top-level visible steps (including parent steps of substeps)
  visibleStepsFlattened: PageWizardStep[]; // Flattened list containing all visible steps including substeps

  activeStep: PageWizardStep | null;
  setActiveStep: (step: PageWizardStep) => void;

  /**
   * Data for the wizard.
   * This is created as each step finishes by merging the submitted data from each step.
   */
  wizardData: DataT;
  setWizardData: Dispatch<SetStateAction<DataT>>;

  /**
   * Data for each step in the wizard.
   * Is it a partial because each step can have part of the data.
   */
  stepData: { [stepID: string]: Partial<DataT> };
  setStepData: Dispatch<SetStateAction<{ [stepID: string]: Partial<DataT> }>>;

  stepError: Record<string, object>;
  setStepError: Dispatch<SetStateAction<Record<string, object>>>;

  onNext: (stepData: Partial<DataT>) => Promise<void>;
  onBack: () => void;

  isSubmitting: boolean;

  submitError?: Error | undefined;
  setSubmitError: Dispatch<SetStateAction<Error | undefined>>;

  /**
   * Indicates if the wizard navigation is expanded or collapsed.
   * PatternFly shows the navigation toggle when on small screens.
   */
  isToggleExpanded: boolean;
  setToggleExpanded: (update: (toggleNavExpanded: boolean) => boolean) => void;
}
