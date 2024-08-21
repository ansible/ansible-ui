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
import { CogIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useDeleteGroups } from '../../groups/hooks/useDeleteGroups';
import { useParams } from 'react-router-dom';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { ButtonVariant } from '@patternfly/react-core';
import { cannotDeleteResources } from '../../../../common/utils/RBAChelpers';
import { useCallback } from 'react';

export function useInventoriesGroupsToolbarActions(view: IAwxView<InventoryGroup>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const onDelete = () => {
    view.unselectAll();
    void view.refresh();
  };
  const deleteGroups = useDeleteGroups(onDelete);
  const params = useParams<{ id: string; inventory_type: string }>();

  const groupOptions = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/inventories/${params.id ?? ''}/groups/`
  ).data;

  const canCreateGroup = Boolean(
    groupOptions && groupOptions.actions && groupOptions.actions['POST']
  );

  const selectedItems = view.selectedItems || [];
  const runCommandAction = useRunCommandAction<InventoryGroup>({
    ...params,
    selectedItems,
    actionType: 'toolbar',
  });

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

    actions.push(runCommandAction);

    if (params.inventory_type === 'inventory') {
      actions.push({ type: PageActionType.Seperator });

      actions.push({
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete groups'),
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
    runCommandAction,
    view.selectedItems.length,
  ]);
}

export function useRunCommandAction<T extends { name: string }>(
  params: {
    inventory_type?: string;
    id?: string;
    selectedItems?: T[];
    actionType: 'row' | 'toolbar';
  },
  options?: { isPinned?: boolean }
): IPageAction<T> {
  const pageNavigate = usePageNavigate();
  const { t } = useTranslation();

  const adhocOptions = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/inventories/${params.id ?? ''}/ad_hoc_commands/`
  ).data;
  const canRunAdHocCommand = Boolean(
    adhocOptions && adhocOptions.actions && adhocOptions.actions['POST']
  );

  const onClick = useCallback(
    (selectedItems: T[]) => {
      const limit = selectedItems.map((item) => item.name).join(', ');
      const query: { limit?: string; storage?: string } = {};

      if (limit.length < 1800) {
        if (limit) {
          query.limit = limit;
        }
      } else {
        query.storage = 'true';
        localStorage.setItem('runCommandActionSelectedItems', limit);
      }

      pageNavigate(AwxRoute.InventoryRunCommand, {
        params: { inventory_type: params.inventory_type, id: params.id },
        query,
      });
    },
    [pageNavigate, params.inventory_type, params.id]
  );

  const isDisabled = useCallback(() => {
    return canRunAdHocCommand
      ? undefined
      : t(
          'You do not have permission to run an ad hoc command. Please contact your organization administrator if there is an issue with your access.'
        );
  }, [canRunAdHocCommand, t]);

  const toolbarAction = useMemo<IPageAction<T>>(() => {
    return {
      type: PageActionType.Button,
      selection: PageActionSelection.None,
      variant: ButtonVariant.secondary,
      isPinned: options?.isPinned !== undefined ? options?.isPinned : true,
      label: t('Run command'),
      onClick: () => {
        onClick(params.selectedItems || []);
      },
      isDisabled: () => isDisabled(),
    };
  }, [t, options?.isPinned, onClick, isDisabled, params.selectedItems]);

  const rowAction = useMemo<IPageAction<T>>(() => {
    return {
      type: PageActionType.Button,
      selection: PageActionSelection.Single,
      isPinned: options?.isPinned,
      icon: CogIcon,
      label: t('Run command'),
      onClick: (item) => {
        onClick([item]);
      },
      isDisabled: () => isDisabled(),
    };
  }, [t, onClick, isDisabled, options?.isPinned]);

  if (params.actionType === 'toolbar') {
    return toolbarAction;
  }

  if (params.actionType === 'row') {
    return rowAction;
  }

  return {} as IPageAction<T>;
}
