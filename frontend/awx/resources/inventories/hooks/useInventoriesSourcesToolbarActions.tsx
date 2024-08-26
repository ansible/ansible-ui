import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, RocketIcon, TrashIcon } from '@patternfly/react-icons';
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
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { usePageAlertToaster } from '../../../../../framework';

export function useInventoriesSourcesToolbarActions(
  view: IAwxView<InventorySource>,
  inventory_id: string
) {
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

  const { activeAwxUser } = useAwxActiveUser();

  let cannotLaunchInventorySourcesUpdate: string = '';

  if (view.pageItems === undefined || view.pageItems.length === 0) {
    cannotLaunchInventorySourcesUpdate = t('There are no inventory sources to update');
  }

  if (
    (view.pageItems &&
      !view.pageItems.every((item) => item.summary_fields.user_capabilities.start)) ||
    activeAwxUser?.is_system_auditor
  ) {
    cannotLaunchInventorySourcesUpdate = t(
      `The inventory source cannot be updated due to insufficient permission`
    );
  }

  const syncAll = useSyncAll(inventory_id, view.refresh);

  return useMemo<IPageAction<InventorySource>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create source'),
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
        label: t('Delete sources'),
        onClick: deleteSources,
        isDanger: true,
        isDisabled: (sources: InventorySource[]) => cannotDeleteResources(sources, t),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        icon: RocketIcon,
        label: t('Launch inventory updates'),
        onClick: syncAll,
        isDisabled: () => cannotLaunchInventorySourcesUpdate,
      },
    ],
    [
      t,
      deleteSources,
      pageNavigate,
      params.inventory_type,
      params.id,
      canCreateSource,
      cannotLaunchInventorySourcesUpdate,
      syncAll,
    ]
  );
}

function useSyncAll(inventory_id: string, refresh: () => Promise<void>): () => void {
  const url = awxAPI`/inventories/${inventory_id}/update_inventory_sources/`;
  const postRequest = usePostRequest();
  const alertToaster = usePageAlertToaster();
  const { t } = useTranslation();

  return () => {
    void (async () => {
      try {
        await postRequest(url, {});
        void refresh();
      } catch (error) {
        alertToaster.addAlert({
          variant: 'danger',
          title: t('Failed to sync all inventory sources'),
          children: error instanceof Error ? error.message : String(error),
          timeout: 5000,
        });
      }
    })();
  };
}
