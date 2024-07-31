import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PromptFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import { Credential } from '../../../interfaces/Credential';
import { requestGet } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';

export function useCredentialsValidate() {
  const { t } = useTranslation();
  return useCallback(
    async (selectedCredentials: PromptFormValues['credentials']) => {
      const originalCredentials: number[] = [];
      const newCredentials: Credential[] = [];
      selectedCredentials?.forEach((credential) =>
        !('summary_fields' in credential)
          ? originalCredentials.push(credential.id)
          : newCredentials.push(credential)
      );
      const fullDefaultCredentials: Credential[] = await Promise.all(
        originalCredentials.map((defCred) =>
          requestGet<Credential>(awxAPI`/credentials/${defCred.toString()}/`)
        )
      );
      const allCredentials = [...(fullDefaultCredentials || []), ...newCredentials];
      const vaultIds = allCredentials
        .filter((credential) => credential.kind === 'vault' && credential.inputs.vault_id)
        .map((vaultCred) => vaultCred.inputs.vault_id.toString());
      const otherCredentialTypes = allCredentials
        .filter((credential) => credential.kind !== 'vault')
        .map((nonVaultCred) => nonVaultCred.summary_fields.credential_type.name);

      const hasDuplicateVaultIds: boolean =
        vaultIds.filter(
          (vaultId, _index, array) => array.indexOf(vaultId) !== array.lastIndexOf(vaultId)
        ).length > 0;
      const duplicateCredentialTypes: string[] = [
        ...new Set(
          otherCredentialTypes.filter(
            (cred, _index, array) => array.indexOf(cred) !== array.lastIndexOf(cred)
          )
        ),
      ];

      if (duplicateCredentialTypes.length > 0) {
        return t(
          `Cannot assign multiple credentials of the same type. Duplicated credential types are: ${duplicateCredentialTypes.join(', ')}`
        );
      }
      if (hasDuplicateVaultIds) {
        return t(`Cannot assign multiple vault credentials of the same vault id.`);
      }
    },
    [t]
  );
}
