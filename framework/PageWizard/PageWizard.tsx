import '@patternfly/patternfly/components/Wizard/wizard.css';
import PageWizardBody from './PageWizardBody';
import PageWizardNavigation from './PageWizardNavigation';
import PageWizardToggle from './PageWizardToggle';
import { PageWizardProvider } from './PageWizardProvider';
import type { PageWizardStep } from './types';

export default function PageWizard<T extends object>(props: {
  steps: PageWizardStep[];
  defaultValue?: Record<string, object>;
  onCancel?: () => void;
  onSubmit: (wizardData: T) => Promise<void>;
}) {
  return (
    <PageWizardProvider<T> steps={props.steps} defaultValue={props.defaultValue}>
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
          <PageWizardBody<T> onCancel={props.onCancel} onSubmit={props.onSubmit} />
        </div>
      </div>
    </PageWizardProvider>
  );
}
