import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IAwxView } from '../../../common/useAwxView';
import { AwxRoute } from '../../../main/AwxRoutes';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageAlertToaster,
  usePageDialog,
  usePageNavigate,
} from '../../../../../framework';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useParams } from 'react-router-dom';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { ButtonVariant } from '@patternfly/react-core';
import { useDisassociateGroups } from './useDisassociateGroups';
import { GroupSelectDialog } from './useGroupSelectDialog';
import { usePostRequest } from '../../../../common/crud/usePostRequest';

export function useRelatedGroupsToolbarActions(view: IAwxView<InventoryGroup>) {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const disassociateGroups = useDisassociateGroups(view.unselectItemsAndRefresh);
  const params = useParams<{ id: string; inventory_type: string; group_id: string }>();
  const postRequest = usePostRequest();
  const alertToaster = usePageAlertToaster();

  const isConstructed = params.inventory_type === 'constructed_inventory';

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

  const onSelectedGroups = useCallback(
    async (selectedGroups: InventoryGroup[]) => {
      for (const group of selectedGroups) {
        try {
          await postRequest(awxAPI`/groups/${params.group_id as string}/children/`, {
            id: group.id,
          }).then(() => void view.refresh());
        } catch (err) {
          alertToaster.addAlert({
            variant: 'danger',
            title: t(`Failed to add ${group.name} to related groups`),
            children: err instanceof Error && err.message,
          });
        }
      }
      setDialog(undefined);
    },
    [setDialog, postRequest, params.group_id, view, alertToaster, t]
  );

  return useMemo<IPageAction<InventoryGroup>[]>(() => {
    const items: IPageAction<InventoryGroup>[] = [];

    if (isConstructed === false) {
      items.push({
        type: PageActionType.Dropdown,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Add group'),
        actions: [
          {
            type: PageActionType.Button,
            selection: PageActionSelection.None,
            label: t('Add existing group'),
            onClick: () =>
              setDialog(
                <GroupSelectDialog
                  groupId={params.group_id as string}
                  onSelectedGroups={onSelectedGroups}
                />
              ),
          },
          {
            type: PageActionType.Button,
            selection: PageActionSelection.None,
            label: t('Create new group'),
            isHidden: () => isConstructed,
            onClick: () =>
              pageNavigate(String(AwxRoute.InventoryGroupRelatedGroupsCreate), {
                params: {
                  inventory_type: params.inventory_type,
                  id: params.id,
                  group_id: params.group_id,
                },
              }),
            isDisabled: () =>
              canCreateGroup
                ? undefined
                : t(
                    'You do not have permission to create a group. Please contact your organization administrator if there is an issue with your access.'
                  ),
          },
        ],
      });
    }

    items.push({
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
    });

    if (isConstructed === false) {
      items.push({ type: PageActionType.Seperator });
      items.push({
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Disassociate selected groups'),
        onClick: disassociateGroups,
        isDanger: true,
        isDisabled:
          view.selectedItems.length === 0 ? t('Select at least one item from the list') : undefined,
      });
    }
    return items;
  }, [
    t,
    disassociateGroups,
    pageNavigate,
    params.inventory_type,
    params.id,
    canCreateGroup,
    canRunAdHocCommand,
    view.selectedItems.length,
    params.group_id,
    onSelectedGroups,
    setDialog,
    isConstructed,
  ]);
}
