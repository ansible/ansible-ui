import { useTranslation } from 'react-i18next';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageAlertToaster,
  usePageDialog,
  usePageNavigate,
} from '../../../../../framework';
import { useCallback, useMemo } from 'react';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useParams } from 'react-router-dom';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { GroupSelectDialog } from './useGroupSelectDialog';
import { postRequest } from '../../../../common/crud/Data';
import { ButtonVariant } from '@patternfly/react-core';
import { IAwxView } from '../../../common/useAwxView';

export function useRelatedGroupsEmptyStateActions(view: IAwxView<InventoryGroup>) {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string; inventory_type: string; group_id: string }>();
  const alertToaster = usePageAlertToaster();

  const groupOptions = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/inventories/${params.id ?? ''}/groups/`
  ).data;
  const canCreateGroup = Boolean(
    groupOptions && groupOptions.actions && groupOptions.actions['POST']
  );

  const onSelectedGroups = useCallback(
    async (selectedGroups: InventoryGroup[]) => {
      for (const group of selectedGroups) {
        try {
          await postRequest(awxAPI`/groups/${params.group_id as string}/children/`, {
            id: group.id,
          }).then(() => void view.refresh());
        } catch (err) {
          alertToaster.addAlert({
            variant: 'danger',
            title: t(`Failed to add ${group.name} to related groups`),
            children: err instanceof Error && err.message,
          });
        }
      }
      setDialog(undefined);
    },
    [setDialog, params.group_id, alertToaster, t, view]
  );

  return useMemo<IPageAction<InventoryGroup>[]>(() => {
    if (params.inventory_type === 'constructed_inventory') {
      return [];
    }

    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        label: t('Existing group'),
        isPinned: true,
        onClick: () =>
          setDialog(
            <GroupSelectDialog
              groupId={params.group_id as string}
              onSelectedGroups={onSelectedGroups}
            />
          ),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        label: t('New group'),
        isPinned: true,
        onClick: () =>
          pageNavigate(String(AwxRoute.InventoryGroupRelatedGroupsCreate), {
            params: {
              inventory_type: params.inventory_type,
              id: params.id,
              group_id: params.group_id,
            },
          }),
        isDisabled: () =>
          canCreateGroup
            ? undefined
            : t(
                'You do not have permission to create a group. Please contact your organization administrator if there is an issue with your access.'
              ),
      },
    ];
  }, [
    canCreateGroup,
    onSelectedGroups,
    pageNavigate,
    params.group_id,
    params.id,
    params.inventory_type,
    setDialog,
    t,
  ]);
}
