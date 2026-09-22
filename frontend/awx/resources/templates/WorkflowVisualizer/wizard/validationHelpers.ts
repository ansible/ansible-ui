import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { RESOURCE_TYPE } from '../constants';
import { WizardFormValues } from '../types';
import { awaitLaunchConfigLoad } from './launchConfigLoad';

interface CredentialType {
  id: number;
  name: string;
}

export function validateRequiredCredentialTypes(
  t: (key: string, params?: Record<string, unknown>) => string,
  wizardData: Partial<WizardFormValues>,
  requiredCredentialTypes: CredentialType[]
) {
  if (!requiredCredentialTypes || requiredCredentialTypes.length === 0) {
    return;
  }

  const { prompt } = wizardData;
  const selectedCredentials = prompt?.credentials || [];
  const selectedCredentialTypes = selectedCredentials.map(
    (credential) => credential.credential_type
  );
  const missingTypes = requiredCredentialTypes.filter(
    (requiredType) => !selectedCredentialTypes.includes(requiredType.id)
  );
  const extraTypes = selectedCredentialTypes.filter(
    (selectedTypeId) => !requiredCredentialTypes.find((type) => type.id === selectedTypeId)
  );

  if (missingTypes.length || extraTypes.length) {
    // NOTE: multiple credentials of the same type are also disallowed,
    // but this is validated by the PageFormCredentialSelect component before
    // this step validation runs, so no need to check for it here
    let message = '';
    if (missingTypes.length) {
      const missingTypeNames = missingTypes.map((type) => type.name).join(', ');
      message = t(
        'Job Template default credentials must be replaced with ones of the same type. Please select a credential for the following types in order to proceed: {{types}}',
        { types: missingTypeNames }
      );
    } else {
      const requiredTypeNames = requiredCredentialTypes.map((type) => type.name).join(', ');
      message = t(
        'Job Template default credentials must be replaced with ones of the same type. Please select only credentials of the following types in order to proceed: {{types}}',
        { types: requiredTypeNames }
      );
    }
    const errors = {
      __all__: [message],
    };
    throw new RequestError('', '', 400, '', errors);
  }
}

export async function awaitNodeLaunchConfigForWizard(
  wizardData: Partial<WizardFormValues>,
  previousWizardData: Partial<WizardFormValues> = {}
): Promise<Partial<WizardFormValues> | undefined> {
  const { node_type, resourceId } = wizardData;
  if (
    !resourceId ||
    (node_type !== RESOURCE_TYPE.job && node_type !== RESOURCE_TYPE.workflow_job)
  ) {
    return undefined;
  }

  const loadResult = await awaitLaunchConfigLoad(node_type, resourceId);
  if (loadResult) {
    return {
      launch_config: loadResult.launch_config,
      resource: loadResult.resource,
      resourceId: loadResult.resourceId,
    };
  }

  // Drop stale prompt flags from a previously selected template when the new
  // template's launch config is not available yet.
  if (previousWizardData.launch_config && previousWizardData.resourceId !== resourceId) {
    return { launch_config: null, resourceId };
  }

  return undefined;
}

export async function validateNodeTypeStep(
  t: (key: string) => string,
  formData: Partial<WizardFormValues>,
  wizardData: Partial<WizardFormValues> = {}
): Promise<Partial<WizardFormValues> | undefined> {
  const merged = { ...wizardData, ...formData };
  const supplemental = await awaitNodeLaunchConfigForWizard(merged, wizardData);
  validateJobTemplateRequirements(t, { ...merged, ...supplemental });
  return supplemental;
}

export function validateJobTemplateRequirements(
  t: (key: string) => string,
  wizardData: Partial<WizardFormValues>
) {
  const { resource } = wizardData;
  if (resource?.type !== 'job_template') {
    return;
  }
  if ('project' in resource && 'inventory' in resource && 'ask_inventory_on_launch' in resource) {
    if (
      !resource?.project ||
      resource?.project === null ||
      ((!resource?.inventory || resource?.inventory === null) && !resource?.ask_inventory_on_launch)
    ) {
      const errors = {
        __all__: [
          t(
            'Job Templates with a missing inventory or project cannot be selected when creating or editing nodes. Select another template or fix the missing fields to proceed.'
          ),
        ],
      };

      throw new RequestError('', '', 400, '', errors);
    }
  }
}
