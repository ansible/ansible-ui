import { AlertProps, ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon, RedoIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageAlertToaster,
  usePageNavigate,
} from '../../../../framework';
import { postRequest } from '../../../common/crud/Data';
import { edaAPI } from '../../common/eda-utils';
import { IEdaView } from '../../common/useEventDrivenView';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { EdaRoute } from '../../main/EdaRoutes';
import {
  useDisableRulebookActivations,
  useRestartRulebookActivations,
} from './useControlRulebookActivations';
import { useDeleteRulebookActivations } from './useDeleteRulebookActivations';

export function useRulebookActivationsActions(view: IEdaView<EdaRulebookActivation>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteRulebookActivations = useDeleteRulebookActivations(view.unselectItemsAndRefresh);
  const disableRulebookActivations = useDisableRulebookActivations(view.unselectItemsAndRefresh);
  const restartRulebookActivations = useRestartRulebookActivations(view.unselectItemsAndRefresh);
  const alertToaster = usePageAlertToaster();

  const enableRulebookActivation: (activation: EdaRulebookActivation) => Promise<void> =
    useCallback(
      async (activation) => {
        const alert: AlertProps = {
          variant: 'success',
          title: `${activation.name} ${t('enabled')}.`,
          timeout: 5000,
        };
        await postRequest(edaAPI`/activations/${activation.id.toString()}/enable/`, undefined)
          .then(() => alertToaster.addAlert(alert))
          .catch(() => {
            alertToaster.addAlert({
              variant: 'danger',
              title: `${t('Failed to enable')} ${activation.name}`,
              timeout: 5000,
            });
          });
      },
      [alertToaster, t]
    );
  const enableRulebookActivations = useCallback(
    (activations: EdaRulebookActivation[]) => {
      for (const activation of activations) {
        void enableRulebookActivation(activation);
      }
    },
    [enableRulebookActivation]
  );

  return useMemo<IPageAction<EdaRulebookActivation>[]>(() => {
    const actions: IPageAction<EdaRulebookActivation>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create rulebook activation'),
        onClick: () => pageNavigate(EdaRoute.CreateRulebookActivation),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: PlusCircleIcon,
        label: t('Enable selected activations'),
        onClick: (rulebookActivations: EdaRulebookActivation[]) =>
          enableRulebookActivations(rulebookActivations),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: MinusCircleIcon,
        label: t('Disable selected activations'),
        onClick: (rulebookActivations: EdaRulebookActivation[]) =>
          disableRulebookActivations(rulebookActivations),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: RedoIcon,
        label: t('Restart selected activations'),
        onClick: (rulebookActivations: EdaRulebookActivation[]) =>
          restartRulebookActivations(rulebookActivations),
      },
      {
        type: PageActionType.Seperator,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected activations'),
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
    restartRulebookActivations,
    pageNavigate,
    t,
  ]);
}
