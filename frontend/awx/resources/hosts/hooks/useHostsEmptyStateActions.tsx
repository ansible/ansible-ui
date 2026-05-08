import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageAlertToaster,
  usePageDialog,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { postRequest } from '@ansible/common-ui/crud/Data';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { awxAPI } from '../../../common/api/awx-utils';
import { IAwxView } from '../../../common/useAwxView';
import { AwxHost } from '../../../interfaces/AwxHost';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { AwxRoute } from '../../../main/AwxRoutes';
import { HostSelectDialog } from './useHostSelectDialog';

export function useHostsEmptyStateActions(view: IAwxView<AwxHost>) {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const params = useParams<{
    id: string;
    group_id: string;
    inventory_type: string;
    host_id: string;
  }>();
  const alertToaster = usePageAlertToaster();
  const pageNavigate = usePageNavigate();

  const hostOptions = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/inventories/${params.id ?? ''}/hosts/`
  ).data;
  const canCreateHost = Boolean(hostOptions?.actions?.['POST']);

  const onSelectedHosts = useCallback(
    async (selectedHosts: AwxHost[]) => {
      for (const host of selectedHosts) {
        try {
          await postRequest(awxAPI`/groups/${params.group_id as string}/hosts/`, {
            id: host.id,
          }).then(() => void view.refresh());
        } catch (err) {
          alertToaster.addAlert({
            variant: 'danger',
            title: t(`Failed to add ${host.name} to related groups`),
            children: err instanceof Error && err.message,
          });
        }
      }
      setDialog(undefined);
    },
    [setDialog, params.group_id, alertToaster, t, view]
  );

  return useMemo<IPageAction<AwxHost>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        icon: PlusCircleIcon,
        label: t('Add existing host'),
        isPinned: true,
        onClick: () =>
          setDialog(
            <HostSelectDialog
              inventoryId={params.id as string}
              groupId={params.group_id as string}
              onSelectedHosts={onSelectedHosts}
            />
          ),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        icon: PlusCircleIcon,
        label: t('Create host'),
        isPinned: true,
        onClick: () =>
          params?.group_id
            ? pageNavigate(AwxRoute.InventoryGroupHostAdd, {
                params: {
                  id: params.id,
                  inventory_type: params.inventory_type,
                  group_id: params.group_id,
                },
              })
            : pageNavigate(AwxRoute.CreateHost),
        isDisabled: () =>
          canCreateHost
            ? undefined
            : t(
                'You do not have permission to create a group. Please contact your organization administrator if there is an issue with your access.'
              ),
      },
    ],
    [
      canCreateHost,
      onSelectedHosts,
      pageNavigate,
      params.group_id,
      params.id,
      params.inventory_type,
      setDialog,
      t,
    ]
  );
}
