import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { cannotEditResource } from '@ansible/common-ui/utils/RBAChelpers';
import { PencilAltIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useRunCommandAction } from './useInventoriesGroupsToolbarActions';

export function useInventoriesGroupsActions() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string; inventory_type: string }>();

  const runCommandAction = useRunCommandAction<InventoryGroup>(
    { ...params, actionType: 'row' },
    { isPinned: false }
  );

  return useMemo<IPageAction<InventoryGroup>[]>(() => {
    if (params.inventory_type === 'constructed_inventory') {
      return [];
    }

    return [
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
      runCommandAction,
    ];
  }, [t, pageNavigate, runCommandAction, params.inventory_type]);
}
