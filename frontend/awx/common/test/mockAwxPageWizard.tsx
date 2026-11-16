import type { PageWizardStep } from '@ansible/ansible-ui-framework';
import { vi } from 'vitest';

export const awxPageWizardCapture: {
  onSubmit: ((data: unknown) => Promise<void>) | undefined;
  steps: PageWizardStep[];
} = {
  onSubmit: undefined,
  steps: [],
};

export const awxPageWizardProgressDialog = vi.fn();

export function createAwxPageWizardFrameworkMock(
  actual: typeof import('@ansible/ansible-ui-framework')
): typeof import('@ansible/ansible-ui-framework') {
  return {
    ...actual,
    PageWizard: <T,>(props: { onSubmit: (data: T) => Promise<void>; steps: PageWizardStep[] }) => {
      awxPageWizardCapture.onSubmit = props.onSubmit as typeof awxPageWizardCapture.onSubmit;
      awxPageWizardCapture.steps = props.steps;
      return <div data-testid="wizard-capture" />;
    },
  };
}
