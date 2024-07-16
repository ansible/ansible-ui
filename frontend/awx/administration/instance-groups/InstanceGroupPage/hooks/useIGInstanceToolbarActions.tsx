import { useMemo } from 'react';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../../framework';
import { IAwxView } from '../../../../common/useAwxView';
import { Instance } from '../../../../interfaces/Instance';
import { useRunHealthCheckToolbarAction } from '../../../instances/hooks/useInstanceToolbarActions';
import { ButtonVariant } from '@patternfly/react-core';
import { t } from 'i18next';
import { useAssociateInstanceToIG } from './useAssociateInstanceToIG';
import { useParams } from 'react-router-dom';
import { useAssociateInstanceModal } from './useAssociateInstanceModal';
import { useDisassociateInstanceFromIG } from './useDisassociateInstanceFromIG';
import { useGetItem } from '../../../../../common/crud/useGet';
import { awxAPI } from '../../../../common/api/awx-utils';
import { InstanceGroup } from '../../../../interfaces/InstanceGroup';
import { useOptions } from '../../../../../common/crud/useOptions';
import { OptionsResponse, ActionsResponse } from '../../../../interfaces/OptionsResponse';
import { PlusCircleIcon } from '@patternfly/react-icons';

export function useIGInstanceToolbarActions(view: IAwxView<Instance>) {
  const healthCheckAction = useRunHealthCheckToolbarAction(view, true);
  const associateAction = useIGInstanceAssociateToolbarAction(view);
  const disassociateAction = useIGInstanceDisassociateToolbarAction(view);

  return useMemo<IPageAction<Instance>[]>(() => {
    return [associateAction, disassociateAction, healthCheckAction];
  }, [associateAction, disassociateAction, healthCheckAction]);
}

function useIGInstanceAssociateToolbarAction(view: IAwxView<Instance>) {
  const params = useParams<{ id: string }>();
  const { id } = params;
  const associateInstanceToIG = useAssociateInstanceToIG(view.unselectItemsAndRefresh, id ?? '');
  const openAssociateInstanceModal = useAssociateInstanceModal();

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/instance_groups/${id ?? ''}/instances/`
  );
  const canAssociateInstance = Boolean(data && data.actions && data.actions['POST']);

  return useMemo<IPageAction<Instance>>(
    () => ({
      type: PageActionType.Button,
      selection: PageActionSelection.None,
      variant: ButtonVariant.primary,
      icon: PlusCircleIcon,
      label: t('Associate instance'),
      isPinned: true,
      isDisabled: () =>
        canAssociateInstance ? '' : t('You do not have permission to associate an instance.'),
      onClick: () =>
        openAssociateInstanceModal({
          onAssociate: associateInstanceToIG,
          instanceGroupId: id ?? '',
        }),
    }),
    [associateInstanceToIG, id, openAssociateInstanceModal, canAssociateInstance]
  );
}

function useIGInstanceDisassociateToolbarAction(view: IAwxView<Instance>) {
  const disassociateInstance = useDisassociateInstanceFromIG(view.unselectItemsAndRefresh);
  const params = useParams<{ id: string }>();
  const { id } = params;

  const { data: instanceGroup } = useGetItem<InstanceGroup>(awxAPI`/instance_groups/`, id);

  return useMemo<IPageAction<Instance>>(
    () => ({
      type: PageActionType.Button,
      selection: PageActionSelection.Multiple,
      variant: ButtonVariant.primary,
      label: t('Disassociate instance'),
      isPinned: true,
      onClick: disassociateInstance,
      isDisabled: (instances: Instance[]) =>
        isDisassociateBtnDisabled(instances, instanceGroup?.name === 'controlplane'),
    }),
    [disassociateInstance, instanceGroup?.name]
  );
}

function isDisassociateBtnDisabled(
  itemsToDisassociate: Instance[],
  verifyCannotDisassociate: boolean
) {
  if (verifyCannotDisassociate) {
    const itemsUnableToDisassociate = itemsToDisassociate
      .filter((item) =>
        item.type === 'instance'
          ? item.node_type === 'control' || item.node_type === 'hybrid'
          : !item.summary_fields?.user_capabilities?.delete
      )
      .map((item) => item.name ?? item.hostname)
      .join(', ');

    if (itemsUnableToDisassociate) {
      return t(
        `You do not have permission to disassociate the following: ${itemsUnableToDisassociate}`
      );
    }
  }

  return '';
}
