import { TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionType } from '../../../../framework';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { useDeleteRulebookActivations } from './useDeleteRulebookActivations';
import {
  useDisableActivation,
  useRelaunchActivation,
  useRestartActivation,
} from './useActivationDialogs';
import { IEdaView } from '../../useEventDrivenView';

export function useRulebookActivationActions(view: IEdaView<EdaRulebookActivation>) {
  const { t } = useTranslation();
  const relaunchActivation = useRelaunchActivation();
  const restartActivation = useRestartActivation();
  const disableActivation = useDisableActivation();
  const deleteRulebookActivations = useDeleteRulebookActivations(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaRulebookActivation>[]>(
    () => [
      {
        type: PageActionType.single,
        label: 'Relaunch',
        onClick: (activation: EdaRulebookActivation) => relaunchActivation(activation),
      },
      {
        type: PageActionType.single,
        label: 'Restart',
        onClick: (activation: EdaRulebookActivation) => restartActivation(activation),
      },
      {
        type: PageActionType.single,
        label: 'Disable',
        onClick: (activation: EdaRulebookActivation) => disableActivation(activation),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete rulebookActivation'),
        onClick: (rulebookActivation: EdaRulebookActivation) =>
          deleteRulebookActivations([rulebookActivation]),
        isDanger: true,
      },
    ],
    [relaunchActivation, restartActivation, deleteRulebookActivations, disableActivation, t]
  );
}
