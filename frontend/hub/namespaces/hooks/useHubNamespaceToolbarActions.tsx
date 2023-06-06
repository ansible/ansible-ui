import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { HubNamespace } from '../HubNamespace';
import { useDeleteHubNamespaces } from './useDeleteHubNamespaces';

export function useHubNamespaceToolbarActions() {
  const { t } = useTranslation();
  const deleteHubNamespaces = useDeleteHubNamespaces(() => null);

  return useMemo<IPageAction<HubNamespace>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        isPinned: true,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create namespace'),
        href: RouteObj.CreateNamespace,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected namesapces'),
        onClick: deleteHubNamespaces,
        isDanger: true,
      },
    ],
    [deleteHubNamespaces, t]
  );
}
