import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionType,
  PageActionSelection,
  usePageNavigate,
} from '../../../../../framework';
import { cannotDeleteResources } from '../../../../common/utils/RBAChelpers';
import { AwxRoute } from '../../../main/AwxRoutes';
import { AwxHost } from '../../../interfaces/AwxHost';
import { IAwxView } from '../../../common/useAwxView';
import { useDeleteHosts } from './useDeleteHosts';
import { useOptions } from '../../../../common/crud/useOptions';
import { awxAPI } from '../../../common/api/awx-utils';
import { OptionsResponse, ActionsResponse } from '../../../interfaces/OptionsResponse';

export function useHostsToolbarActions(view: IAwxView<AwxHost>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteHosts = useDeleteHosts(view.unselectItemsAndRefresh);

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/hosts/`);
  const canCreateHost = Boolean(data && data.actions && data.actions['POST']);

  return useMemo<IPageAction<AwxHost>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create host'),
        isDisabled: canCreateHost
          ? undefined
          : t(
              'You do not have permission to create a host. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: () => pageNavigate(AwxRoute.CreateHost),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.secondary,
        isPinned: true,
        label: t('Smart inventory'),
        isDisabled: () =>
          view?.filterState && Object.keys(view.filterState).length !== 0
            ? ''
            : 'Enter at least one search filter to create a new Smart Inventory',
        onClick: () =>
          pageNavigate(AwxRoute.CreateSmartInventory, {
            query: { ...view.filterState },
          }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete hosts'),
        onClick: deleteHosts,
        isDanger: true,
        isDisabled: (hosts: AwxHost[]) => cannotDeleteResources(hosts, t),
      },
    ],
    [pageNavigate, deleteHosts, canCreateHost, view.filterState, t]
  );
}
