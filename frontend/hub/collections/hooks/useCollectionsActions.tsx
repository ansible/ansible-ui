import { ButtonVariant } from '@patternfly/react-core';
import { BanIcon, TrashIcon, UploadIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { CollectionVersionSearch } from '../Collection';
import { useDeleteCollections } from './useDeleteCollections';
import { useDeprecateCollections } from './useDeprecateCollections';
import { useDeleteCollectionsFromRepository } from './useDeleteCollectionsFromRepository';

export function useCollectionsActions(callback: (collections: CollectionVersionSearch[]) => void) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteCollections = useDeleteCollections(callback);
  const deleteCollectionsFromRepository = useDeleteCollectionsFromRepository(callback);
  const deprecateCollections = useDeprecateCollections(callback);

  return useMemo<IPageAction<CollectionVersionSearch>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        icon: UploadIcon,
        variant: ButtonVariant.primary,
        isPinned: true,
        label: t('Upload collection'),
        onClick: () => navigate(RouteObj.UploadCollection),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected collections'),
        onClick: deleteCollections,
        isDanger: true,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected collections from repository'),
        onClick: deleteCollectionsFromRepository,
        isDanger: true,
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
    [t, navigate, deleteCollections, deprecateCollections, deleteCollectionsFromRepository]
  );
}
