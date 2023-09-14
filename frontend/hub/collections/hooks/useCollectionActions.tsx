import { ButtonVariant } from '@patternfly/react-core';
import { BanIcon, TrashIcon, UploadIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../framework';
import { HubRoute } from '../../HubRoutes';
import { CollectionVersionSearch } from '../Collection';
import { useHubContext } from './../../useHubContext';
import { useDeleteCollections } from './useDeleteCollections';
import { useDeleteCollectionsFromRepository } from './useDeleteCollectionsFromRepository';
import { useDeprecateCollections } from './useDeprecateCollections';

export function useCollectionActions(callback?: (collections: CollectionVersionSearch[]) => void) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const deleteCollections = useDeleteCollections(callback);
  const deprecateCollections = useDeprecateCollections(callback);
  const deleteCollectionsFromRepository = useDeleteCollectionsFromRepository();
  const context = useHubContext();

  return useMemo<IPageAction<CollectionVersionSearch>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: UploadIcon,
        variant: ButtonVariant.secondary,
        isPinned: true,
        label: t('Upload new version'),
        onClick: () => pageNavigate(HubRoute.UploadCollection),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete entire collection from system'),
        onClick: (collection) => deleteCollections([collection]),
        isDanger: true,
        isDisabled: context.hasPermission('ansible.delete_collection')
          ? ''
          : t`You dont have rights to this operation`,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete collection from repository'),
        onClick: (collection) => deleteCollectionsFromRepository([collection]),
        isDanger: true,
        isDisabled: context.hasPermission('ansible.delete_collection')
          ? ''
          : t`You dont have rights to this operation`,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: BanIcon,
        label: t('Deprecate collection'),
        onClick: (collection) => {
          deprecateCollections([collection]);
        },
      },
    ],
    [t, navigate, deleteCollections, deprecateCollections, deleteCollectionsFromRepository, context]
  );
}
