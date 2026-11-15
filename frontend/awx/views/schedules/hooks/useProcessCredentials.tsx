import { useAbortController } from '@ansible/ansible-ui-framework/hooks/useAbortController';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useCallback } from 'react';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { getAddedAndRemoved } from '../../../common/util/getAddedAndRemoved';
import { Credential } from '../../../interfaces/Credential';
import { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import { PromptFormValues } from '../../../resources/templates/WorkflowVisualizer/types';

export const useProcessCredentials = () => {
  const abortController = useAbortController();
  const postDisassociate = usePostRequest<{ id: number; disassociate: boolean }>();
  const postAssociateCredential = usePostRequest<{ id: number }, Credential>();

  return useCallback(
    async (
      scheduleId: number,
      credentials: PromptFormValues['credentials'],
      launch_config: LaunchConfiguration | null
    ) => {
      const hasCredentialPrompt = launch_config?.ask_credential_on_launch;
      const existingCredentials = await requestGet<AwxItemsResponse<Credential>>(
        awxAPI`/schedules/${scheduleId.toString()}/credentials/`
      );

      if (hasCredentialPrompt) {
        // Diff only against schedule associations — not template defaults.
        // Template defaults are not schedule credentials; including them caused
        // AAP-89449 (selecting a default credential produced an empty "added" set).
        const { added, removed } = getAddedAndRemoved(
          existingCredentials.results || [],
          credentials || []
        );

        const disassociationPromises = removed.map((credential: { id: number }) =>
          postDisassociate(
            awxAPI`/schedules/${scheduleId.toString()}/credentials/`,
            {
              id: credential.id,
              disassociate: true,
            },
            abortController.signal
          )
        );

        const associationPromises = added.map((credential) =>
          postAssociateCredential(
            awxAPI`/schedules/${scheduleId.toString()}/credentials/`,
            {
              id: credential.id,
            },
            abortController.signal
          )
        );

        await Promise.all([...disassociationPromises, ...associationPromises]);
      } else if (existingCredentials.results?.length) {
        const disassociationPromises = existingCredentials.results.map(
          (credential: { id: number }) =>
            postDisassociate(
              awxAPI`/schedules/${scheduleId.toString()}/credentials/`,
              {
                id: credential.id,
                disassociate: true,
              },
              abortController.signal
            )
        );
        await Promise.all(disassociationPromises);
      }
    },
    [postDisassociate, postAssociateCredential, abortController]
  );
};
