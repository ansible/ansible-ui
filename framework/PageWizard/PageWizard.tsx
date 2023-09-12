import '@patternfly/patternfly/components/Wizard/wizard.css';
import { PageSection } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Wizard/wizard';
import { createContext, useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageForm, PageFormSubmitButton } from '../PageForm/PageForm';
import { Scrollable } from '../components/Scrollable';

export interface PageWizardStep {
  id: string;
  label: string;
  inputs?: React.ReactNode;
  element?: React.ReactNode;
}

interface PageWizardState {
  activeStep: PageWizardStep;
  steps: PageWizardStep[];
  stepsValid?: Record<string, boolean | undefined>;
  setStepsValid?: (
    update: (stepsValid: Record<string, boolean | undefined>) => Record<string, boolean | undefined>
  ) => void;
  isToggleExpanded: boolean;
  setToggleExpanded: (update: (toggleNavExpanded: boolean) => boolean) => void;
}

const PageWizardContext = createContext<PageWizardState>({} as PageWizardState);

export function PageWizard(props: {
  steps: PageWizardStep[];
  onCancel?: () => void;
  onSubmit: () => void;
}) {
  const navigate = useNavigate();
  const [isToggleExpanded, setToggleExpanded] = useState(false);
  const [activeStep, setActiveStep] = useState<PageWizardStep>(props.steps[0]);
  const [stepsValid, setStepsValid] = useState<Record<string, boolean | undefined>>({});

  const onNext = useCallback(() => {
    const index = props.steps.indexOf(activeStep);
    setActiveStep(props.steps[index + 1]);
    return Promise.resolve();
  }, [activeStep, props.steps]);

  const onBack = useCallback(() => {
    const index = props.steps.indexOf(activeStep);
    setActiveStep(props.steps[index - 1]);
  }, [activeStep, props.steps]);

  const onCancel = useCallback(() => props.onCancel ?? navigate(-1), [navigate, props.onCancel]);

  return (
    <PageWizardContext.Provider
      value={{
        activeStep,
        steps: props.steps,
        stepsValid,
        setStepsValid,
        isToggleExpanded: isToggleExpanded,
        setToggleExpanded: setToggleExpanded,
      }}
    >
      <div
        className="pf-c-wizard"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          maxHeight: '100%',
          overflow: 'hidden',
        }}
      >
        <PageWizardToggle />
        <div
          className="pf-c-wizard__outer-wrap"
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          <PageWizardNavigation />
          {/* <main className="pf-c-wizard__main"> */}
          {'inputs' in activeStep ? (
            <PageForm
              key={activeStep.id}
              onSubmit={onNext}
              footer={<PageWizardFooter onBack={onBack} onCancel={onCancel} />}
              disableBody
            >
              {activeStep.inputs}
            </PageForm>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <PageSection variant="light" isFilled hasOverflowScroll>
                {activeStep.element}
              </PageSection>
              <PageWizardFooter onNext={() => void onNext()} onBack={onBack} onCancel={onCancel} />
            </div>
          )}
          {/* </main> */}
        </div>
      </div>
    </PageWizardContext.Provider>
  );
}

export function PageWizardBody(props: { children: React.ReactNode }) {
  return (
    <Scrollable>
      <div className="pf-c-wizard__main-body">{props.children}</div>
    </Scrollable>
  );
}

export function PageWizardToggle() {
  const { activeStep, isToggleExpanded, setToggleExpanded } = useContext(PageWizardContext);
  const toggleNavExpanded = useCallback(
    () => setToggleExpanded((isNavExpanded) => !isNavExpanded),
    [setToggleExpanded]
  );
  return (
    <button
      onClick={toggleNavExpanded}
      className={css(styles.wizardToggle, isToggleExpanded && 'pf-m-expanded')}
      // aria-label={ariaLabel}
      aria-expanded={isToggleExpanded}
    >
      <span className={css(styles.wizardToggleList)}>
        <span className={css(styles.wizardToggleListItem)}>
          <span className={css(styles.wizardToggleNum)}>{1}</span> {activeStep?.label}
          {/* {isActiveSubStep && (
            <AngleRightIcon className={css(styles.wizardToggleSeparator)} aria-hidden="true" />
          )} */}
        </span>
        {/* {isActiveSubStep && (
          <span className={css(styles.wizardToggleListItem)}>{activeStep?.name}</span>
        )} */}
      </span>

      <span className={css(styles.wizardToggleIcon)}>
        <CaretDownIcon aria-hidden="true" />
      </span>
    </button>
  );
}

export function PageWizardNavigation() {
  const { activeStep, steps, isToggleExpanded } = useContext(PageWizardContext);
  const navClassName = isToggleExpanded ? 'pf-c-wizard__nav pf-m-expanded' : 'pf-c-wizard__nav';
  return (
    <nav className={navClassName} aria-label="Steps">
      <ol className="pf-c-wizard__nav-list">
        {steps.map((step) => {
          const className =
            activeStep.id === step.id
              ? 'pf-c-wizard__nav-link pf-m-current' // eslint-disable-line i18next/no-literal-string
              : 'pf-c-wizard__nav-link'; // eslint-disable-line i18next/no-literal-string
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

export function PageWizardFooter(props: {
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
      style={{ borderTop: 'thin solid var(--pf-global--BorderColor--100)' }}
    >
      {'inputs' in activeStep ? (
        <PageFormSubmitButton style={{ minWidth: 10 }}>{nextButtonLabel}</PageFormSubmitButton>
      ) : (
        <button className="pf-c-button pf-m-primary" type="submit" onClick={props.onNext}>
          {t('Next')}
        </button>
      )}
      <button className={backClassName} type="button" onClick={props.onBack}>
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
