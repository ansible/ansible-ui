import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { ReorderItems } from '../../../../../framework/components/ReorderItems';
import type { AuthenticatorFormValues } from '../AuthenticatorForm';

export function AuthenticatorMappingOrderStep() {
  const { wizardData, setWizardData } = usePageWizard();
  const { mappings = [] } = wizardData as AuthenticatorFormValues;

  return <ReorderItems<AuthenticatorMapping />;
}
