import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { PageWizardContext } from './PageWizardProvider';
import { PageFormSubmitButton } from '../PageForm/PageForm';

export default function PageWizardFooter(props: {
  onNext?: () => void;
  onBack: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const { activeStep, steps } = useContext(PageWizardContext);

  const isLastStep = activeStep?.id === steps[steps.length - 1].id;
  const nextButtonLabel = isLastStep ? t('Finish') : t('Next');

  const isFirstStep = activeStep?.id === steps[0].id;
  const backClassName = isFirstStep ? 'pf-c-button pf-m-disabled' : 'pf-c-button pf-m-secondary';

  return (
    <footer
      className="pf-c-wizard__footer"
      data-cy="wizard-footer"
      style={{ borderTop: 'thin solid var(--pf-global--BorderColor--100)' }}
    >
      {activeStep !== null && 'inputs' in activeStep ? (
        <PageFormSubmitButton style={{ minWidth: 10 }}>{nextButtonLabel}</PageFormSubmitButton>
      ) : (
        <button
          data-cy="wizard-next"
          className="pf-c-button pf-m-primary"
          type="submit"
          onClick={props.onNext}
        >
          {nextButtonLabel}
        </button>
      )}
      <button
        type="button"
        data-cy="wizard-back"
        className={backClassName}
        disabled={isFirstStep}
        onClick={props.onBack}
      >
        {t('Back')}
      </button>
      <div data-cy="wizard-cancel" className="pf-c-wizard__footer-cancel">
        <button className="pf-c-button pf-m-link" type="button" onClick={props.onCancel}>
          {t('Cancel')}
        </button>
      </div>
    </footer>
  );
}
