import { MinusCircleIcon, PlusCircleIcon, RedoIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { IEdaView } from '../../useEventDrivenView';
import {
  useDisableRulebookActivations,
  useEnableRulebookActivations,
  useRestartRulebookActivations,
} from './useControlRulebookActivations';
import { useDeleteRulebookActivations } from './useDeleteRulebookActivations';

export function useRulebookActivationActions(view: IEdaView<EdaRulebookActivation>) {
  const { t } = useTranslation();
  const disableActivation = useDisableRulebookActivations(view.unselectItemsAndRefresh);
  const enableActivation = useEnableRulebookActivations(view.unselectItemsAndRefresh);
  const restartActivation = useRestartRulebookActivations(view.unselectItemsAndRefresh);
  const deleteRulebookActivations = useDeleteRulebookActivations(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaRulebookActivation>[]>(() => {
    const actions: IPageAction<EdaRulebookActivation>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PlusCircleIcon,
        label: 'Enable rulebook activation',
        isHidden: (activation: EdaRulebookActivation) => !!activation.is_enabled,
        onClick: (activation: EdaRulebookActivation) => enableActivation([activation]),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: MinusCircleIcon,
        label: 'Disable rulebook activation',
        isHidden: (activation: EdaRulebookActivation) => !activation.is_enabled,
        onClick: (activation: EdaRulebookActivation) => disableActivation([activation]),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: RedoIcon,
        label: 'Restart rulebook activation',
        isHidden: (activation: EdaRulebookActivation) =>
          !activation.is_enabled || activation.restart_policy !== 'always',
        onClick: (activation: EdaRulebookActivation) => restartActivation([activation]),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete rulebook activation'),
        onClick: (rulebookActivation: EdaRulebookActivation) =>
          deleteRulebookActivations([rulebookActivation]),
        isDanger: true,
      },
    ];
    return actions;
  }, [restartActivation, deleteRulebookActivations, enableActivation, disableActivation, t]);
}
