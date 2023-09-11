import { createContext, useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageForm } from '../../../../framework/PageForm/PageForm';

export interface IPageWizardStep {
  id: string;
  label: string;
  element: React.ReactNode;
}

interface PageWizardState {
  activeStep?: IPageWizardStep;
  steps: IPageWizardStep[];
  stepsValid?: Record<string, boolean | undefined>;
  setStepsValid?: (
    update: (stepsValid: Record<string, boolean | undefined>) => Record<string, boolean | undefined>
  ) => void;
}

const PageWizardContext = createContext<PageWizardState>({});

export function PageWizard(props: {
  steps: IPageWizardStep[];
  onCancel?: () => void;
  onSubmit: () => void;
}) {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<IPageWizardStep>(props.steps[0]);
  const [stepsValid, setStepsValid] = useState<Record<string, boolean | undefined>>({});
  const onNext = useCallback(() => {
    const index = props.steps.indexOf(activeStep);
    setActiveStep(props.steps[index + 1]);
    return Promise.resolve();
  }, [activeStep, props.steps]);
  const onCancel = useCallback(() => props.onCancel ?? navigate(-1), [navigate, props.onCancel]);
  return (
    <PageWizardContext.Provider
      value={{
        activeStep,
        steps: props.steps,
        stepsValid,
        setStepsValid,
      }}
    >
      <div className="pf-c-wizard pf-c-wizard__outer-wrap">
        <PageWizardNavigation steps={props.steps} />
        <PageForm key={activeStep.id} onSubmit={onNext} disableBody disableButtons>
          {activeStep.element}
          <PageWizardFooter onCancel={onCancel} />
        </PageForm>
        <PageWizardFooter onCancel={onCancel} />
      </div>
    </PageWizardContext.Provider>
  );
}

export function PageWizardNavigation(props: { steps: IPageWizardStep[] }) {
  return (
    <nav className="pf-c-wizard__nav" aria-label="Steps">
      <ol className="pf-c-wizard__nav-list">
        {props.steps.map((step) => {
          let className = 'pf-c-wizard__nav-link'; // eslint-disable-line i18next/no-literal-string
          if (step.id === 'name') className += ' pf-m-current'; // eslint-disable-line i18next/no-literal-string
          return (
            <li className="pf-c-wizard__nav-item" key={step.id}>
              <button className={className}>{step.label}</button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function PageWizardFooter(props: { onCancel: () => void }) {
  const { t } = useTranslation();
  const { activeStep, steps, stepsValid } = useContext(PageWizardContext);

  const isLastStep = activeStep?.id === steps[steps.length - 1].id;
  const nextClassName = 'pf-c-button pf-m-primary';
  const nextButtonLabel = isLastStep ? t('Finish') : t('Next');

  const isFirstStep = activeStep?.id === steps[0].id;
  const backClassName = isFirstStep ? 'pf-c-button pf-m-disabled' : 'pf-c-button pf-m-secondary';

  return (
    <footer className="pf-c-wizard__footer">
      <button className={nextClassName} type="submit">
        {nextButtonLabel}
      </button>
      <button className={backClassName} type="button">
        {t('Back')}
      </button>
      <div className="pf-c-wizard__footer-cancel">
        <button className="pf-c-button pf-m-link" type="button" onClick={props.onCancel}>
          {t('Cancel')}
        </button>
      </div>
    </footer>
  );
}
