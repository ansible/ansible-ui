import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IAwxView } from '../../../common/useAwxView';
import { AwxRoute } from '../../../main/AwxRoutes';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useDeleteGroups } from '../../groups/hooks/useDeleteGroups';
import { useParams } from 'react-router-dom';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { ButtonVariant } from '@patternfly/react-core';
import { cannotDeleteResources } from '../../../../common/utils/RBAChelpers';

export function useInventoriesGroupsToolbarActions(view: IAwxView<InventoryGroup>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const onDelete = () => {
    view.unselectAll();
    void view.refresh();
  };
  const deleteGroups = useDeleteGroups(onDelete);
  const params = useParams<{ id: string; inventory_type: string }>();

  const adhocOptions = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/inventories/${params.id ?? ''}/ad_hoc_commands/`
  ).data;
  const canRunAdHocCommand = Boolean(
    adhocOptions && adhocOptions.actions && adhocOptions.actions['POST']
  );

  const groupOptions = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/inventories/${params.id ?? ''}/groups/`
  ).data;
  const canCreateGroup = Boolean(
    groupOptions && groupOptions.actions && groupOptions.actions['POST']
  );

  return useMemo<IPageAction<InventoryGroup>[]>(() => {
    const actions: IPageAction<InventoryGroup>[] = [];

    if (params.inventory_type === 'inventory') {
      actions.push({
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create group'),
        onClick: () =>
          pageNavigate(String(AwxRoute.InventoryGroupCreate), {
            params: { inventory_type: params.inventory_type, id: params.id },
          }),
        isDisabled: () =>
          canCreateGroup
            ? undefined
            : t(
                'You do not have permission to create a group. Please contact your organization administrator if there is an issue with your access.'
              ),
      });
    }

    actions.push({
      type: PageActionType.Button,
      selection: PageActionSelection.None,
      variant: ButtonVariant.secondary,
      isPinned: true,
      label: t('Run Command'),
      onClick: () => pageNavigate(AwxRoute.Inventories),
      isDisabled: () =>
        view.selectedItems.length === 0
          ? t('Select at least one item from the list')
          : canRunAdHocCommand
            ? undefined
            : t(
                'You do not have permission to run an ad hoc command. Please contact your organization administrator if there is an issue with your access.'
              ),
    });

    if (params.inventory_type === 'inventory') {
      actions.push({ type: PageActionType.Seperator });

      actions.push({
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected groups'),
        onClick: deleteGroups,
        isDanger: true,
        isDisabled:
          view.selectedItems.length === 0
            ? t('Select at least one item from the list')
            : (groups: InventoryGroup[]) => cannotDeleteResources(groups, t),
      });
    }
    return actions;
  }, [
    t,
    deleteGroups,
    pageNavigate,
    params.inventory_type,
    params.id,
    canCreateGroup,
    canRunAdHocCommand,
    view.selectedItems.length,
  ]);
}
