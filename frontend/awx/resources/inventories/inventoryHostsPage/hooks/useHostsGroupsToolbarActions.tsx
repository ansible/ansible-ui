import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionType,
  PageActionSelection,
  usePageNavigate,
} from '../../../../../../framework';
import { useOptions } from '../../../../../common/crud/useOptions';
import { awxAPI } from '../../../../common/api/awx-utils';
import { AwxRoute } from '../../../../main/AwxRoutes';
import { OptionsResponse, ActionsResponse } from '../../../../interfaces/OptionsResponse';
import { InventoryGroup } from '../../../../interfaces/InventoryGroup';
import { IAwxView } from '../../../../common/useAwxView';
import { useDisassociateGroups } from './useDisassociateGroups';
import { useInventoryHostGroupsAddModal } from '../InventoryHostGroupsModal';
import { useAddInventoryGroups } from './useAddInventoryGroups';

export function useHostsGroupsToolbarActions(view: IAwxView<InventoryGroup>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string; inventory_type: string; host_id: string }>();

  const disassociateGroups = useDisassociateGroups(view.unselectItemsAndRefresh);

  const adhocOptions = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/inventories/${params.id ?? ''}/ad_hoc_commands`
  ).data;
  const canRunAdHocCommand = Boolean(
    adhocOptions && adhocOptions.actions && adhocOptions.actions['POST']
  );

  const groupOptions = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/groups`).data;
  const canCreateGroup = Boolean(
    groupOptions && groupOptions.actions && groupOptions.actions['POST']
  );

  const openInventoryHostsGroupsAddModal = useInventoryHostGroupsAddModal();
  const addGroups = useAddInventoryGroups(view.unselectItemsAndRefresh);

  return useMemo<IPageAction<InventoryGroup>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Add'),
        onClick: () => openInventoryHostsGroupsAddModal({ onAdd: addGroups }),
        isDisabled: () =>
          canCreateGroup
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
        label: t('Disassociate'),
        isDisabled:
          view.selectedItems.length === 0 ? t('Select at least one item from the list') : undefined,
        onClick: disassociateGroups,
        isPinned: true,
      },
    ],
    [
      t,
      view.selectedItems.length,
      disassociateGroups,
      openInventoryHostsGroupsAddModal,
      addGroups,
      canCreateGroup,
      pageNavigate,
      canRunAdHocCommand,
    ]
  );
}
