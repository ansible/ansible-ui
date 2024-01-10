import { ButtonVariant } from '@patternfly/react-core';
import { BanIcon, TrashIcon, UploadIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../framework';
import { useHubContext } from '../../common/useHubContext';
import { HubRoute } from '../../main/HubRoutes';
import { CollectionVersionSearch } from '../Collection';
import { useDeleteCollections } from './useDeleteCollections';
import { useDeleteCollectionsFromRepository } from './useDeleteCollectionsFromRepository';
import { useDeprecateCollections } from './useDeprecateCollections';

export function useCollectionsActions(callback: (collections: CollectionVersionSearch[]) => void) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteCollections = useDeleteCollections(callback);
  const deleteCollectionsFromRepository = useDeleteCollectionsFromRepository(callback);
  const deprecateCollections = useDeprecateCollections(callback);
  const context = useHubContext();

  return useMemo<IPageAction<CollectionVersionSearch>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        icon: UploadIcon,
        variant: ButtonVariant.primary,
        isPinned: true,
        label: t('Upload collection'),
        onClick: () => pageNavigate(HubRoute.UploadCollection),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected collections'),
        onClick: deleteCollections,
        isDanger: true,
        isDisabled: context.hasPermission('ansible.delete_collection')
          ? ''
          : t`You do not have rights to this operation`,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected entire collections from repository'),
        onClick: deleteCollectionsFromRepository,
        isDanger: true,
        isDisabled: context.hasPermission('ansible.delete_collection')
          ? ''
          : t`You do not have rights to this operation`,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: BanIcon,
        label: t('Deprecate selected collections'),
        onClick: (collections) => {
          deprecateCollections(collections);
        },
      },
    ],
    [
      t,
      deleteCollections,
      context,
      deleteCollectionsFromRepository,
      pageNavigate,
      deprecateCollections,
    ]
  );
}
