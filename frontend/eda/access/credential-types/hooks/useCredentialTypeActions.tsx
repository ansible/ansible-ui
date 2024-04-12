import { PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { useDeleteCredentialTypes } from './useDeleteCredentialTypes';
import { EdaCredentialType } from '../../../interfaces/EdaCredentialType';
import { EdaRoute } from '../../../main/EdaRoutes';
import { ButtonVariant } from '@patternfly/react-core';

export function useCredentialTypeToolbarActions(
  onCredentialTypesDeleted: (credentialType: EdaCredentialType[]) => void
) {
  const { t } = useTranslation();
  const deleteCredentialTypes = useDeleteCredentialTypes(onCredentialTypesDeleted);
  const pageNavigate = usePageNavigate();

  return useMemo<IPageAction<EdaCredentialType>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create credential type'),
        onClick: () => pageNavigate(EdaRoute.CreateCredentialType),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected credential types'),
        isDisabled: () => 'Not implemented',
        onClick: deleteCredentialTypes,
        isDanger: true,
      },
    ],
    [t, deleteCredentialTypes, pageNavigate]
  );
}

export function useCredentialTypeRowActions(
  onCredentialTypesDeleted: (credentialType: EdaCredentialType[]) => void
) {
  const pageNavigate = usePageNavigate();
  const deleteCredentialTypes = useDeleteCredentialTypes(onCredentialTypesDeleted);
  const { t } = useTranslation();

  return useMemo(() => {
    const cannotDeleteManagedCredentialType = (credentialType: EdaCredentialType) =>
      credentialType.managed
        ? t(`The credential type cannot be deleted because it is read-only.`)
        : '';
    const cannotEditManagedCredentialType = (credentialType: EdaCredentialType) =>
      credentialType.managed
        ? t(`The credential type cannot be edited because it is read-only.`)
        : '';
    const actions: IPageAction<EdaCredentialType>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit credential type'),
        isDisabled: (credentialType: EdaCredentialType) =>
          cannotEditManagedCredentialType(credentialType),
        onClick: (credentialType) =>
          pageNavigate(EdaRoute.EditCredentialType, { params: { id: credentialType.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete credential type'),
        isDisabled: (credentialType: EdaCredentialType) =>
          cannotDeleteManagedCredentialType(credentialType),
        onClick: (credentialType: EdaCredentialType) => deleteCredentialTypes([credentialType]),
        isDanger: true,
      },
    ];

    return actions;
  }, [deleteCredentialTypes, pageNavigate, t]);
}
