import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { EdaDecisionEnvironment } from '../../interfaces/EdaDecisionEnvironment';
import { IEdaView } from '../../useEventDrivenView';
import { useDeleteDecisionEnvironments } from './useDeleteDecisionEnvironments';
import { useMemo } from 'react';

export function useDecisionEnvironmentsActions(view: IEdaView<EdaDecisionEnvironment>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteDecisionEnvironments = useDeleteDecisionEnvironments(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaDecisionEnvironment>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create execution environment'),
        onClick: () => navigate(RouteObj.CreateEdaDecisionEnvironment),
      },
      {
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected execution environments'),
        onClick: (DecisionEnvironments: EdaDecisionEnvironment[]) =>
          deleteDecisionEnvironments(DecisionEnvironments),
        isDanger: true,
      },
    ],
    [deleteDecisionEnvironments, navigate, t]
  );
}
