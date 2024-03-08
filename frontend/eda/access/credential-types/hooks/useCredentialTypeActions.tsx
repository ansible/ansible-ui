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
import { useDeleteCredentialTypes } from './useDeleteCredentialTypes';
import { EdaCredentialType } from '../../../interfaces/EdaCredentialType';
import { EdaRoute } from '../../../main/EdaRoutes';

export function useCredentialTypeToolbarActions(
  onCredentialTypesDeleted: (credentialType: EdaCredentialType[]) => void
) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const deleteCredentialTypes = useDeleteCredentialTypes(onCredentialTypesDeleted);

  return useMemo<IPageAction<EdaCredentialType>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        // variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create credential type'),
        href: `${getPageUrl(EdaRoute.CreateCredentialType)}`,
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
    [t, getPageUrl, deleteCredentialTypes]
  );
}

export function useCredentialTypeRowActions(
  onCredentialTypesDeleted: (credentialType: EdaCredentialType[]) => void
) {
  const pageNavigate = usePageNavigate();
  const deleteCredentialTypes = useDeleteCredentialTypes(onCredentialTypesDeleted);
  const { t } = useTranslation();

  return useMemo(() => {
    const actions: IPageAction<EdaCredentialType>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit credential type'),
        onClick: (credentialType) =>
          pageNavigate(EdaRoute.EditCredentialType, { params: { id: credentialType.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete credential type'),
        onClick: (credentialType: EdaCredentialType) => deleteCredentialTypes([credentialType]),
        isDanger: true,
      },
    ];

    return actions;
  }, [deleteCredentialTypes, pageNavigate, t]);
}
