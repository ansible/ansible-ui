import { useMemo } from 'react';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { ButtonVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { EditIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { AwxRoute } from '../../../AwxRoutes';
import { useDeleteInstanceGroups } from './useDeleteInstanceGroups';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { awxAPI } from '../../../api/awx-utils';
import { useOptions } from '../../../../common/crud/useOptions';

export function useDisableCreateInstanceGroup() {
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/instance_groups/`);
  const { t } = useTranslation();
  return useMemo(
    () =>
      data && data.actions && data.actions['POST']
        ? undefined
        : t(
            'You do not have permission to create an instance group. Please contact your organization administrator if there is an issue with your access.'
          ),
    [data, t]
  );
}

export function useInstanceGroupToolbarActions(
  onComplete: (instanceGroups: InstanceGroup[]) => void
) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteInstanceGroups = useDeleteInstanceGroups(onComplete);
  const isCreateActionDisabled = useDisableCreateInstanceGroup();

  return useMemo<IPageAction<InstanceGroup>[]>(
    () => [
      {
        type: PageActionType.Dropdown,
        icon: PlusCircleIcon,
        variant: ButtonVariant.primary,
        isPinned: true,
        selection: PageActionSelection.None,
        label: t('Create group'),
        isDisabled: isCreateActionDisabled,
        actions: [
          {
            type: PageActionType.Button,
            selection: PageActionSelection.None,
            label: t('Create container group'),
            onClick: () => pageNavigate(AwxRoute.CreateInstanceGroup),
          },
          {
            type: PageActionType.Button,
            selection: PageActionSelection.None,
            label: t('Create instance group'),
            onClick: () => pageNavigate(AwxRoute.CreateInstanceGroup),
          },
        ],
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected instance groups'),
        onClick: deleteInstanceGroups,
        isDanger: true,
      },
    ],
    [deleteInstanceGroups, isCreateActionDisabled, pageNavigate, t]
  );
}

export function useInstanceGroupRowActions(onComplete: (instanceGroups: InstanceGroup[]) => void) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteInstanceGroups = useDeleteInstanceGroups(onComplete);

  return useMemo<IPageAction<InstanceGroup>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: EditIcon,
        isPinned: true,
        label: t('Edit instance group'),
        isDisabled: (instanceGroup) =>
          instanceGroup.summary_fields?.user_capabilities?.edit
            ? undefined
            : t(
                'You do not have permission to edit this instance group. Please contact your organization administrator if there is an issue with your access.'
              ),
        isHidden: (instanceGroup) => instanceGroup.is_container_group,
        onClick: (instanceGroup) =>
          pageNavigate(AwxRoute.EditInstanceGroup, { params: { id: instanceGroup.id } }),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: EditIcon,
        isPinned: true,
        label: t('Edit container group'),
        isDisabled: (instanceGroup) =>
          instanceGroup.summary_fields?.user_capabilities?.edit
            ? undefined
            : t(
                'You do not have permission to edit this container group. Please contact your organization administrator if there is an issue with your access.'
              ),
        isHidden: (instanceGroup) => !instanceGroup.is_container_group,
        onClick: (instanceGroup) =>
          pageNavigate(AwxRoute.EditInstanceGroup, { params: { id: instanceGroup.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete instance group'),
        isDisabled: (instanceGroup) =>
          instanceGroup.summary_fields?.user_capabilities?.delete
            ? undefined
            : t(
                'You do not have permission to delete this instance group. Please contact your organization administrator if there is an issue with your access.'
              ),
        isHidden: (instanceGroup) => instanceGroup.is_container_group,
        onClick: (instanceGroup) => deleteInstanceGroups([instanceGroup]),
        isDanger: true,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete container group'),
        isDisabled: (instanceGroup) =>
          instanceGroup.summary_fields?.user_capabilities?.delete
            ? undefined
            : t(
                'You do not have permission to delete this container group. Please contact your organization administrator if there is an issue with your access.'
              ),
        isHidden: (instanceGroup) => !instanceGroup.is_container_group,
        onClick: (instanceGroup) => deleteInstanceGroups([instanceGroup]),
        isDanger: true,
      },
    ],
    [deleteInstanceGroups, pageNavigate, t]
  );
}
