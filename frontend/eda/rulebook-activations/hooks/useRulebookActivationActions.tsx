import { MinusCircleIcon, PlusCircleIcon, RedoIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionType } from '../../../../framework';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { useDeleteRulebookActivations } from './useDeleteRulebookActivations';
import { IEdaView } from '../../useEventDrivenView';
import {
  useDisableRulebookActivations,
  useEnableRulebookActivations,
  useRestartRulebookActivations,
} from './useControlRulebookActivations';

export function useRulebookActivationActions(view: IEdaView<EdaRulebookActivation>) {
  const { t } = useTranslation();
  const disableActivation = useDisableRulebookActivations(view.unselectItemsAndRefresh);
  const enableActivation = useEnableRulebookActivations(view.unselectItemsAndRefresh);
  const restartActivation = useRestartRulebookActivations(view.unselectItemsAndRefresh);
  const deleteRulebookActivations = useDeleteRulebookActivations(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaRulebookActivation>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: PlusCircleIcon,
        label: 'Enable rulebook activation',
        isHidden: (activation: EdaRulebookActivation) => !!activation.is_enabled,
        onClick: (activation: EdaRulebookActivation) => enableActivation([activation]),
      },
      {
        type: PageActionType.single,
        icon: MinusCircleIcon,
        label: 'Disable rulebook activation',
        isHidden: (activation: EdaRulebookActivation) => !activation.is_enabled,
        onClick: (activation: EdaRulebookActivation) => disableActivation([activation]),
      },
      {
        type: PageActionType.single,
        icon: RedoIcon,
        label: 'Restart rulebook activation',
        isHidden: (activation: EdaRulebookActivation) => !!activation.is_enabled,
        onClick: (activation: EdaRulebookActivation) => restartActivation([activation]),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete rulebook activation'),
        onClick: (rulebookActivation: EdaRulebookActivation) =>
          deleteRulebookActivations([rulebookActivation]),
        isDanger: true,
      },
    ],
    [restartActivation, deleteRulebookActivations, enableActivation, disableActivation, t]
  );
}
