import { useMemo } from 'react';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { CodeIcon, PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { AwxRoute } from '../../../main/AwxRoutes';
import { cannotDeleteResource, cannotEditResource } from '../../../../common/utils/RBAChelpers';
import { useParams } from 'react-router-dom';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { useDeleteGroups } from '../../groups/hooks/useDeleteGroups';

export function useInventoriesGroupActions() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string; inventory_type: string }>();

  const adHocOptions = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/inventories/${params.id ?? ''}/ad_hoc_commands/`
  ).data;
  const canRunAdHocCommand = Boolean(
    adHocOptions && adHocOptions.actions && adHocOptions.actions['POST']
  );

  const onDelete = () => {
    pageNavigate(AwxRoute.InventoryGroups, {
      params: { inventory_type: params.inventory_type, id: params.id },
    });
  };

  const deleteGroups = useDeleteGroups(onDelete);

  return useMemo<IPageAction<InventoryGroup>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit group'),
        isHidden: () => params.inventory_type === 'constructed_inventory',
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
          pageNavigate(AwxRoute.InventoryRunCommand, {
            params: {
              inventory_type: params.inventory_type,
              id: group.inventory,
              group_id: group.id,
            },
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
        isHidden: () => params.inventory_type === 'constructed_inventory',
        onClick: (group) => deleteGroups([group]),
        isDisabled: (group) => cannotDeleteResource(group, t),
      },
    ],
    [t, pageNavigate, params.inventory_type, canRunAdHocCommand, deleteGroups]
  );
}
