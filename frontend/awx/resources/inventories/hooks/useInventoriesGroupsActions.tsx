import { useTranslation } from 'react-i18next';
import { AwxGroup } from '../../../interfaces/InventoryGroup';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { useMemo } from 'react';
import { PencilAltIcon } from '@patternfly/react-icons';
import { AwxRoute } from '../../../main/AwxRoutes';
import { cannotEditResource } from '../../../../common/utils/RBAChelpers';

export function useInventoriesGroupsActions() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();

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
            params: { inventory_type: 'inventory', id: group.inventory, group_id: group.id },
          }),
        isDisabled: (group) => cannotEditResource(group, t),
      },
    ],
    [t, pageNavigate]
  );
}
