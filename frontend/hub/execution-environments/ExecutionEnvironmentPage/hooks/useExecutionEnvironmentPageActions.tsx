import { AlertProps, ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HubRoute } from '../../../main/HubRoutes';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
  usePageAlertToaster,
} from '../../../../../framework';
import { ExecutionEnvironment } from '../../ExecutionEnvironment';
import { useDeleteExecutionEnvironments } from '../../hooks/useExecutionEnvironmentsActions';
import { useSignExecutionEnvironments } from '../../hooks/useExecutionEnvironmentsActions';
import { syncExecutionEnvironment } from '../../hooks/useExecutionEnvironmentsActions';

export function useExecutionEnvironmentPageActions(options: { refresh?: () => undefined }) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const alertToaster = usePageAlertToaster();
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments(() => {
    pageNavigate(HubRoute.ExecutionEnvironments);
  });

  const { refresh } = options;

  const signExecutionEnvironments = useSignExecutionEnvironments(() => {
    void refresh?.();
  });

  return useMemo(() => {
    const actions: IPageAction<ExecutionEnvironment>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit'),
        onClick: (ee) =>
          pageNavigate(HubRoute.EditExecutionEnvironment, { params: { id: ee?.name } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        label: t('Sync from registry'),
        isHidden: (ee: ExecutionEnvironment) => !ee.pulp?.repository?.remote,
        onClick: (ee: ExecutionEnvironment) => {
          const alert: AlertProps = {
            variant: 'info',
            title: t('Sync started for remote registry "{{name}}".', { name: ee.name }),
            timeout: 5000,
          };
          void syncExecutionEnvironment(ee)
            .then(() => {
              void refresh?.();
              alertToaster.addAlert(alert);
            })
            .catch((error) => {
              alertToaster.addAlert({
                variant: 'danger',
                title: t('Failed to sync remote registry.'),
                children: error instanceof Error && error.message,
              });
            });
        },
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        label: t('Use in controller'),
        onClick: () => {},
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete'),
        onClick: (ee) => deleteExecutionEnvironments([ee]),
        isDanger: true,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        label: t('Sign'),
        onClick: (ee) => signExecutionEnvironments([ee]),
      },
    ];
    return actions;
  }, [pageNavigate, t, alertToaster, refresh, deleteExecutionEnvironments, signExecutionEnvironments]);
}
