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
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { EdaRoute } from '../../main/EdaRoutes';
import { useDeleteRulebookActivations } from './useDeleteRulebookActivations';

export function useRulebookActivationsActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteRulebookActivations = useDeleteRulebookActivations(() => void refresh());
  return useMemo<IPageAction<EdaRulebookActivation>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t(' activation'),
        onClick: () => pageNavigate(EdaRoute.CreateRulebookActivation),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected activations'),
        onClick: (rulebookActivations: EdaRulebookActivation[]) =>
          deleteRulebookActivations(rulebookActivations),
      },
    ],
    [deleteRulebookActivations, pageNavigate, t]
  );
}
