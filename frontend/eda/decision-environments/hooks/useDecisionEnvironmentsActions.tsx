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
import { useOptions } from '../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { edaAPI } from '../../common/eda-utils';

export function useDecisionEnvironmentsActions(view: IEdaView<EdaDecisionEnvironment>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteDecisionEnvironments = useDeleteDecisionEnvironments(view.unselectItemsAndRefresh);
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(edaAPI`/decision-environments/`);
  const canCreateDE = Boolean(data && data.actions && data.actions['POST']);

  return useMemo<IPageAction<EdaDecisionEnvironment>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create decision environment'),
        isDisabled: canCreateDE
          ? undefined
          : t(
              'You do not have permission to create a decision environment. Please contact your organization administrator if there is an issue with your access.'
            ),
        onClick: () => pageNavigate(EdaRoute.CreateDecisionEnvironment),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete decision environments'),
        onClick: (decisionEnvironments: EdaDecisionEnvironment[]) =>
          deleteDecisionEnvironments(decisionEnvironments),
        isDanger: true,
      },
    ],
    [canCreateDE, deleteDecisionEnvironments, pageNavigate, t]
  );
}
