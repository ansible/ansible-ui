import { PencilAltIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../../framework';
import { cannotEditResource } from '../../../../../common/utils/RBAChelpers';
import { AwxRoute } from '../../../../main/AwxRoutes';
import { InventoryGroup } from '../../../../interfaces/InventoryGroup';
import { useParams } from 'react-router-dom';

export function useHostsGroupsActions() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ inventory_type: string; id: string }>();

  return useMemo<IPageAction<InventoryGroup>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit group'),
        onClick: (group) =>
          pageNavigate(AwxRoute.InventoryGroupEdit, {
            params: { inventory_type: params.inventory_type, id: params.id, group_id: group.id },
          }),
        isDisabled: (group) => cannotEditResource(group, t),
      },
    ],
    [t, pageNavigate, params.id, params.inventory_type]
  );
}
