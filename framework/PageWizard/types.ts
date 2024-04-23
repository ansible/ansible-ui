import { SetStateAction } from 'react';
import { ErrorAdapter } from '../PageForm/typesErrorAdapter';

export interface PageWizardBasicStep {
  id: string;
  label: string;
  inputs?: React.ReactNode;
  element?: React.ReactNode;
  hidden?: (wizardData: object) => boolean;
  /*
    Validate is called before proceeding to the next step. If it throws an
    error, the wizard will stay on the current step and pass the error to
    the wizard's errorAdapter for handling.
  */
  validate?: (formData: object, wizardData: object) => Promise<void> | void;
}

/** Type used to define parent steps. */
export interface PageWizardParentStep extends Omit<PageWizardBasicStep, 'inputs' | 'validate'> {
  substeps: [PageWizardBasicStep, ...PageWizardBasicStep[]];
}

export type PageWizardStep = PageWizardBasicStep | PageWizardParentStep;

export interface PageWizardState {
  activeStep: PageWizardStep | null;
  isToggleExpanded: boolean;
  setActiveStep: (step: PageWizardStep) => void;
  setStepData: React.Dispatch<SetStateAction<Record<string, object>>>;
  setStepError: React.Dispatch<SetStateAction<Record<string, object>>>;
  setToggleExpanded: (update: (toggleNavExpanded: boolean) => boolean) => void;
  setWizardData: (data: object) => void;
  stepData: Record<string, object>;
  stepError: Record<string, object>;
  steps: PageWizardStep[];
  // Top-level visible steps (including parent steps of substeps)
  visibleSteps: PageWizardStep[];
  // Flattened list containing all visible steps including substeps
  visibleStepsFlattened: PageWizardStep[];
  wizardData: object;
  onNext: (formState: object) => Promise<void>;
  onBack: () => void;
  submitError?: Error | undefined;
  setSubmitError: React.Dispatch<SetStateAction<Error | undefined>>;
}

export interface PageWizardBody {
  onCancel?: () => void;
  errorAdapter?: ErrorAdapter;
  disableGrid?: boolean;
  isVertical?: boolean;
  singleColumn?: boolean;
}
