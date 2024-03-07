import { ButtonVariant } from '@patternfly/react-core';
import { BanIcon, TrashIcon, UploadIcon, KeyIcon } from '@patternfly/react-icons';
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
import { useDeprecateCollections } from './useDeprecateCollections';
import { useSignCollection } from './useSignCollection';

export function useCollectionsActions(callback: (collections: CollectionVersionSearch[]) => void) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteCollections = useDeleteCollections(callback);
  const deprecateCollections = useDeprecateCollections(callback);
  const context = useHubContext();
  const signCollection = useSignCollection(false, callback);

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
        onClick: (collections: CollectionVersionSearch[]) => {
          // filter them
          const foundCollections: string[] = [];
          const newCollections: CollectionVersionSearch[] = [];
          collections.forEach((collection) => {
            if (foundCollections.includes(collection.collection_version?.name || '')) {
              return;
            }

            foundCollections.push(collection.collection_version?.name || '');
            newCollections.push(collection);
          });

          deleteCollections(newCollections);
        },
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
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: KeyIcon,
        label: t('Sign collection'),
        onClick: (collections) => {
          signCollection(collections);
        },
      },
    ],
    [t, deleteCollections, context, pageNavigate, deprecateCollections, signCollection]
  );
}
