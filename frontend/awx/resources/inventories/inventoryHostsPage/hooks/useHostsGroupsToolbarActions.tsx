import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionType, PageActionSelection } from '../../../../../../framework';
import { useOptions } from '../../../../../common/crud/useOptions';
import { awxAPI } from '../../../../common/api/awx-utils';
import { OptionsResponse, ActionsResponse } from '../../../../interfaces/OptionsResponse';
import { InventoryGroup } from '../../../../interfaces/InventoryGroup';
import { IAwxView } from '../../../../common/useAwxView';
import { useDisassociateGroups } from './useDisassociateGroups';
import { useInventoryHostGroupsAddModal } from '../InventoryHostGroupsModal';
import { useAssociateGroupsToHost } from './useAssociateGroupsToHost';
import { useRunCommandAction } from '../../hooks/useInventoriesGroupsToolbarActions';
import { useParams } from 'react-router-dom';

export function useHostsGroupsToolbarActions(
  view: IAwxView<InventoryGroup>,
  inventoryId: string,
  hostId: string,
  type: 'standaloneHost' | 'inventoryHost'
) {
  const { t } = useTranslation();

  const disassociateGroups = useDisassociateGroups(view.unselectItemsAndRefresh, hostId);

  const groupOptions = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/groups/`).data;
  const canCreateGroup = Boolean(
    groupOptions && groupOptions.actions && groupOptions.actions['POST']
  );

  const openInventoryHostsGroupsAddModal = useInventoryHostGroupsAddModal();
  const associateGroups = useAssociateGroupsToHost(view.unselectItemsAndRefresh, hostId);

  const params = useParams<{ id: string; inventory_type: string }>();
  const runCommandAction = useRunCommandAction<InventoryGroup>({
    ...params,
    selectedItems: view.selectedItems || [],
    actionType: 'toolbar',
  });

  return useMemo<IPageAction<InventoryGroup>[]>(() => {
    const arr: IPageAction<InventoryGroup>[] = [];

    arr.push({
      type: PageActionType.Button,
      selection: PageActionSelection.None,
      variant: ButtonVariant.primary,
      isPinned: true,
      icon: PlusCircleIcon,
      label: t('Associate group'),
      onClick: () =>
        openInventoryHostsGroupsAddModal({
          onAdd: associateGroups,
          inventoryId: inventoryId ?? '',
          hostId: hostId ?? '',
        }),
      isDisabled: () =>
        canCreateGroup
          ? undefined
          : t(
              'You do not have permission to create a host. Please contact your organization administrator if there is an issue with your access.'
            ),
    });

    arr.push({ type: PageActionType.Seperator });

    if (type === 'inventoryHost') {
      arr.push(runCommandAction);
    }

    arr.push({ type: PageActionType.Seperator });

    arr.push({
      type: PageActionType.Button,
      selection: PageActionSelection.Multiple,
      label: t('Disassociate groups'),
      isDisabled:
        view.selectedItems.length === 0 ? t('Select at least one item from the list') : undefined,
      onClick: disassociateGroups,
      isPinned: true,
    });

    return arr;
  }, [
    t,
    view.selectedItems.length,
    disassociateGroups,
    openInventoryHostsGroupsAddModal,
    associateGroups,
    canCreateGroup,
    hostId,
    inventoryId,
    runCommandAction,
    type,
  ]);
}
