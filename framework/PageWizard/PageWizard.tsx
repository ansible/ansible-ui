import '@patternfly/patternfly/components/Wizard/wizard.css';
import { ErrorAdapter } from '../PageForm/typesErrorAdapter';
import { PageWizardBody } from './PageWizardBody';
import { PageWizardHeader } from './PageWizardHeader';
import { PageWizardNavigation } from './PageWizardNavigation';
import { PageWizardProvider } from './PageWizardProvider';
import { PageWizardToggle } from './PageWizardToggle';
import type { PageWizardStep } from './types';

export function PageWizard<T extends object>(props: {
  steps: PageWizardStep[];
  defaultValue?: Record<string, object>;
  onCancel?: () => void;
  onSubmit: (wizardData: T) => Promise<void>;
  errorAdapter?: ErrorAdapter;
  disableGrid?: boolean;
  title?: string;
}) {
  return (
    <PageWizardProvider<T> steps={props.steps} defaultValue={props.defaultValue}>
      <div
        className="pf-v5-c-wizard"
        data-cy="wizard"
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
          className="pf-v5-c-wizard__outer-wrap"
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          <PageWizardNavigation />
          <PageWizardBody<T>
            errorAdapter={props.errorAdapter}
            onCancel={props.onCancel}
            onSubmit={props.onSubmit}
            disableGrid={props.disableGrid}
          />
        </div>
      </div>
    </PageWizardProvider>
  );
}
