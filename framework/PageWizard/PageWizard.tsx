import '@patternfly/patternfly/components/Wizard/wizard.css';
import { ErrorAdapter } from '../PageForm/typesErrorAdapter';
import { PageWizardBody } from './PageWizardBody';
import { PageWizardHeader } from './PageWizardHeader';
import { PageWizardNavigation } from './PageWizardNavigation';
import { PageWizardProvider } from './PageWizardProvider';
import { PageWizardToggle } from './PageWizardToggle';
import type { PageWizardStep } from './types';

export function PageWizard<DataT extends NonNullable<object>>(props: {
  steps: PageWizardStep[];

  /** An object with default values for each step, using the step ID as the key. */
  stepDefaults?: { [stepID: string]: Partial<DataT> };

  onCancel?: () => void;
  onSubmit: (wizardData: DataT) => Promise<void>;
  errorAdapter?: ErrorAdapter;
  disableGrid?: boolean;
  title?: string;
  isVertical?: boolean;
  singleColumn?: boolean;
}) {
  return (
    <PageWizardProvider<DataT>
      steps={props.steps}
      stepDefaults={props.stepDefaults}
      onSubmit={props.onSubmit}
    >
      <div
        className="pf-v6-c-wizard"
        data-cy="wizard"
        data-testid="wizard"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          maxHeight: '100%',
          overflow: 'hidden',
        }}
      >
        {props.title && <PageWizardHeader title={props.title} onClose={props.onCancel} />}
        <PageWizardToggle />
        <div
          className="pf-v6-c-wizard__outer-wrap"
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          <PageWizardNavigation />
          <PageWizardBody
            errorAdapter={props.errorAdapter}
            onCancel={props.onCancel}
            disableGrid={props.disableGrid}
            isVertical={props.isVertical}
            singleColumn={props.singleColumn}
          />
        </div>
      </div>
    </PageWizardProvider>
  );
}
