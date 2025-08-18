import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { AwxSelectResourcesStep } from '@ansible/awx-ui/access/common/AwxRolesWizardSteps/AwxSelectResourcesStep';
import { EdaSelectResourcesStep } from '@ansible/eda-ui/access/common/EdaRolesWizardSteps/EdaSelectResourcesStep';
import { HubSelectResourcesStep } from '@ansible/hub-ui/access/common/HubRoleWizardSteps/HubSelectResourcesStep';

export function PlatformSelectResourcesStep() {
  const { wizardData } = usePageWizard();
  const { resourceType } = wizardData as { [key: string]: unknown };

  if (typeof resourceType !== 'string') {
    return null;
  }

  if (resourceType.startsWith('awx.')) {
    return <AwxSelectResourcesStep />;
  }

  if (resourceType.startsWith('eda.')) {
    return <EdaSelectResourcesStep />;
  }

  if (resourceType.startsWith('galaxy.')) {
    return <HubSelectResourcesStep />;
  }

  return null;
}
