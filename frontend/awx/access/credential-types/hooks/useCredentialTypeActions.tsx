import { PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { useOptions } from '../../../../common/crud/useOptions';
import { awxAPI } from '../../../common/api/awx-utils';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useDeleteCredentialTypes } from './useDeleteCredentialTypes';
import { CredentialType } from '../../../interfaces/CredentialType';

export function useCredentialTypeToolbarActions(
  onCredentialTypesDeleted: (credentialType: CredentialType[]) => void
) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const deleteCredentialTypes = useDeleteCredentialTypes(onCredentialTypesDeleted);
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/credential_types/`);
  const canCreateCredentialType = Boolean(data && data.actions && data.actions['POST']);

  return useMemo<IPageAction<CredentialType>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        // variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create credential type'),
        isDisabled: canCreateCredentialType
          ? undefined
          : t(
              'You do not have permission to create a credential type. Please contact your system administrator if there is an issue with your access.'
            ),
        href: `${getPageUrl(AwxRoute.CreateCredentialType)}`,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected credential types'),
        onClick: deleteCredentialTypes,
        isDanger: true,
      },
    ],
    [t, canCreateCredentialType, getPageUrl, deleteCredentialTypes]
  );
}

export function useCredentialTypeRowActions(
  onCredentialTypesDeleted: (credentialType: CredentialType[]) => void
) {
  const pageNavigate = usePageNavigate();
  const deleteCredentialTypes = useDeleteCredentialTypes(onCredentialTypesDeleted);
  const { t } = useTranslation();

  return useMemo(() => {
    const cannotDeleteCredentialTypeDueToPermissions = (credentialType: CredentialType) =>
      credentialType.summary_fields?.user_capabilities?.delete
        ? ''
        : t(`The credential type cannot be deleted due to insufficient permissions.`);
    const cannotDeleteManagedCredentialType = (credentialType: CredentialType) =>
      credentialType.managed
        ? t(`The credential type cannot be deleted because it is read-only.`)
        : '';
    const cannotEditManagedCredentialType = (credentialType: CredentialType) =>
      credentialType.managed
        ? t(`The credential type cannot be edited because it is read-only.`)
        : '';
    const cannotEditCredentialTypeDueToPermissions = (credentialType: CredentialType) =>
      credentialType.summary_fields?.user_capabilities?.edit
        ? ''
        : t(`The credential type cannot be edited due to insufficient permissions.`);

    const actions: IPageAction<CredentialType>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit credential type'),
        isDisabled: (credentialType: CredentialType) =>
          cannotEditManagedCredentialType(credentialType)
            ? cannotEditManagedCredentialType(credentialType)
            : cannotEditCredentialTypeDueToPermissions(credentialType),
        onClick: (credentialType) =>
          pageNavigate(AwxRoute.EditCredentialType, { params: { id: credentialType.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete credential type'),
        isDisabled: (credentialType: CredentialType) =>
          cannotDeleteManagedCredentialType(credentialType)
            ? cannotDeleteManagedCredentialType(credentialType)
            : cannotDeleteCredentialTypeDueToPermissions(credentialType),
        onClick: (credentialType: CredentialType) => deleteCredentialTypes([credentialType]),
        isDanger: true,
      },
    ];

    return actions;
  }, [deleteCredentialTypes, pageNavigate, t]);
}
