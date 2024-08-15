import { ButtonVariant } from '@patternfly/react-core';
import { BanIcon, CopyIcon, TrashIcon, UploadIcon, KeyIcon } from '@patternfly/react-icons';
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
import { useCopyToRepository } from './useCopyToRepository';
import { useDeleteCollections } from './useDeleteCollections';
import { useDeleteCollectionsFromRepository } from './useDeleteCollectionsFromRepository';
import { useDeprecateOrUndeprecateCollections } from './useDeprecateOrUndeprecateCollections';
import { useSignCollection } from './useSignCollection';
import { useUploadSignature } from './useUploadSignature';
import { useCanSignNamespace } from '../../common/utils/canSign';

export function useCollectionActions(
  callback: (collections: CollectionVersionSearch[]) => void,
  // determine if the menu item is rendered in list or in detail, which defines its redirections
  detail?: boolean
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
  const uploadSignature = useUploadSignature();

  const { featureFlags } = useHubContext();

  const { can_upload_signatures } = featureFlags;

  const canSign = useCanSignNamespace();

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
        isHidden: () => (detail && canSign ? false : true),
        onClick: (collection) => {
          if (can_upload_signatures) {
            // upload signature - it works only in insights, but we can leave it here for now
            // because insights will be next
            uploadSignature(collection);
          } else {
            // sign version
            signCollectionVersion([collection]);
          }
        },
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: BanIcon,
        label: t('Deprecate'),
        onClick: (collection) => {
          deprecateOrUndeprecateCollections([collection], 'deprecate');
        },
        isHidden: (collection) => {
          return collection?.is_deprecated ? true : false;
        },
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: BanIcon,
        label: t('Undeprecate'),
        onClick: (collection) => {
          deprecateOrUndeprecateCollections([collection], 'undeprecate');
        },
        isHidden: (collection) => {
          return collection?.is_deprecated ? false : true;
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
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: UploadIcon,
        variant: ButtonVariant.primary,
        isPinned: true,
        label: t('Upload new version'),
        onClick: () => pageNavigate(HubRoute.UploadCollection),
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
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete entire collection from repository'),
        onClick: (collection) => deleteCollectionsFromRepository([collection]),
        isDanger: true,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete entire collection from system'),
        onClick: (collection) => deleteCollections([collection]),
        isDanger: true,
      },
    ],
    [
      t,
      canSign,
      signCollection,
      deprecateOrUndeprecateCollections,
      detail,
      can_upload_signatures,
      uploadSignature,
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
