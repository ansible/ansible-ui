import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { EdaDecisionEnvironment } from '../../../interfaces/EdaDecisionEnvironment';
import { IEdaView } from '../../../useEventDrivenView';
import { useDeleteDecisionEnvironments } from './useDeleteDecisionEnvironments';
import { ButtonVariant } from '@patternfly/react-core';

export function useDecisionEnvironmentActions(view: IEdaView<EdaDecisionEnvironment>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteDecisionEnvironments = useDeleteDecisionEnvironments(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaDecisionEnvironment>[]>(
    () => [
      {
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        isPinned: true,
        label: t('Edit decision environment'),
        onClick: (decisionEnvironment: EdaDecisionEnvironment) =>
          navigate(
            RouteObj.EditEdaDecisionEnvironment.replace(':id', decisionEnvironment.id.toString())
          ),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete decision environment'),
        onClick: (decisionEnvironment: EdaDecisionEnvironment) =>
          deleteDecisionEnvironments([decisionEnvironment]),
        isDanger: true,
      },
    ],
    [deleteDecisionEnvironments, navigate, t]
  );
}
