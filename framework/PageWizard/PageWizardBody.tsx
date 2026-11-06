import { Alert, Bullseye, PageSection, Spinner } from '@patternfly/react-core';
import { t } from 'i18next';
import { useCallback, useEffect } from 'react';
import { useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
  optionsData,
}: PageWizardBody) {
  const navigate = useNavigate();
  const { activeStep, stepData, onNext, onBack, submitError, isSubmitting } = usePageWizard();

  const onClose = useCallback((): void => {
    if (onCancel) {
      onCancel();
    } else {
      void navigate(-1);
    }
  }, [navigate, onCancel]);

  if (isSubmitting) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

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
            optionsData={optionsData}
            isWizard
          >
            <StepErrors />
            {activeStep.inputs}
          </PageForm>
        ) : (
          <div
            data-cy={`wizard-section-${activeStep.id}`}
            data-testid={`wizard-section-${activeStep.id}`}
            style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}
          >
            <PageSection
              hasBodyWrapper={false}
              aria-label={t('Wizard step content')}
              hasOverflowScroll
              isFilled
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
  const error = props.error as Error & { json?: Record<string, string> };
  if (!props.error) return null;
  if (!(props.error instanceof Error)) {
    if (typeof props.error === 'string') {
      return <Alert variant="danger" title={props.error} />;
    }
    return <Alert variant="danger" title={t('An error occurred.')} />;
  }
  if ('message' in props.error && !error.json) {
    return <Alert variant="danger" title={props.error.message} />;
  }
  if (error.json) {
    const messageOccurrences = new Map<string, number>();
    const titlePrefix = `${error.message}: `;
    const messages = Object.entries(error.json).flatMap(([field, value]) =>
      value.split('\n').map((message) => {
        const messageKey = `${field}:${message}`;
        const occurrence = messageOccurrences.get(messageKey) ?? 0;
        messageOccurrences.set(messageKey, occurrence + 1);
        return {
          key: `${messageKey}:${occurrence}`,
          value: message.startsWith(titlePrefix) ? message.slice(titlePrefix.length) : message,
        };
      })
    );
    return (
      <Alert variant="danger" title={error.message} isInline>
        {messages.length > 1 ? (
          <ul>
            {messages.map((message) => (
              <li key={message.key}>{message.value}</li>
            ))}
          </ul>
        ) : (
          messages.map((message) => <div key={message.key}>{message.value}</div>)
        )}
      </Alert>
    );
  }
}
