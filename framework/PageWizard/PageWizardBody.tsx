import { Alert, PageSection } from '@patternfly/react-core';
import { t } from 'i18next';
import { useCallback, useEffect } from 'react';
import { useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { RequestError } from '../../frontend/common/crud/RequestError';
import { PageForm } from '../PageForm/PageForm';
import { PageLayout } from '../PageLayout';
import { PageWizardFooter } from './PageWizardFooter';
import { usePageWizard } from './PageWizardProvider';
import type { PageWizardBody } from './types';

export function PageWizardBody({
  onCancel,
  disableGrid,
  errorAdapter,
  isVertical,
  singleColumn,
}: PageWizardBody) {
  const navigate = useNavigate();
  const { activeStep, stepData, onNext, onBack, submitError } = usePageWizard();

  const onClose = useCallback((): void => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  }, [navigate, onCancel]);

  return (
    <PageLayout>
      <RequestErrorAlert error={submitError} />
      {activeStep !== null &&
        ('inputs' in activeStep ? (
          <PageForm
            key={activeStep.id}
            onSubmit={onNext}
            footer={<PageWizardFooter onBack={onBack} onCancel={onClose} />}
            defaultValue={stepData[activeStep.id]}
            errorAdapter={errorAdapter}
            disableGrid={disableGrid}
            isVertical={isVertical}
            singleColumn={singleColumn}
            isWizard
          >
            <StepErrors />
            {activeStep.inputs}
          </PageForm>
        ) : (
          <div
            data-cy={`wizard-section-${activeStep.id}`}
            style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}
          >
            <PageSection
              aria-label={t('Wizard step content')}
              hasOverflowScroll
              isFilled
              variant="light"
            >
              {activeStep?.element}
            </PageSection>
            <PageWizardFooter onNext={() => void onNext({})} onBack={onBack} onCancel={onClose} />
          </div>
        ))}
    </PageLayout>
  );
}

function StepErrors() {
  const { activeStep, setStepError } = usePageWizard();
  const { errors } = useFormState();
  const formErrors = JSON.stringify(errors);

  useEffect(() => {
    if (Object.keys(errors).length === 0) {
      setStepError({});
    } else if (activeStep) {
      setStepError({ [activeStep.id]: errors });
    }
  }, [errors, activeStep, setStepError, formErrors]);

  return null;
}

function RequestErrorAlert(props: { error?: unknown }) {
  const { t } = useTranslation();
  if (!props.error) return null;
  if (!(props.error instanceof Error)) {
    if (typeof props.error === 'string') {
      return <Alert variant="danger" title={props.error} />;
    }
    return <Alert variant="danger" title={t('An error occurred.')} />;
  }
  if (!(props.error instanceof RequestError)) {
    return <Alert variant="danger" title={props.error.message} />;
  }
  return (
    <Alert variant="danger" title={props.error.message} isInline>
      {Object.values(props.error.json ?? {}).map((value, index) => (
        <div key={index}>{value}</div>
      ))}
    </Alert>
  );
}
