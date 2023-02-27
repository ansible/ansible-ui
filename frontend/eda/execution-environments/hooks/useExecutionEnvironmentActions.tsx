import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { EdaExecutionEnvironment } from '../../interfaces/EdaExecutionEnvironment';
import { IEdaView } from '../../useEventDrivenView';
import { useDeleteExecutionEnvironments } from './useDeleteExecutionEnvironments';
import { useMemo } from 'react';

export function useExecutionEnvironmentActions(view: IEdaView<EdaExecutionEnvironment>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaExecutionEnvironment>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit executionEnvironment'),
        onClick: (executionEnvironment: EdaExecutionEnvironment) =>
          navigate(
            RouteObj.EditEdaExecutionEnvironment.replace(':id', executionEnvironment.id.toString())
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
