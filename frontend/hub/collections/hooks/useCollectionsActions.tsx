import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { ButtonVariant } from '@patternfly/react-core';
import { BanIcon, KeyIcon, TrashIcon, UploadIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isInsightsMode } from '../../common/isInsights';
import { useHubContext } from '../../common/useHubContext';
import { useCanSignNamespace } from '../../common/utils/canSign';
import { HubRoute } from '../../main/HubRoutes';
import { CollectionVersionSearch } from '../Collection';
import { useDeleteCollections } from './useDeleteCollections';
import { useDeprecateOrUndeprecateCollections } from './useDeprecateOrUndeprecateCollections';
import { useSignCollection } from './useSignCollection';

export function useCollectionsActions(
  callback: (collections: CollectionVersionSearch[]) => void,
  namespace?: string
) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteCollections = useDeleteCollections(callback);
  const deprecateOrUndeprecateCollections = useDeprecateOrUndeprecateCollections(callback);
  const signCollection = useSignCollection(false, callback);

  const canSignFeatureFlag = useCanSignNamespace();
  const { hasPermission, user, featureFlags } = useHubContext();
  const { can_upload_signatures } = featureFlags;

  // In Insights mode, check model-level permissions for toolbar (bulk) actions
  // Object-level permissions are not available here since toolbar actions span multiple namespaces
  const isInsights = isInsightsMode();
  const canDelete =
    !isInsights ||
    hasPermission('ansible.delete_collection') ||
    hasPermission('galaxy.change_namespace') ||
    !!user?.is_superuser;
  const canDeprecate =
    !isInsights || hasPermission('galaxy.change_namespace') || !!user?.is_superuser;
  const canUpload =
    !isInsights || hasPermission('galaxy.upload_to_namespace') || !!user?.is_superuser;
  const canSign =
    canSignFeatureFlag &&
    !can_upload_signatures &&
    (!isInsights || hasPermission('galaxy.change_namespace') || !!user?.is_superuser);

  return useMemo<IPageAction<CollectionVersionSearch>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        icon: UploadIcon,
        variant: ButtonVariant.primary,
        isPinned: true,
        label: t('Upload collection'),
        onClick: () =>
          pageNavigate(HubRoute.UploadCollection, namespace ? { query: { namespace } } : undefined),
        isHidden: () => !canUpload,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: KeyIcon,
        label: t('Sign collections'),
        onClick: (collections) => {
          signCollection(collections);
        },
        isHidden: () => !canSign,
        isDisabled: () =>
          canSignFeatureFlag ? undefined : t('You do not have the rights for this operation'),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: BanIcon,
        label: t('Deprecate collections'),
        onClick: (collections) => {
          deprecateOrUndeprecateCollections(collections, 'deprecate');
        },
        isHidden: () => !canDeprecate,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete collections'),
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
        isHidden: () => !canDelete,
      },
    ],
    [
      t,
      pageNavigate,
      namespace,
      deprecateOrUndeprecateCollections,
      signCollection,
      canSign,
      canSignFeatureFlag,
      canDelete,
      canDeprecate,
      canUpload,
      deleteCollections,
    ]
  );
}
