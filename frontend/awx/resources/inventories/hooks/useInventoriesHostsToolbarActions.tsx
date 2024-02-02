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
import { useOptions } from '../../../../common/crud/useOptions';
import { cannotDeleteResources } from '../../../../common/utils/RBAChelpers';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxRoute } from '../../../main/AwxRoutes';
import { AwxHost } from '../../../interfaces/AwxHost';
import { OptionsResponse, ActionsResponse } from '../../../interfaces/OptionsResponse';
import { IAwxView } from '../../../common/useAwxView';
import { useDeleteHosts } from '../../hosts/hooks/useDeleteHosts';

export function useInventoriesHostsToolbarActions(view: IAwxView<AwxHost>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteHosts = useDeleteHosts(view.unselectItemsAndRefresh);
  const params = useParams<{ id: string; inventory_type: string }>();

  const adhocOptions = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/inventories/${params.id ?? ''}/ad_hoc_commands`
  ).data;
  const canRunAdHocCommand = Boolean(
    adhocOptions && adhocOptions.actions && adhocOptions.actions['POST']
  );

  const hostOptions = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/hosts`).data;
  const canCreateHost = Boolean(hostOptions && hostOptions.actions && hostOptions.actions['POST']);

  return useMemo<IPageAction<AwxHost>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Create host'),
        onClick: () =>
          pageNavigate(String(AwxRoute.InventoryHostAdd), {
            params: { inventory_type: params.inventory_type, id: params.id },
          }),
        isDisabled: () =>
          canCreateHost
            ? undefined
            : t(
                'You do not have permission to create a host. Please contact your organization administrator if there is an issue with your access.'
              ),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.secondary,
        isPinned: true,
        label: t('Run Command'),
        onClick: () => pageNavigate(AwxRoute.Inventories),
        isDisabled: () =>
          canRunAdHocCommand
            ? undefined
            : t(
                'You do not have permission to run an ad hoc command. Please contact your organization administrator if there is an issue with your access.'
              ),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected hosts'),
        onClick: deleteHosts,
        isDanger: true,
        isDisabled: (hosts: AwxHost[]) => cannotDeleteResources(hosts, t),
      },
    ],
    [
      t,
      deleteHosts,
      pageNavigate,
      params.inventory_type,
      params.id,
      canCreateHost,
      canRunAdHocCommand,
    ]
  );
}
