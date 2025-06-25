import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { cannotDeleteResource, cannotEditResource } from '@ansible/common-ui/utils/RBAChelpers';
import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useDeleteGroups } from '../../groups/hooks/useDeleteGroups';

export function useInventoriesGroupActions() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string; inventory_type: string }>();

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
        variant: ButtonVariant.primary,
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
        icon: TrashIcon,
        label: t('Delete group'),
        isHidden: () => params.inventory_type === 'constructed_inventory',
        onClick: (group) => deleteGroups([group]),
        isDisabled: (group) => cannotDeleteResource(group, t),
        isDanger: true,
      },
    ],
    [t, pageNavigate, params.inventory_type, deleteGroups]
  );
}
