import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, TrashIcon, ImportIcon, KeyIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../framework';
import { HubRoute } from '../../main/HubRoutes';
import { HubNamespace } from '../HubNamespace';
import { useDeleteHubNamespaces } from './useDeleteHubNamespaces';
import { useWindowLocation } from '../../../../framework/components/useWindowLocation';
import { useSignAllCollections } from '../../collections/hooks/useSignAllCollections';
import { useHubContext } from '../../common/useHubContext';

export function useHubNamespaceActions(options?: {
  onHubNamespacesDeleted: (namespaces: HubNamespace[]) => void;
  onHubNamespacesSignAllCollections?: (namespaces: HubNamespace) => void;
  isDetailsPageAction?: boolean;
}) {
  if (!options) {
    options = { onHubNamespacesDeleted: () => {}, onHubNamespacesSignAllCollections: () => {} };
  }
  const { t } = useTranslation();
  const { settings, featureFlags } = useHubContext();
  const signing_service = settings.GALAXY_COLLECTION_SIGNING_SERVICE;
  const can_upload_signatures = featureFlags.can_upload_signatures;
  const pageNavigate = usePageNavigate();
  const deleteHubNamespaces = useDeleteHubNamespaces(options.onHubNamespacesDeleted);
  const { location } = useWindowLocation();
  const signCollection = useSignAllCollections();

  return useMemo(() => {
    const canSignAllCollections = () =>
      !can_upload_signatures && location?.search.includes('repository');
    const actions: IPageAction<HubNamespace>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit namespace'),
        onClick: (namespace) =>
          pageNavigate(HubRoute.EditNamespace, { params: { id: namespace.name } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        icon: ImportIcon,
        label: t('Imports'),
        onClick: (namespace) =>
          pageNavigate(HubRoute.MyImports, { query: { namespace: namespace.name } }),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        icon: KeyIcon,
        label: t(`Sign all collections`),
        onClick: (namespace) =>
          signCollection({
            onComplete: options.onHubNamespacesSignAllCollections,
            namespace: namespace,
            signing_service: signing_service ?? '',
          }),
        isDisabled: () => (canSignAllCollections() ? '' : t('Select a repository filter')),
        isHidden: () => !options.isDetailsPageAction,
      },

      {
        type: PageActionType.Seperator,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete namespace'),
        onClick: (namespace) => deleteHubNamespaces([namespace]),
        isDanger: true,
      },
    ];
    return actions;
  }, [
    t,
    can_upload_signatures,
    location?.search,
    pageNavigate,
    signCollection,
    options.onHubNamespacesSignAllCollections,
    options.isDetailsPageAction,
    signing_service,
    deleteHubNamespaces,
  ]);
}
