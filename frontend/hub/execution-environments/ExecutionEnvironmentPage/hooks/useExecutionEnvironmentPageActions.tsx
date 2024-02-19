import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HubRoute } from '../../../main/HubRoutes';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { ExecutionEnvironment } from '../../ExecutionEnvironment';
import { useDeleteExecutionEnvironments } from '../../hooks/useExecutionEnvironmentsActions';
import { useSignExecutionEnvironments } from '../../hooks/useExecutionEnvironmentsActions';

export function useExecutionEnvironmentPageActions(options: { refresh?: () => undefined }) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
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
        label: t('Use in controller'),
        onClick: () => {},
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        label: t('Delete'),
        onClick: (ee) => deleteExecutionEnvironments([ee]),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        label: t('Sign'),
        onClick: (ee) => signExecutionEnvironments([ee]),
      },
    ];
    return actions;
  }, [pageNavigate, t, deleteExecutionEnvironments, signExecutionEnvironments]);
}
