import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionType,
  PageActionSelection,
  usePageNavigate,
} from '../../../../../framework';
import { cannotDeleteResources } from '../../../../common/utils/RBAChelpers';
import { AwxRoute } from '../../../AwxRoutes';
import { AwxHost } from '../../../interfaces/AwxHost';
import { IAwxView } from '../../../useAwxView';
import { useDeleteHosts } from './useDeleteHosts';

export function useHostsToolbarActions(view: IAwxView<AwxHost>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteHosts = useDeleteHosts(view.unselectItemsAndRefresh);
  const params = useParams<{ id: string; inventory_type: string }>();

  return useMemo<IPageAction<AwxHost>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Create host'),
        onClick: () => pageNavigate(AwxRoute.CreateHost),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected hosts'),
        onClick: deleteHosts,
        isDanger: true,
        isDisabled: (hosts: AwxHost[]) => cannotDeleteResources(hosts, t)
      },
    ],
    [pageNavigate, deleteHosts, t]
  );
}
