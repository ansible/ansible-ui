import { useTranslation } from 'react-i18next';
import { PageFormSubmitButton } from '../PageForm/PageFormButtons';
import { usePageWizard } from './PageWizardProvider';

export function PageWizardFooter(props: {
  onNext?: () => void;
  onBack: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const { activeStep, visibleSteps } = usePageWizard();

  const isLastStep = activeStep?.id === visibleSteps[visibleSteps.length - 1].id;
  const nextButtonLabel = isLastStep ? t('Finish') : t('Next');

  const isFirstStep = activeStep?.id === visibleSteps[0].id;
  const backClassName = isFirstStep
    ? 'pf-v5-c-button pf-m-disabled'
    : 'pf-v5-c-button pf-m-secondary';

  return (
    <footer className="pf-v5-c-wizard__footer border-top bg-lighten" data-cy="wizard-footer">
      {activeStep !== null && 'inputs' in activeStep ? (
        <PageFormSubmitButton style={{ minWidth: 10 }}>{nextButtonLabel}</PageFormSubmitButton>
      ) : (
        <button
          data-cy="wizard-next"
          className="pf-v5-c-button pf-m-primary"
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
      <div data-cy="wizard-cancel" className="pf-v5-c-wizard__footer-cancel">
        <button className="pf-v5-c-button pf-m-link" type="button" onClick={props.onCancel}>
          {t('Cancel')}
        </button>
      </div>
    </footer>
  );
}
