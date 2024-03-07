import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  usePageNavigate,
  IPageAction,
  PageActionType,
  PageActionSelection,
} from '../../../../../framework';
import { useOptions } from '../../../../common/crud/useOptions';
import { cannotDeleteResources } from '../../../../common/utils/RBAChelpers';
import { awxAPI } from '../../../common/api/awx-utils';
import { IAwxView } from '../../../common/useAwxView';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { OptionsResponse, ActionsResponse } from '../../../interfaces/OptionsResponse';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useDeleteExecutionEnvironments } from './useDeleteExecutionEnvironments';

export function useExecutionEnvToolbarActions(view: IAwxView<ExecutionEnvironment>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments(view.unselectItemsAndRefresh);

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/execution_environments/`);
  const canCreateExecutionEnvironment = Boolean(data && data.actions && data.actions['POST']);

  return useMemo<IPageAction<ExecutionEnvironment>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create execution environment'),
        isDisabled: canCreateExecutionEnvironment
          ? undefined
          : t(
              'You do not have permission to create an execution environment. Please contact your organization administrator if there is an issue with your access.'
            ),
        onClick: () => pageNavigate(AwxRoute.CreateExecutionEnvironment),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected execution environments'),
        isDisabled: (executionEnvironments) => cannotDeleteResources(executionEnvironments, t),
        onClick: deleteExecutionEnvironments,
        isDanger: true,
      },
    ],
    [t, canCreateExecutionEnvironment, deleteExecutionEnvironments, pageNavigate]
  );
}
