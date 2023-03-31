import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { EdaDecisionEnvironment } from '../../interfaces/EdaDecisionEnvironment';
import { IEdaView } from '../../useEventDrivenView';
import { useDeleteDecisionEnvironments } from './useDeleteDecisionEnvironments';
import { useMemo } from 'react';

export function useDecisionEnvironmentActions(view: IEdaView<EdaDecisionEnvironment>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteDecisionEnvironments = useDeleteDecisionEnvironments(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaDecisionEnvironment>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit DecisionEnvironment'),
        onClick: (DecisionEnvironment: EdaDecisionEnvironment) =>
          navigate(
            RouteObj.EditEdaDecisionEnvironment.replace(':id', DecisionEnvironment.id.toString())
          ),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete DecisionEnvironment'),
        onClick: (DecisionEnvironment: EdaDecisionEnvironment) =>
          deleteDecisionEnvironments([DecisionEnvironment]),
        isDanger: true,
      },
    ],
    [deleteDecisionEnvironments, navigate, t]
  );
}
