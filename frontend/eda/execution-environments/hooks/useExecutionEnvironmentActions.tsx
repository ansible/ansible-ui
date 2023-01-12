import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../framework';
import { RouteE } from '../../../Routes';
import { EdaExecutionEnvironment } from '../../interfaces/EdaExecutionEnvironment';
import { useDeleteExecutionEnvironments } from './useDeleteExecutionEnvironments';

export function useExecutionEnvironmentActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const refreshHandler = useCallback(() => void refresh(), [refresh]);
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments(refreshHandler);
  return useMemo<IPageAction<EdaExecutionEnvironment>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit executionEnvironment'),
        onClick: (executionEnvironment: EdaExecutionEnvironment) =>
          navigate(
            RouteE.EditEdaExecutionEnvironment.replace(':id', executionEnvironment.id.toString())
          ),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete executionEnvironment'),
        onClick: (executionEnvironment: EdaExecutionEnvironment) =>
          deleteExecutionEnvironments([executionEnvironment]),
        isDanger: true,
      },
    ],
    [deleteExecutionEnvironments, navigate, t]
  );
}
