import { ErrorAdapter } from '../PageForm/typesErrorAdapter';
import { PageFormOptionsData } from '../PageForm/PageFormOptionsContext';

export interface PageWizardBasicStep {
  id: string;
  idOfparentStep?: string /*This is used to index PageWizard Stepdata, or wizardData, set data on a nested step field.   */;
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

export interface PageWizardBody {
  onCancel?: () => void;
  errorAdapter?: ErrorAdapter;
  disableGrid?: boolean;
  isVertical?: boolean;
  singleColumn?: boolean;
  /**
   * OPTIONS response data forwarded into the wizard's internal PageForm, so
   * step inputs can auto-discover validation patterns the same way a
   * standalone PageForm's inputs do. Only useful when every step of the
   * wizard concerns the same backend resource - see PageFormOptionsContext
   * for composing metadata from multiple resources within a step.
   */
  optionsData?: PageFormOptionsData;
}
