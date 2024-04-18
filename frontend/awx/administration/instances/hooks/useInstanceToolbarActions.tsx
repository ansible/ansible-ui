import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { useGet } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { IAwxView } from '../../../common/useAwxView';
import { Instance } from '../../../interfaces/Instance';
import { Settings } from '../../../interfaces/Settings';
import { AwxRoute } from '../../../main/AwxRoutes';
import { cannotRemoveInstances } from './useInstanceActions';
import { useRemoveInstances } from './useRemoveInstances';
import { useRunHealthCheckToolbarAction } from './useRunHealthCheckToolbarAction';

export function useInstanceToolbarActions(view: IAwxView<Instance>) {
  const { t } = useTranslation();
  const removeInstances = useRemoveInstances(view.unselectItemsAndRefresh);
  const pageNavigate = usePageNavigate();
  const { activeAwxUser } = useAwxActiveUser();
  const { data } = useGet<Settings>(awxAPI`/settings/system/`);
  const isK8s = data?.IS_K8S;

  const canAddAndEditInstances =
    (activeAwxUser?.is_superuser || activeAwxUser?.is_system_auditor) && data?.IS_K8S;

  const healthCheckAction = useRunHealthCheckToolbarAction(view);

  return useMemo<IPageAction<Instance>[]>(() => {
    let actions: IPageAction<Instance>[] = [
      {
        type: PageActionType.Button,
        isHidden: () => isK8s === false,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Add instance'),
        onClick: () => pageNavigate(AwxRoute.AddInstance),
        isDisabled: canAddAndEditInstances
          ? undefined
          : t(
              'You do not have permission to add instances. Please contact your organization administrator if there is an issue with your access.'
            ),
      },
    ];
    if (isK8s) {
      const removeInstanceAction: IPageAction<Instance> = {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: MinusCircleIcon,
        label: t('Remove instance'),
        onClick: (instance: Instance[]) => removeInstances(instance),
        isDisabled: (instances: Instance[]) => cannotRemoveInstances(instances, t),
        isDanger: true,
      };
      actions.push(removeInstanceAction);
    }
    actions = actions.concat(healthCheckAction);

    return actions;
  }, [t, canAddAndEditInstances, pageNavigate, isK8s, removeInstances, healthCheckAction]);
}
