import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wizard, WizardStep, WizardStepType } from '@patternfly/react-core/next';
import { FieldValues, Form, FormProvider, Path, Resolver, useForm } from 'react-hook-form';
import { useStepValidation } from './useStepValidation';
import type { Step, PageWizardProps } from './types';

export function PageWizard<T extends FieldValues>(props: PageWizardProps<T>) {
  const { t } = useTranslation();
  const [visitedSteps, setVisitedSteps] = useState<string[]>([]);
  const { onSubmit, onClose, validationSchema, steps = [], initialValues } = props;

  const resolver: Resolver<T> | undefined = useStepValidation({
    validationSchema,
    steps,
    visitedSteps,
  });

  const form = useForm<T>({
    defaultValues: initialValues,
    resolver,
  }) as ReturnType<typeof useForm>;

  function hasStepError(step: Step) {
    return Boolean(form.getFieldState(step.id as Path<T>).error);
  }

  const handleStepChange = (
    _: React.MouseEvent<HTMLElement, MouseEvent>,
    currentStep: WizardStepType & { validateAllSteps?: boolean },
    prevStep: WizardStepType
  ) => {
    if (currentStep.validateAllSteps) {
      setVisitedSteps([
        ...new Set([...visitedSteps, prevStep.id.toString(), currentStep.id.toString()]),
      ]);
    } else {
      setVisitedSteps([...new Set([...visitedSteps, prevStep.id.toString()])]);
    }
  };

  return (
    <FormProvider {...form}>
      <Form
        className="pf-c-form"
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          gap: 0,
        }}
      >
        <Wizard
          onClose={onClose}
          onSave={form.handleSubmit(onSubmit)}
          onStepChange={handleStepChange}
        >
          {steps.map((step) => {
            if (step.isHidden) return null;
            return (
              <WizardStep
                key={step.id}
                status={hasStepError(step) ? 'error' : 'default'}
                footer={{
                  nextButtonText: step?.nextButtonText ?? t`Next`,
                  isNextDisabled: step?.isNextDisabled?.(form),
                }}
                {...step}
              />
            );
          })}
        </Wizard>
      </Form>
    </FormProvider>
  );
}
