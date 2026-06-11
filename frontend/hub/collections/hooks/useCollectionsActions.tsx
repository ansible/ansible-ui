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
import { useCanSignNamespace, useCollectionPermissionCheck } from '../../common/utils/canSign';
import { HubNamespace } from '../../namespaces/HubNamespace';
import { HubRoute } from '../../main/HubRoutes';
import { CollectionVersionSearch } from '../Collection';
import { useDeleteCollections } from './useDeleteCollections';
import { useDeprecateOrUndeprecateCollections } from './useDeprecateOrUndeprecateCollections';
import { useSignCollection } from './useSignCollection';

export function useCollectionsActions(
  callback: (collections: CollectionVersionSearch[]) => void,
  namespace?: string,
  namespaceObj?: HubNamespace
) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteCollections = useDeleteCollections(callback);
  const deprecateOrUndeprecateCollections = useDeprecateOrUndeprecateCollections(callback);
  const signCollection = useSignCollection(false, callback);

  const canSignFeatureFlag = useCanSignNamespace();
  const { featureFlags } = useHubContext();
  const { can_upload_signatures } = featureFlags;

  // When a namespace object is provided (e.g., on the namespace detail page),
  // use hasPerm which checks model-level + object-level + superuser permissions,
  // matching ansible-hub-ui's hasPerm pattern.
  // When no namespace is provided (e.g., main collections list), fall back to model-level only.
  const hasPerm = useCollectionPermissionCheck(namespaceObj);
  const isInsights = isInsightsMode();
  const canDelete =
    !isInsights || hasPerm('ansible.delete_collection') || hasPerm('galaxy.change_namespace');
  const canDeprecate = !isInsights || hasPerm('galaxy.change_namespace');
  const canUpload = !isInsights || hasPerm('galaxy.upload_to_namespace');
  const canSign =
    canSignFeatureFlag &&
    !can_upload_signatures &&
    (!isInsights || (hasPerm('galaxy.change_namespace') && hasPerm('galaxy.upload_to_namespace')));

  return useMemo<IPageAction<CollectionVersionSearch>[]>(
    () =>
      [
        canUpload
          ? {
              type: PageActionType.Button as const,
              selection: PageActionSelection.None as const,
              icon: UploadIcon,
              variant: ButtonVariant.primary,
              isPinned: true,
              label: t('Upload collection'),
              onClick: () =>
                pageNavigate(
                  HubRoute.UploadCollection,
                  namespace ? { query: { namespace } } : undefined
                ),
            }
          : null,
        canSign
          ? {
              type: PageActionType.Button as const,
              selection: PageActionSelection.Multiple as const,
              icon: KeyIcon,
              label: t('Sign collections'),
              onClick: (collections: CollectionVersionSearch[]) => {
                signCollection(collections);
              },
            }
          : null,
        canDeprecate
          ? {
              type: PageActionType.Button as const,
              selection: PageActionSelection.Multiple as const,
              icon: BanIcon,
              label: t('Deprecate collections'),
              onClick: (collections: CollectionVersionSearch[]) => {
                deprecateOrUndeprecateCollections(collections, 'deprecate');
              },
            }
          : null,
        canDelete ? ({ type: PageActionType.Seperator } as const) : null,
        canDelete
          ? {
              type: PageActionType.Button as const,
              selection: PageActionSelection.Multiple as const,
              icon: TrashIcon,
              label: t('Delete collections'),
              onClick: (collections: CollectionVersionSearch[]) => {
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
            }
          : null,
      ].filter(Boolean) as IPageAction<CollectionVersionSearch>[],
    [
      t,
      pageNavigate,
      namespace,
      deprecateOrUndeprecateCollections,
      signCollection,
      canSign,
      canDelete,
      canDeprecate,
      canUpload,
      deleteCollections,
    ]
  );
}
