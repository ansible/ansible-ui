import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  usePageNavigate,
  IPageAction,
  PageActionType,
  PageActionSelection,
} from '../../../../../framework';
import { cannotEditResource, cannotDeleteResource } from '../../../../common/utils/RBAChelpers';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useDeleteExecutionEnvironments } from './useDeleteExecutionEnvironments';
import { IAwxView } from '../../../common/useAwxView';

export function useExecutionEnvRowActions(view: IAwxView<ExecutionEnvironment>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments(view.unselectItemsAndRefresh);

  return useMemo<IPageAction<ExecutionEnvironment>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        isPinned: true,
        label: t('Edit execution environment'),
        isDisabled: (executionEnvironment) => cannotEditResource(executionEnvironment, t),
        onClick: (executionEnvironment) =>
          pageNavigate(AwxRoute.EditExecutionEnvironment, {
            params: { id: executionEnvironment.id },
          }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete execution environment'),
        isHidden: (executionEnvironment) => executionEnvironment.managed,
        isDisabled: (executionEnvironment) => cannotDeleteResource(executionEnvironment, t),
        onClick: (executionEnvironment) => deleteExecutionEnvironments([executionEnvironment]),
        isDanger: true,
      },
    ],
    [pageNavigate, deleteExecutionEnvironments, t]
  );
}
