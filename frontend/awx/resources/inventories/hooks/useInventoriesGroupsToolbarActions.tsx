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
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useDeleteGroups } from '../../groups/hooks/useDeleteGroups';
import { useParams } from 'react-router-dom';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxGroup } from '../../../interfaces/AwxGroup';
import { ButtonVariant } from '@patternfly/react-core';
import { cannotDeleteResources } from '../../../../common/utils/RBAChelpers';

export function useInventoriesGroupsToolbarActions(view: IAwxView<AwxGroup>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteGroups = useDeleteGroups(view.unselectItemsAndRefresh);
  const params = useParams<{ id: string; inventory_type: string }>();

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

  return useMemo<IPageAction<AwxGroup>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Create group'),
        onClick: () =>
          pageNavigate(String(AwxRoute.InventoryGroupsAdd), {
            params: { inventory_type: params.inventory_type, id: params.id },
          }),
        isDisabled: () =>
          canCreateGroup
            ? undefined
            : t(
                'You do not have permission to create a group. Please contact your organization administrator if there is an issue with your access.'
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
          view.selectedItems.length === 0
            ? t('Select at least one item from the list')
            : canRunAdHocCommand
              ? undefined
              : t(
                  'You do not have permission to run an ad hoc command. Please contact your organization administrator if there is an issue with your access.'
                ),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        isPinned: true,
        icon: TrashIcon,
        label: t('Delete group'),
        onClick: deleteGroups,
        isDanger: true,
        isDisabled:
          view.selectedItems.length === 0
            ? t('Select at least one item from the list')
            : (groups: AwxGroup[]) => cannotDeleteResources(groups, t),
      },
    ],
    [
      t,
      deleteGroups,
      pageNavigate,
      params.inventory_type,
      params.id,
      canCreateGroup,
      canRunAdHocCommand,
      view.selectedItems.length,
    ]
  );
}
