import { DefaultValues, FieldValues, SubmitHandler, useForm } from 'react-hook-form';

export type PageWizardProps<T extends FieldValues> = {
  steps: Step[];
  initialValues?: DefaultValues<T>;
  validationSchema?: Schema;
  onClose: () => void;
  onSubmit: SubmitHandler<FieldValues>;
};

export type Schema = {
  type: 'object';
  properties: {
    [stepId: string]: {
      type: 'object';
      properties: {
        [propertyId: string]: {
          type: string;
          errorMessage?: string;
          required?: string[];
          properties?: {
            [nestedPropertyId: string]: {
              type: string;
              errorMessage?: string;
            };
          };
        };
      };
      required?: string[];
    };
  };
};

export type Step = {
  name: string;
  id: string;
  isHidden?: boolean;
  children: React.ReactNode;
  nextButtonText?: string;
  validateAllSteps?: boolean;
  isNextDisabled?: (form: ReturnType<typeof useForm>) => boolean;
};
