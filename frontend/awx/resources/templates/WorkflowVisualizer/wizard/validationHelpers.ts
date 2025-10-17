import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { WizardFormValues } from '../types';

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
