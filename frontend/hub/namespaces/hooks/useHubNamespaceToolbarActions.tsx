import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isInsightsMode } from '../../common/isInsights';
import { useHubContext } from '../../common/useHubContext';
import { IHubView } from '../../common/useHubView';
import { HubRoute } from '../../main/HubRoutes';
import { HubNamespace } from '../HubNamespace';
import { useDeleteHubNamespaces } from './useDeleteHubNamespaces';

export function useHubNamespaceToolbarActions(view: IHubView<HubNamespace>) {
  const { t } = useTranslation();
  const deleteHubNamespaces = useDeleteHubNamespaces(view.unselectItemsAndRefresh);
  const getPageUrl = useGetPageUrl();
  const { hasPermission, user } = useHubContext();

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
        label: t('Delete namespaces'),
        onClick: deleteHubNamespaces,
        isDanger: true,
        isHidden: () => {
          if (!isInsightsMode()) return false;
          return !(hasPermission('galaxy.delete_namespace') || user?.is_superuser);
        },
      },
    ],
    [deleteHubNamespaces, getPageUrl, t, hasPermission, user]
  );
}
