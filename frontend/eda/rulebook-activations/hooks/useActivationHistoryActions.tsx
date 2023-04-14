import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { useDeleteRulebookActivations } from './useDeleteRulebookActivations';

export function useRulebookActivationsActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteRulebookActivations = useDeleteRulebookActivations(() => void refresh());
  return useMemo<IPageAction<EdaRulebookActivation>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t(' activation'),
        onClick: () => navigate(RouteObj.CreateEdaRulebookActivation),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected rulebook activations'),
        onClick: (rulebookActivations: EdaRulebookActivation[]) =>
          deleteRulebookActivations(rulebookActivations),
      },
    ],
    [deleteRulebookActivations, navigate, t]
  );
}
