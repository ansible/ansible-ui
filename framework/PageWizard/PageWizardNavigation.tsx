import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { usePageWizard } from './PageWizardProvider';

export function PageWizardNavigation() {
  const { activeStep, steps, isToggleExpanded, setActiveStep, stepError } = usePageWizard();
  const navClassName = isToggleExpanded
    ? 'pf-v5-c-wizard__nav pf-m-expanded'
    : 'pf-v5-c-wizard__nav bg-lighten';

  const goToStepByIndex = (index: number) => {
    const step = steps[index];
    if (step) {
      setActiveStep(step);
    }
  };

  if (!activeStep) return;

  return (
    <nav className={navClassName} aria-label="Steps" data-cy="wizard-nav">
      <ol className="pf-v5-c-wizard__nav-list">
        {steps.map((step, index) => {
          const activeStepIndex = steps.findIndex((step) => step.id === activeStep.id);
          const isDisabled = index > activeStepIndex;

          const className =
            'pf-v5-c-wizard__nav-link' + // eslint-disable-line i18next/no-literal-string
            (activeStep.id === step.id ? ' pf-m-current' : '') + // eslint-disable-line i18next/no-literal-string
            (isDisabled ? ' pf-m-disabled' : ''); // eslint-disable-line i18next/no-literal-string

          return (
            <li
              className="pf-v5-c-wizard__nav-item"
              data-cy={`wizard-nav-item-${step.id}`}
              key={step.id}
            >
              <button
                className={className}
                onClick={() => goToStepByIndex(index)}
                disabled={isDisabled}
              >
                {' '}
                {step.label}
                {stepError[step.id] && activeStep.id === step.id && (
                  <span style={{ marginLeft: '8px' }}>
                    <ExclamationCircleIcon color="#C9190B" />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
