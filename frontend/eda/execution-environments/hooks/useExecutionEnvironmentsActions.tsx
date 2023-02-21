import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../framework';
import { RouteE } from '../../../Routes';
import { EdaExecutionEnvironment } from '../../interfaces/EdaExecutionEnvironment';
import { IEdaView } from '../../useEventDrivenView';
import { useDeleteExecutionEnvironments } from './useDeleteExecutionEnvironments';
import { useMemo } from 'react';

export function useExecutionEnvironmentsActions(view: IEdaView<EdaExecutionEnvironment>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaExecutionEnvironment>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create execution environment'),
        onClick: () => navigate(RouteE.CreateEdaExecutionEnvironment),
      },
      {
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected execution environments'),
        onClick: (executionEnvironments: EdaExecutionEnvironment[]) =>
          deleteExecutionEnvironments(executionEnvironments),
        isDanger: true,
      },
    ],
    [deleteExecutionEnvironments, navigate, t]
  );
}
