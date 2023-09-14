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
import { HubRoute } from '../../HubRoutes';
import { CollectionVersionSearch } from '../Collection';
import { useHubContext } from './../../useHubContext';
import { useDeleteCollections } from './useDeleteCollections';
import { useDeleteCollectionsFromRepository } from './useDeleteCollectionsFromRepository';
import { useDeprecateCollections } from './useDeprecateCollections';
import { useCopyToRepository } from './useCopyToRepository';

export function useCollectionActions(
  callback?: (collections: CollectionVersionSearch[]) => void,
  // determine if the menu item is rendered in list or in detail, which defines its redirections
  detail?: boolean
) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deprecateCollections = useDeprecateCollections(callback);
  const deleteCollections = useDeleteCollections(callback, false, detail);
  const deleteCollectionsFromRepository = useDeleteCollectionsFromRepository(
    callback,
    false,
    detail
  );

  const deleteCollectionsVersionsFromRepository = useDeleteCollectionsFromRepository(
    callback,
    true,
    detail
  );
  const deleteCollectionsVersions = useDeleteCollections(callback, true, detail);
  const copyToRepository = useCopyToRepository();

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
          : t('You do not have rights to this operation'),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete entire collection from repository'),
        onClick: (collection) => deleteCollectionsFromRepository([collection]),
        isDanger: true,
        isDisabled: context.hasPermission('ansible.delete_collection')
          ? ''
          : t('You do not have rights to this operation'),
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
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete version from system'),
        isDanger: true,
        onClick: (collection) => {
          deleteCollectionsVersions([collection]);
        },
        isHidden: () => (detail ? false : true),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete version from repository'),
        isDanger: true,
        onClick: (collection) => {
          deleteCollectionsVersionsFromRepository([collection]);
        },
        isHidden: () => (detail ? false : true),
      },
      {
        type: PageActionType.Button,
        selection : PageActionSelection.Single,
        icon: UploadIcon,
        label: t('Copy version to repositories'),
        onClick: (collection) => {
          copyToRepository(collection);
        },
        isDisabled: context.featureFlags.display_repositories
          ? ''
          : t`You dont have rights to this operation`,
      },
    ],
    [
      t,
      context,
      pageNavigate,
      deleteCollections,
      deleteCollectionsFromRepository,
      deprecateCollections,
      deleteCollectionsVersions,
      detail,
      deleteCollectionsVersionsFromRepository,
    ]
  );
}
