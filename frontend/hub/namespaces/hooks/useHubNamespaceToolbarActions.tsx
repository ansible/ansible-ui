import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
} from '../../../../framework';
import { IHubView } from '../../common/useHubView';
import { HubRoute } from '../../main/HubRoutes';
import { HubNamespace } from '../HubNamespace';
import { useDeleteHubNamespaces } from './useDeleteHubNamespaces';

export function useHubNamespaceToolbarActions(view: IHubView<HubNamespace>) {
  const { t } = useTranslation();
  const deleteHubNamespaces = useDeleteHubNamespaces(view.unselectItemsAndRefresh);
  const getPageUrl = useGetPageUrl();

  return useMemo<IPageAction<HubNamespace>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        isPinned: true,
        variant: ButtonVariant.primary,
        icon: PlusCircleIcon,
        label: t('Create namespace'),
        href: getPageUrl(HubRoute.CreateNamespace),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected namespaces'),
        onClick: deleteHubNamespaces,
        isDanger: true,
      },
    ],
    [deleteHubNamespaces, getPageUrl, t]
  );
}
