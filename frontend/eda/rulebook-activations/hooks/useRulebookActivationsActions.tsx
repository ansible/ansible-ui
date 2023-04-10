import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { IEdaView } from '../../useEventDrivenView';
import { useDeleteRulebookActivations } from './useDeleteRulebookActivations';
import {
  useDisableRulebookActivations,
  useEnableRulebookActivations,
} from './useEnableDisableRulebookActivations';

export function useRulebookActivationsActions(view: IEdaView<EdaRulebookActivation>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteRulebookActivations = useDeleteRulebookActivations(view.unselectItemsAndRefresh);
  const enableRulebookActivations = useEnableRulebookActivations(view.unselectItemsAndRefresh);
  const disableRulebookActivations = useDisableRulebookActivations(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaRulebookActivation>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Add rulebook activation'),
        onClick: () => navigate(RouteObj.CreateEdaRulebookActivation),
      },
      {
        type: PageActionType.bulk,
        icon: PlusCircleIcon,
        label: t('Enable selected rulebook activations'),
        onClick: (rulebookActivations: EdaRulebookActivation[]) =>
          enableRulebookActivations(rulebookActivations),
      },
      {
        type: PageActionType.bulk,
        icon: MinusCircleIcon,
        label: t('Disable selected rulebook activations'),
        onClick: (rulebookActivations: EdaRulebookActivation[]) =>
          disableRulebookActivations(rulebookActivations),
      },
      {
        type: PageActionType.seperator,
      },
      {
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected rulebook activations'),
        onClick: (rulebookActivations: EdaRulebookActivation[]) =>
          deleteRulebookActivations(rulebookActivations),
        isDanger: true,
      },
    ],
    [deleteRulebookActivations, enableRulebookActivations, disableRulebookActivations, navigate, t]
  );
}
