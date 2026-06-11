import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { ButtonVariant } from '@patternfly/react-core';
import { BanIcon, CopyIcon, KeyIcon, TrashIcon, UploadIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isInsightsMode } from '../../common/isInsights';
import { useHubContext } from '../../common/useHubContext';
import { useCanSignNamespace, useCollectionPermissionCheck } from '../../common/utils/canSign';
import { HubNamespace } from '../../namespaces/HubNamespace';
import { HubRoute } from '../../main/HubRoutes';
import { CollectionVersionSearch } from '../Collection';
import { useCopyToRepository } from './useCopyToRepository';
import { useDeleteCollections } from './useDeleteCollections';
import { useDeleteCollectionsFromRepository } from './useDeleteCollectionsFromRepository';
import { useDeprecateOrUndeprecateCollections } from './useDeprecateOrUndeprecateCollections';
import { useSignCollection } from './useSignCollection';

export function useCollectionActions(
  callback: (collections: CollectionVersionSearch[]) => void,
  // determine if the menu item is rendered in list or in detail, which defines its redirections
  detail?: boolean,
  namespace?: HubNamespace
) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deprecateOrUndeprecateCollections = useDeprecateOrUndeprecateCollections(callback);
  const deleteCollections = useDeleteCollections(callback, false, detail);
  const deleteCollectionsFromRepository = useDeleteCollectionsFromRepository(
    undefined,
    callback,
    false,
    detail
  );

  const deleteCollectionsVersionsFromRepository = useDeleteCollectionsFromRepository(
    undefined,
    callback,
    true,
    detail
  );
  const deleteCollectionsVersions = useDeleteCollections(callback, true, detail);
  const copyToRepository = useCopyToRepository(callback);
  const signCollectionVersion = useSignCollection(true, callback);
  const signCollection = useSignCollection(false, callback);

  const { featureFlags, user } = useHubContext();

  const { can_upload_signatures, display_repositories } = featureFlags;

  const canSignFeatureFlag = useCanSignNamespace();
  const hasPerm = useCollectionPermissionCheck(namespace);

  // Permission checks matching ansible-hub-ui's CollectionDropdown
  // In Insights mode, require specific permissions; in Platform mode, always allow
  const isInsights = isInsightsMode();
  const canDelete =
    !isInsights || hasPerm('ansible.delete_collection') || hasPerm('galaxy.change_namespace');
  const canDeprecate = !isInsights || hasPerm('galaxy.change_namespace');
  const canRemove = canDelete && !!display_repositories;
  const canSign =
    canSignFeatureFlag &&
    !can_upload_signatures &&
    (!isInsights || (hasPerm('galaxy.change_namespace') && hasPerm('galaxy.upload_to_namespace')));
  const canUpload = !isInsights || hasPerm('galaxy.upload_to_namespace');
  const canCopy = !!display_repositories && !user?.is_anonymous;

  return useMemo<IPageAction<CollectionVersionSearch>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: KeyIcon,
        label: t('Sign collection'),
        onClick: (collection) => {
          signCollection([collection]);
        },
        isHidden: () => !canSign,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: KeyIcon,
        label: t('Sign version'),
        isHidden: () => !detail || !canSign,
        onClick: (collection) => {
          signCollectionVersion([collection]);
        },
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: BanIcon,
        label: t('Deprecate collection'),
        onClick: (collection) => {
          deprecateOrUndeprecateCollections([collection], 'deprecate');
        },
        isHidden: (collection) => {
          if (!canDeprecate) return true;
          return !!collection?.is_deprecated;
        },
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: BanIcon,
        label: t('Undeprecate collection'),
        onClick: (collection) => {
          deprecateOrUndeprecateCollections([collection], 'undeprecate');
        },
        isHidden: (collection) => {
          if (!canDeprecate) return true;
          return !collection?.is_deprecated;
        },
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: CopyIcon,
        label: t('Copy version to repositories'),
        onClick: (collection) => {
          copyToRepository(collection, 'copy');
        },
        isHidden: () => !canCopy,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: UploadIcon,
        variant: ButtonVariant.primary,
        isPinned: true,
        label: t('Upload new version'),
        onClick: () => pageNavigate(HubRoute.UploadCollection),
        isHidden: () => !canUpload,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete version from system'),
        isDanger: true,
        onClick: (collection) => {
          deleteCollectionsVersions([collection]);
        },
        isHidden: () => !detail || !canDelete,
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
        isHidden: () => !detail || !canRemove,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete entire collection from repository'),
        onClick: (collection) => deleteCollectionsFromRepository([collection]),
        isDanger: true,
        isHidden: () => !canRemove,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete entire collection from system'),
        onClick: (collection) => deleteCollections([collection]),
        isDanger: true,
        isHidden: () => !canDelete,
      },
    ],
    [
      t,
      canSign,
      canDelete,
      canDeprecate,
      canRemove,
      canCopy,
      canUpload,
      signCollection,
      deprecateOrUndeprecateCollections,
      detail,
      signCollectionVersion,
      copyToRepository,
      pageNavigate,
      deleteCollectionsVersions,
      deleteCollectionsVersionsFromRepository,
      deleteCollectionsFromRepository,
      deleteCollections,
    ]
  );
}
