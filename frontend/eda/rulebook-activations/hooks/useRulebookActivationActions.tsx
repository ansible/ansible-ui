import { AlertProps } from '@patternfly/react-core';
import { RedoIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageAlertToaster,
} from '../../../../framework';
import { postRequest } from '../../../common/crud/Data';
import { edaAPI } from '../../common/eda-utils';
import { IEdaView } from '../../common/useEventDrivenView';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { StatusEnum } from '../../interfaces/generated/eda-api';
import {
  useDisableRulebookActivations,
  useRestartRulebookActivations,
} from './useControlRulebookActivations';
import { useDeleteRulebookActivations } from './useDeleteRulebookActivations';

export function useRulebookActivationActions(view: IEdaView<EdaRulebookActivation>) {
  const { t } = useTranslation();
  const disableActivations = useDisableRulebookActivations(view.unselectItemsAndRefresh);
  const restartActivations = useRestartRulebookActivations(view.unselectItemsAndRefresh);
  const deleteRulebookActivations = useDeleteRulebookActivations(view.unselectItemsAndRefresh);
  const alertToaster = usePageAlertToaster();
  const enableActivation: (activation: EdaRulebookActivation) => Promise<void> = useCallback(
    async (activation) => {
      const alert: AlertProps = {
        variant: 'success',
        title: `${activation.name} ${t('enabled')}.`,
        timeout: 5000,
      };
      await postRequest(edaAPI`/activations/${activation.id.toString()}/${'enable/'}`, undefined)
        .then(() => alertToaster.addAlert(alert))
        .catch(() => {
          alertToaster.addAlert({
            variant: 'danger',
            title: `${t('Failed to enable')} ${activation.name}`,
            timeout: 5000,
          });
        });
      view.unselectItemsAndRefresh([activation]);
    },
    [view, alertToaster, t]
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
        onToggle: (activation: EdaRulebookActivation, activate: boolean) => {
          if (activate) void enableActivation(activation);
          else void disableActivations([activation]);
        },
        isSwitchOn: (activation: EdaRulebookActivation) => activation.is_enabled ?? false,
        isHidden: (activation: EdaRulebookActivation) => activation?.status === StatusEnum.Deleting,
        isDisabled: (activation: EdaRulebookActivation) =>
          activation.status === StatusEnum.Stopping
            ? t('Cannot change activation status while stopping')
            : undefined,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: RedoIcon,
        label: t('Restart rulebook activation'),
        isHidden: (activation: EdaRulebookActivation) =>
          !activation.is_enabled || activation?.status === StatusEnum.Deleting,
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
        isHidden: (activation: EdaRulebookActivation) => activation?.status === StatusEnum.Deleting,
        onClick: (rulebookActivation: EdaRulebookActivation) =>
          deleteRulebookActivations([rulebookActivation]),
        isDanger: true,
      },
    ];
    return actions;
  }, [t, restartActivations, deleteRulebookActivations, disableActivations, enableActivation]);
}
