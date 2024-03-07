import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionType,
  PageActionSelection,
  usePageNavigate,
} from '../../../../../framework';
import { useOptions } from '../../../../common/crud/useOptions';
import { cannotDeleteResources } from '../../../../common/utils/RBAChelpers';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxRoute } from '../../../main/AwxRoutes';
import { InventorySource } from '../../../interfaces/InventorySource';
import { OptionsResponse, ActionsResponse } from '../../../interfaces/OptionsResponse';
import { IAwxView } from '../../../common/useAwxView';
import { useDeleteSources } from '../../sources/hooks/useDeleteSources';

export function useInventoriesSourcesToolbarActions(view: IAwxView<InventorySource>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteSources = useDeleteSources(view.unselectItemsAndRefresh);
  const params = useParams<{ id: string; inventory_type: string }>();

  const sourceOptions = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/inventory_sources/`
  ).data;
  const canCreateSource = Boolean(
    sourceOptions && sourceOptions.actions && sourceOptions.actions['POST']
  );

  return useMemo<IPageAction<InventorySource>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Add source'),
        onClick: () =>
          pageNavigate(String(AwxRoute.InventorySourcesAdd), {
            params: { inventory_type: params.inventory_type, id: params.id },
          }),
        isDisabled: () =>
          canCreateSource
            ? undefined
            : t(
                'You do not have permission to create a source. Please contact your organization administrator if there is an issue with your access.'
              ),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected sources'),
        onClick: deleteSources,
        isDanger: true,
        isDisabled: (sources: InventorySource[]) => cannotDeleteResources(sources, t),
      },
    ],
    [t, deleteSources, pageNavigate, params.inventory_type, params.id, canCreateSource]
  );
}
