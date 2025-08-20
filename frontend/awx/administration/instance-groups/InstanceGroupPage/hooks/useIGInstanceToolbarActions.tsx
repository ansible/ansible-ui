import { IPageAction, PageActionSelection, PageActionType } from '@ansible/ansible-ui-framework';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { t } from 'i18next';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { awxAPI } from '../../../../common/api/awx-utils';
import { IAwxView } from '../../../../common/useAwxView';
import { Instance } from '../../../../interfaces/Instance';
import { InstanceGroup } from '../../../../interfaces/InstanceGroup';
import { ActionsResponse, OptionsResponse } from '../../../../interfaces/OptionsResponse';
import { useRunHealthCheckToolbarAction } from '../../../instances/hooks/useInstanceToolbarActions';
import { useAssociateInstanceModal } from './useAssociateInstanceModal';
import { useAssociateInstanceToIG } from './useAssociateInstanceToIG';
import { useDisassociateInstanceFromIG } from './useDisassociateInstanceFromIG';

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
      .map((item) => item.hostname)
      .join(', ');

    if (itemsUnableToDisassociate) {
      return t(
        `You do not have permission to disassociate the following: ${itemsUnableToDisassociate}`
      );
    }
  }

  return '';
}
