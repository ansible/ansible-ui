import { useCallback } from 'react';
import { useAbortController } from '../../../../common/crud/useAbortController';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { PromptFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import { Credential } from '../../../interfaces/Credential';
import { getAddedAndRemoved } from '../../../common/util/getAddedAndRemoved';
import { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';

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
      const promptCredentials = credentials || [];
      const templateCredentials = launch_config?.defaults.credentials || [];

      if (credentials) {
        const { added, removed } = getAddedAndRemoved(promptCredentials, templateCredentials);
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
      }
    },
    [postDisassociate, postAssociateCredential, abortController]
  );
};
