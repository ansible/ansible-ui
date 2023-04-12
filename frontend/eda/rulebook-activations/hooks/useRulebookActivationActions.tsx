import { TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionType } from '../../../../framework';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { IEdaView } from '../../useEventDrivenView';
import { useRelaunchActivation, useRestartActivation } from './useActivationDialogs';
import { useDeleteRulebookActivations } from './useDeleteRulebookActivations';

export function useRulebookActivationActions(view: IEdaView<EdaRulebookActivation>) {
  const { t } = useTranslation();
  const relaunchActivation = useRelaunchActivation();
  const restartActivation = useRestartActivation();
  const deleteRulebookActivations = useDeleteRulebookActivations(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaRulebookActivation>[]>(
    () => [
      {
        type: PageActionType.Single,
        label: 'Relaunch',
        onClick: (activation: EdaRulebookActivation) => relaunchActivation(activation),
      },
      {
        type: PageActionType.Single,
        label: 'Restart',
        onClick: (activation: EdaRulebookActivation) => restartActivation(activation),
      },
      {
        type: PageActionType.Single,
        icon: TrashIcon,
        label: t('Delete rulebookActivation'),
        onClick: (rulebookActivation: EdaRulebookActivation) =>
          deleteRulebookActivations([rulebookActivation]),
        isDanger: true,
      },
    ],
    [relaunchActivation, restartActivation, deleteRulebookActivations, t]
  );
}
