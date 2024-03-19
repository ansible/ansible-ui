import { useTranslation } from 'react-i18next';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
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
import { ButtonVariant } from '@patternfly/react-core';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { useParams } from 'react-router-dom';

export function useInventoriesGroupsActions() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string; inventory_type: string }>();

  const adHocOptions = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/inventories/${params.id ?? ''}/ad_hoc_commands/`
  ).data;
  const canRunAdHocCommand = Boolean(
    adHocOptions && adHocOptions.actions && adHocOptions.actions['POST']
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
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.secondary,
        label: t('Run Command'),
        onClick: () => pageNavigate(AwxRoute.Inventories),
        isDisabled: () =>
          canRunAdHocCommand
            ? undefined
            : t(
                'You do not have permission to run an ad hoc command. Please contact your organization administrator if there is an issue with your access.'
              ),
      },
    ];
  }, [t, pageNavigate, canRunAdHocCommand, params.inventory_type]);
}
