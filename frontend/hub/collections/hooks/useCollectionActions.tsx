import { ButtonVariant } from '@patternfly/react-core';
import { TrashIcon, UploadIcon, BanIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { CollectionVersionSearch } from '../Collection';
import { useDeleteCollections } from './useDeleteCollections';
import { useDeprecateCollections } from './useDeprecateCollections';
import { useDeleteCollectionsFromRepository } from './useDeleteCollectionsFromRepository';

export function useCollectionActions(callback?: (collections: CollectionVersionSearch[]) => void) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteCollections = useDeleteCollections(callback);
  const deprecateCollections = useDeprecateCollections(callback);
  const deleteCollectionsFromRepository = useDeleteCollectionsFromRepository();

  return useMemo<IPageAction<CollectionVersionSearch>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: UploadIcon,
        variant: ButtonVariant.secondary,
        isPinned: true,
        label: t('Upload new version'),
        onClick: () => navigate(RouteObj.UploadCollection),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete entire collection from system'),
        onClick: (collection) => deleteCollections([collection]),
        isDanger: true,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete collection from repository'),
        onClick: (collection) => deleteCollectionsFromRepository([collection]),
        isDanger: true,
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
    [t, navigate, deleteCollections, deprecateCollections, deleteCollectionsFromRepository]
  );
}
