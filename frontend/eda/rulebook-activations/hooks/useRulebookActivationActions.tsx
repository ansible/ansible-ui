import { RedoIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  errorToAlertProps,
  usePageAlertToaster,
} from '../../../../framework';
import { postRequest } from '../../../common/crud/Data';
import { API_PREFIX } from '../../constants';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { IEdaView } from '../../useEventDrivenView';
import { useDeleteRulebookActivations } from './useDeleteRulebookActivations';

export function useRulebookActivationActions(view: IEdaView<EdaRulebookActivation>) {
  const { t } = useTranslation();
  const alertToaster = usePageAlertToaster();
  const enableActivation = useCallback(
    (rulebookActivation: EdaRulebookActivation) =>
      postRequest(`${API_PREFIX}/activations/${rulebookActivation.id}/enable/`, undefined)
        .catch((err) => alertToaster.addAlert(errorToAlertProps(err)))
        .finally(void view.refresh()),
    [alertToaster, view]
  );
  const disableActivation = useCallback(
    (rulebookActivation: EdaRulebookActivation) =>
      postRequest(`${API_PREFIX}/activations/${rulebookActivation.id}/disable/`, undefined)
        .catch((err) => alertToaster.addAlert(errorToAlertProps(err)))
        .finally(void view.refresh()),
    [alertToaster, view]
  );
  const restartActivation = useCallback(
    (rulebookActivation: EdaRulebookActivation) =>
      postRequest(`${API_PREFIX}/activations/${rulebookActivation.id}/disable/`, undefined)
        .catch((err) => alertToaster.addAlert(errorToAlertProps(err)))
        .finally(void view.refresh()),
    [alertToaster, view]
  );
  const deleteRulebookActivations = useDeleteRulebookActivations(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaRulebookActivation>[]>(() => {
    const actions: IPageAction<EdaRulebookActivation>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: RedoIcon,
        label: t('Restart'),
        isHidden: (activation: EdaRulebookActivation) =>
          !activation.is_enabled || activation.restart_policy === 'always',
        onClick: (activation: EdaRulebookActivation) => restartActivation(activation),
      },
      {
        type: PageActionType.Switch,
        selection: PageActionSelection.Single,
        isPinned: true,
        label: t('Enabled'),
        labelOff: t('Disabled'),
        onToggle: (activation: EdaRulebookActivation, activate: boolean) => {
          if (activate) void enableActivation(activation);
          else void disableActivation(activation);
        },
        isSwitchOn: (activation: EdaRulebookActivation) => activation.is_enabled ?? false,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete'),
        onClick: (rulebookActivation: EdaRulebookActivation) =>
          deleteRulebookActivations([rulebookActivation]),
        isDanger: true,
      },
    ];
    return actions;
  }, [t, restartActivation, enableActivation, disableActivation, deleteRulebookActivations]);
}
