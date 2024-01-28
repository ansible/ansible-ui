import { useMemo } from 'react';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { AwxGroup } from '../../../interfaces/AwxGroup';
import { CodeIcon, PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { AwxRoute } from '../../../main/AwxRoutes';
import { cannotDeleteResource, cannotEditResource } from '../../../../common/utils/RBAChelpers';
import { useParams } from 'react-router-dom';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { useGroupsColumns } from '../../groups/hooks/useGroupsColumns';

export function useInventoriesGroupActions() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string; inventory_type: string }>();

  const adHocOptions = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/inventories/${params.id ?? ''}/ad_hoc_commands`
  ).data;
  const canRunAdHocCommand = Boolean(
    adHocOptions && adHocOptions.actions && adHocOptions.actions['POST']
  );

  const bulkAction = useAwxBulkConfirmation<AwxGroup>();
  const confirmationColumns = useGroupsColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);

  return useMemo<IPageAction<AwxGroup>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit group'),
        onClick: (group) =>
          pageNavigate(AwxRoute.InventoryGroupEdit, {
            params: {
              inventory_type: params.inventory_type,
              id: group.inventory,
              group_id: group.id,
            },
          }),
        isDisabled: (group) => cannotEditResource(group, t),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: CodeIcon,
        label: t('Run command'),
        onClick: (group) =>
          pageNavigate(AwxRoute.InventoryGroups, {
            params: { inventory_type: 'inventory', id: group.inventory },
          }),
        isDisabled: () =>
          canRunAdHocCommand
            ? undefined
            : t(
                'You do not have permission to run an ad hoc command. Please contact your organization administrator if there is an issue with your access.'
              ),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete group'),
        onClick: (group) => {
          bulkAction({
            title: t('Permanently delete group'),
            confirmText: t('Yes, I confirm that I want to delete this group named {{ name }}', {
              name: group.name,
            }),
            actionButtonText: t('Delete group'),
            items: [group],
            keyFn: getItemKey,
            isDanger: true,
            confirmationColumns,
            actionColumns,
            onComplete: () =>
              pageNavigate(AwxRoute.InventoryGroups, {
                params: { inventory_type: 'inventory', id: group.inventory },
              }),
            actionFn: (group: AwxGroup, signal) =>
              requestDelete(awxAPI`/groups/${group.id.toString()}/`, signal),
          });
        },
        isDisabled: (group) => cannotDeleteResource(group, t),
      },
    ],
    [
      t,
      pageNavigate,
      canRunAdHocCommand,
      params.inventory_type,
      bulkAction,
      actionColumns,
      confirmationColumns,
    ]
  );
}
