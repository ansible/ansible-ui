import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../framework';
import { IEdaView } from '../../common/useEventDrivenView';
import { EdaDecisionEnvironment } from '../../interfaces/EdaDecisionEnvironment';
import { EdaRoute } from '../../main/EdaRoutes';
import { useDeleteDecisionEnvironments } from './useDeleteDecisionEnvironments';

export function useDecisionEnvironmentsActions(view: IEdaView<EdaDecisionEnvironment>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteDecisionEnvironments = useDeleteDecisionEnvironments(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaDecisionEnvironment>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create decision environment'),
        onClick: () => pageNavigate(EdaRoute.CreateDecisionEnvironment),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected decision environments'),
        onClick: (decisionEnvironments: EdaDecisionEnvironment[]) =>
          deleteDecisionEnvironments(decisionEnvironments),
        isDanger: true,
      },
    ],
    [deleteDecisionEnvironments, pageNavigate, t]
  );
}
