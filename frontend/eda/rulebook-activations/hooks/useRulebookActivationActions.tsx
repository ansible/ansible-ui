import { RedoIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { Status906Enum } from '../../interfaces/generated/eda-api';
import { IEdaView } from '../../useEventDrivenView';
import {
  useDisableRulebookActivations,
  useEnableRulebookActivations,
  useRestartRulebookActivations,
} from './useControlRulebookActivations';
import { useDeleteRulebookActivations } from './useDeleteRulebookActivations';
import { postRequest } from '../../../common/crud/Data';
import { API_PREFIX } from '../../constants';

export function useRulebookActivationActions(view: IEdaView<EdaRulebookActivation>) {
  const { t } = useTranslation();
  const enableActivations = useEnableRulebookActivations(view.unselectItemsAndRefresh);
  const disableActivations = useDisableRulebookActivations(view.unselectItemsAndRefresh);
  const restartActivations = useRestartRulebookActivations(view.unselectItemsAndRefresh);
  const deleteRulebookActivations = useDeleteRulebookActivations(view.unselectItemsAndRefresh);

  const handleToggle: (activation: EdaRulebookActivation, enabled: boolean) => Promise<void> =
    useCallback(
      async (activation, enabled) => {
        await postRequest(
          `${API_PREFIX}/activations/${activation.id}/${enabled ? 'enable/' : 'disable/'}`,
          undefined
        );
        view.unselectItemsAndRefresh([activation]);
      },
      [view]
    );

  return useMemo<IPageAction<EdaRulebookActivation>[]>(() => {
    const actions: IPageAction<EdaRulebookActivation>[] = [
      {
        type: PageActionType.Switch,
        ariaLabel: (isEnabled) =>
          isEnabled ? t('Click to disable instance') : t('Click to enable instance'),
        selection: PageActionSelection.Single,
        isPinned: true,
        label: t('Rulebook activation enabled'),
        labelOff: t('Rulebook activation disabled'),
        onToggle: (activation: EdaRulebookActivation, activate: boolean) =>
          handleToggle(activation, activate),
        isSwitchOn: (activation: EdaRulebookActivation) => activation.is_enabled ?? false,
        isHidden: (activation: EdaRulebookActivation) =>
          activation?.status === Status906Enum.Deleting,
        isDisabled: (activation: EdaRulebookActivation) =>
          activation.status === Status906Enum.Stopping
            ? t('Cannot change activation status while stopping')
            : undefined,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: RedoIcon,
        label: t('Restart rulebook activation'),
        isHidden: (activation: EdaRulebookActivation) =>
          !activation.is_enabled || activation?.status === Status906Enum.Deleting,
        onClick: (activation: EdaRulebookActivation) => restartActivations([activation]),
      },
      {
        type: PageActionType.Seperator,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete rulebook activation'),
        isHidden: (activation: EdaRulebookActivation) =>
          activation?.status === Status906Enum.Deleting,
        onClick: (rulebookActivation: EdaRulebookActivation) =>
          deleteRulebookActivations([rulebookActivation]),
        isDanger: true,
      },
    ];
    return actions;
  }, [t, restartActivations, enableActivations, disableActivations, deleteRulebookActivations]);
}
