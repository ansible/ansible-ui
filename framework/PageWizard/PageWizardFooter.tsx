import { ActionList, ActionListGroup, ActionListItem } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageFormSubmitButton } from '../PageForm/PageFormButtons';
import { isPageWizardParentStep, usePageWizard } from './PageWizardProvider';

export function PageWizardFooter(props: {
  onNext?: () => void;
  onBack: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const { activeStep, visibleStepsFlattened, setSubmitError } = usePageWizard();

  const isLastStep = activeStep?.id === visibleStepsFlattened[visibleStepsFlattened.length - 1].id;
  const nextButtonLabel = isLastStep ? t('Finish') : t('Next');

  const isFirstStep = isPageWizardParentStep(visibleStepsFlattened[0])
    ? activeStep?.id === visibleStepsFlattened[1].id
    : activeStep?.id === visibleStepsFlattened[0].id;
  const backClassName = isFirstStep
    ? 'pf-v6-c-button pf-m-disabled'
    : 'pf-v6-c-button pf-m-secondary';

  return (
    <footer className="pf-v6-c-wizard__footer" data-cy="wizard-footer" data-testid="wizard-footer">
      <ActionList>
        <ActionListGroup>
          <ActionListItem>
            {activeStep !== null && 'inputs' in activeStep ? (
              <PageFormSubmitButton style={{ minWidth: 10 }}>
                {nextButtonLabel}
              </PageFormSubmitButton>
            ) : (
              <button
                data-cy="wizard-next"
                data-testid="wizard-next"
                className="pf-v6-c-button pf-m-primary"
                type="submit"
                onClick={() => {
                  setSubmitError(undefined);
                  props.onNext?.();
                }}
              >
                {nextButtonLabel}
              </button>
            )}
          </ActionListItem>
          <ActionListItem>
            <button
              type="button"
              data-cy="wizard-back"
              data-testid="wizard-back"
              className={backClassName}
              disabled={isFirstStep}
              onClick={() => {
                setSubmitError(undefined);
                props.onBack?.();
              }}
            >
              {t('Back')}
            </button>
          </ActionListItem>
        </ActionListGroup>
        <ActionListItem>
          <div
            data-cy="wizard-cancel"
            data-testid="wizard-cancel"
            className="pf-v6-c-wizard__footer-cancel"
          >
            <button className="pf-v6-c-button pf-m-link" type="button" onClick={props.onCancel}>
              {t('Cancel')}
            </button>
          </div>
        </ActionListItem>
      </ActionList>
    </footer>
  );
}
