import { SetStateAction } from 'react';
import { ErrorAdapter } from '../PageForm/typesErrorAdapter';

export interface PageWizardStep {
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
  allSteps: PageWizardStep[];
  visibleSteps: PageWizardStep[];
  setVisibleSteps: (steps: PageWizardStep[]) => void;
  wizardData: object;
}

export interface PageWizardBody<T> {
  onCancel?: () => void;
  onSubmit: (wizardData: T) => Promise<void>;
  errorAdapter?: ErrorAdapter;
  disableGrid?: boolean;
  isVertical?: boolean;
  singleColumn?: boolean;
}
