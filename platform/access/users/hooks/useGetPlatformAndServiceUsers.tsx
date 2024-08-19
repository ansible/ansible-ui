import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { EdaUser } from '../../../../frontend/eda/interfaces/EdaUser';
import { HubUser } from '../../../../frontend/hub/interfaces/expanded/HubUser';
import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';
import { edaAPI } from '../../../../frontend/eda/common/eda-utils';
import { hubAPI } from '../../../../frontend/hub/common/api/formatPath';
import { requestPatch } from '../../../../frontend/common/crud/Data';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { useAwxResource } from '../../../hooks/useAwxResource';
import { useEdaResource } from '../../../hooks/useEdaResource';
import { useHubResource } from '../../../hooks/useHubResource';
import { IUserInput } from '../components/PlatformUserForm';

interface IServiceUserInputs {
  userInput: IUserInput;
  awxUser?: AwxUser;
  edaUser?: EdaUser;
  hubUser?: HubUser;
}
interface IPlatformAndServiceUsers {
  platformUser?: PlatformUser;
  awxUser?: AwxUser;
  edaUser?: EdaUser;
  hubUser?: HubUser;
  isLoading: boolean;
  error?: Error;
  updateServiceUserSuperuser: (inputs: IServiceUserInputs) => Promise<void>;
}
interface CustomError extends Error {
  body?: Record<string, string>; // Adding an optional 'body' property
}

export function useGetPlatformAndServiceUsers(userId: number): IPlatformAndServiceUsers {
  const { t } = useTranslation();

  const {
    data: platformUser,
    isLoading,
    error,
  } = useGet<PlatformUser>(gatewayV1API`/users/${userId.toString()}/`);

  const { resource: awxResource, refresh: awxRefresh } = useAwxResource<AwxUser>(
    'users/',
    platformUser
  );
  const { resource: edaResource, refresh: edaRefresh } = useEdaResource<EdaUser>(
    'users/',
    platformUser
  );
  const { resource: hubResource, refresh: hubRefresh } = useHubResource<HubUser>(
    '_ui/v2/users/',
    platformUser
  );

  const refreshServiceUsers = useCallback(() => {
    void awxRefresh();
    void edaRefresh();
    void hubRefresh();
  }, [awxRefresh, edaRefresh, hubRefresh]);

  const updateServiceUserSuperuser = useCallback(
    async ({ awxUser, edaUser, hubUser, userInput }: IServiceUserInputs) => {
      const {
        platformAdmin: isPlatformAdmin,
        awxAdmin: isAwxAdmin,
        edaAdmin: isEdaAdmin,
        hubAdmin: isHubAdmin,
      } = userInput;

      if (isPlatformAdmin) return;
      try {
        if (awxUser && awxUser.is_superuser !== isAwxAdmin) {
          await requestPatch<AwxUser>(awxAPI`/users/${awxUser?.id?.toString()}/`, {
            is_superuser: isAwxAdmin,
          });
        }
        if (edaUser && edaUser.is_superuser !== isEdaAdmin) {
          await requestPatch<EdaUser>(edaAPI`/users/${edaUser.id.toString()}/`, {
            is_superuser: isEdaAdmin,
          });
        }
        if (hubUser && hubUser.is_superuser !== isHubAdmin) {
          await requestPatch<HubUser>(hubAPI`/_ui/v2/users/${hubUser.id.toString()}/`, {
            is_superuser: isHubAdmin,
          });
        }
      } catch (error) {
        let errorMessage = t('Failed to update service admin value'); // Default error message

        if (error instanceof Error) {
          if (error.message) {
            errorMessage = error.message;
          }

          if ((error as CustomError).body) {
            const errorMessages = (error as CustomError).body!;
            errorMessage = Object.keys(errorMessages)
              .map((key) => errorMessages[key])
              .join(', ');
          }
        }

        throw new Error(errorMessage);
      }

      refreshServiceUsers();
    },
    [refreshServiceUsers, t]
  );

  return {
    platformUser,
    awxUser: awxResource,
    edaUser: edaResource,
    hubUser: hubResource,
    isLoading,
    error,
    updateServiceUserSuperuser,
  };
}
