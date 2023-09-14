import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../framework';
import { HubRoute } from '../../HubRoutes';
import { HubNamespace } from '../HubNamespace';
import { useDeleteHubNamespaces } from './useDeleteHubNamespaces';

export function useHubNamespaceActions() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteHubNamespaces = useDeleteHubNamespaces(() => null);

  return useMemo(() => {
    const actions: IPageAction<HubNamespace>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: EditIcon,
        label: t('Edit namespace'),
        onClick: (namespace) =>
          pageNavigate(HubRoute.EditNamespace, { params: { id: namespace.name } }),
      },
      { type: PageActionType.Seperator },
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
  }, [deleteHubNamespaces, pageNavigate, t]);
}
