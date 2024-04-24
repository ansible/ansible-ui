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

export function useIGInstanceToolbarActions(view: IAwxView<Instance>) {
  const healthCheckAction = useRunHealthCheckToolbarAction(view, true);
  const associateAction = useIGInstanceAssociateToolbarAction(view);

  return useMemo<IPageAction<Instance>[]>(() => {
    return [associateAction, healthCheckAction];
  }, [associateAction, healthCheckAction]);
}

function useIGInstanceAssociateToolbarAction(view: IAwxView<Instance>) {
  const params = useParams<{ id: string }>();
  const { id } = params;
  const associateInstanceToIG = useAssociateInstanceToIG(view.unselectItemsAndRefresh, id ?? '');
  const openAssociateInstanceModal = useAssociateInstanceModal();

  return useMemo<IPageAction<Instance>>(
    () => ({
      type: PageActionType.Button,
      selection: PageActionSelection.None,
      variant: ButtonVariant.primary,
      label: t('Associate'),
      isPinned: true,
      onClick: () =>
        openAssociateInstanceModal({
          onAssociate: associateInstanceToIG,
          instanceGroupId: id ?? '',
        }),
    }),
    []
  );
}
