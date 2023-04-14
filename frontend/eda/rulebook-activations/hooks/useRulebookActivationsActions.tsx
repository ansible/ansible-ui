import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { IEdaView } from '../../useEventDrivenView';
import {
  useDisableRulebookActivations,
  useEnableRulebookActivations,
} from './useControlRulebookActivations';
import { useDeleteRulebookActivations } from './useDeleteRulebookActivations';

export function useRulebookActivationsActions(view: IEdaView<EdaRulebookActivation>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteRulebookActivations = useDeleteRulebookActivations(view.unselectItemsAndRefresh);
  const enableRulebookActivations = useEnableRulebookActivations(view.unselectItemsAndRefresh);
  const disableRulebookActivations = useDisableRulebookActivations(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaRulebookActivation>[]>(() => {
    const actions: IPageAction<EdaRulebookActivation>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Create rulebook activation'),
        onClick: () => navigate(RouteObj.CreateEdaRulebookActivation),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: PlusCircleIcon,
        label: t('Enable selected rulebook activations'),
        onClick: (rulebookActivations: EdaRulebookActivation[]) =>
          enableRulebookActivations(rulebookActivations),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: MinusCircleIcon,
        label: t('Disable selected rulebook activations'),
        onClick: (rulebookActivations: EdaRulebookActivation[]) =>
          disableRulebookActivations(rulebookActivations),
      },
      {
        type: PageActionType.Seperator,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected rulebook activations'),
        onClick: (rulebookActivations: EdaRulebookActivation[]) =>
          deleteRulebookActivations(rulebookActivations),
        isDanger: true,
      },
    ];
    return actions;
  }, [
    deleteRulebookActivations,
    enableRulebookActivations,
    disableRulebookActivations,
    navigate,
    t,
  ]);
}
