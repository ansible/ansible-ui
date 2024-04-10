import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionType,
  PageActionSelection,
  usePageNavigate,
  usePageAlertToaster,
  usePageDialog,
} from '../../../../../framework';
import { useOptions } from '../../../../common/crud/useOptions';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxRoute } from '../../../main/AwxRoutes';
import { AwxHost } from '../../../interfaces/AwxHost';
import { OptionsResponse, ActionsResponse } from '../../../interfaces/OptionsResponse';
import { IAwxView } from '../../../common/useAwxView';
import { useDisassociateHosts } from '../../hosts/hooks/useDisassociateHosts';
import { postRequest } from '../../../../common/crud/Data';
import { HostSelectDialog } from '../../hosts/hooks/useHostSelectDialog';

export function useInventoriesGroupsHostsToolbarActions(view: IAwxView<AwxHost>) {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const disassociateHosts = useDisassociateHosts(view.unselectItemsAndRefresh);
  const params = useParams<{ id: string; group_id: string; inventory_type: string }>();
  const alertToaster = usePageAlertToaster();

  const adhocOptions = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/inventories/${params.id ?? ''}/ad_hoc_commands/`
  ).data;
  const canRunAdHocCommand = Boolean(
    adhocOptions && adhocOptions.actions && adhocOptions.actions['POST']
  );

  const hostOptions = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/hosts/`).data;
  const canCreateHost = Boolean(hostOptions && hostOptions.actions && hostOptions.actions['POST']);

  const onSelectedHosts = useCallback(
    async (selectedHosts: AwxHost[]) => {
      for (const host of selectedHosts) {
        try {
          await postRequest(awxAPI`/groups/${params.group_id as string}/hosts/`, {
            id: host.id,
          }).then(() => void view.refresh());
        } catch (err) {
          alertToaster.addAlert({
            variant: 'danger',
            title: t(`Failed to add ${host.name} to related groups`),
            children: err instanceof Error && err.message,
          });
        }
      }
      setDialog(undefined);
    },
    [setDialog, params.group_id, view, alertToaster, t]
  );

  return useMemo<IPageAction<AwxHost>[]>(() => {
    const toolbarActions: IPageAction<AwxHost>[] = [
      {
        type: PageActionType.Dropdown,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        isHidden: () => params.inventory_type === 'constructed_inventory',
        icon: PlusCircleIcon,
        label: t('Add host'),
        actions: [
          {
            type: PageActionType.Button,
            selection: PageActionSelection.None,
            label: t('Existing host'),
            onClick: () =>
              setDialog(
                <HostSelectDialog
                  inventoryId={params.id as string}
                  groupId={params.group_id as string}
                  onSelectedHosts={onSelectedHosts}
                />
              ),
          },
          {
            type: PageActionType.Button,
            selection: PageActionSelection.None,
            label: t('New host'),
            onClick: () =>
              pageNavigate(AwxRoute.InventoryGroupHostAdd, {
                params: {
                  id: params?.id,
                  inventory_type: params.inventory_type,
                  group_id: params.group_id,
                },
              }),
            isDisabled: () =>
              canCreateHost
                ? undefined
                : t(
                    'You do not have permission to create a host. Please contact your organization administrator if there is an issue with your access.'
                  ),
          },
        ],
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
    ];

    const disassociateAction: IPageAction<AwxHost> = {
      type: PageActionType.Button,
      selection: PageActionSelection.Multiple,
      isPinned: true,
      label: t('Disassociate selected hosts'),
      onClick: disassociateHosts,
      isDisabled:
        view.selectedItems.length === 0 ? t('Select at least one item from the list') : undefined,
    };

    if (params.inventory_type === 'inventory') {
      toolbarActions.push(disassociateAction);
    }
    return toolbarActions;
  }, [
    t,
    disassociateHosts,
    view.selectedItems.length,
    setDialog,
    params.id,
    params.group_id,
    params.inventory_type,
    onSelectedHosts,
    pageNavigate,
    canCreateHost,
    canRunAdHocCommand,
  ]);
}
