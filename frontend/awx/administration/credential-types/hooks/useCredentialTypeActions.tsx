import { useTranslation } from 'react-i18next';
import { CredentialType } from '../../../interfaces/CredentialType';
import { IAwxView } from '../../../useAwxView';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { AwxRoute } from '../../../AwxRoutes';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { useDeleteCredentialTypes } from './useDeleteCredentialTypes';

export function useCredentialTypeToolbarActions(view: IAwxView<CredentialType>) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const { data } = useOptions<OptionsResponse<ActionsResponse>>('/api/v2/credential_types/');
  const canCreateCredentialType = Boolean(data && data.actions && data.actions['POST']);

  const deleteCredentialTypes = useDeleteCredentialTypes(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<CredentialType>[]>(
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
        onClick: (credentialTypes: CredentialType[]) => deleteCredentialTypes(credentialTypes),
        isDanger: true,
      },
    ],
    [t, canCreateCredentialType, getPageUrl, deleteCredentialTypes]
  );

  return toolbarActions;
}

export function useCredentialTypeRowActions(view: IAwxView<CredentialType>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteCredentialType = useDeleteCredentialTypes(view.unselectItemsAndRefresh);

  const rowActions = useMemo<IPageAction<CredentialType>[]>(() => {
    const cannotDeleteCredentialTypeDueToPermissions = (credentialType: CredentialType) =>
      credentialType.summary_fields?.user_capabilities?.delete
        ? ''
        : t(`The credential type cannot be deleted due to insufficient permissions.`);
    const cannotDeleteManagedCredentialType = (credentialType: CredentialType) =>
      credentialType.managed
        ? t(`The credential type cannot be deleted because it is read-only.`)
        : '';
    const cannotEditCredentialType = (credentialType: CredentialType) =>
      credentialType.summary_fields?.user_capabilities?.edit
        ? ''
        : t(`The credential type cannot be edited due to insufficient permissions.`);

    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        // variant: ButtonVariant.primary,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit credentialType'),
        isDisabled: (credentialType: CredentialType) => cannotEditCredentialType(credentialType),
        onClick: (credentialType) =>
          pageNavigate(AwxRoute.EditCredentialType, { params: { id: credentialType.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete credentialType'),
        isDisabled: (credentialType: CredentialType) =>
          cannotDeleteManagedCredentialType(credentialType)
            ? cannotDeleteManagedCredentialType(credentialType)
            : cannotDeleteCredentialTypeDueToPermissions(credentialType),
        onClick: (credentialType: CredentialType) => deleteCredentialType([credentialType]),
        isDanger: true,
      },
    ];
  }, [deleteCredentialType, pageNavigate, t]);

  return rowActions;
}
