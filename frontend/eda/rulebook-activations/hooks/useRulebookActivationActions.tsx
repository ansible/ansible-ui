import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageAlertToaster,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { postRequest } from '@ansible/common-ui/crud/Data';
import { AlertProps } from '@patternfly/react-core';
import { CopyIcon, PencilAltIcon, RedoIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { edaAPI, hasCopyNamePattern } from '../../common/eda-utils';
import { useEdaErrorMessageParser } from '../../common/edaErrorAdapter';
import { IEdaView } from '../../common/useEventDrivenView';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { StatusEnum } from '../../interfaces/generated/eda-api';
import { EdaRoute } from '../../main/EdaRoutes';
import {
  useDisableRulebookActivations,
  useDisableRulebookActivationsWithWarning,
  useEnableRulebookActivationsWithWarning,
  useRestartRulebookActivations,
  useRestartRulebookActivationsWithWarning,
} from './useControlRulebookActivations';
import { useCopyRulebookActivation } from './useCopyRulebookactivation';
import {
  useDeleteRulebookActivations,
  useDeleteRulebookActivationsWithWarning,
} from './useDeleteRulebookActivations';

export function useRulebookActivationActions(view: IEdaView<EdaRulebookActivation>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const disableRulebookActivations = useDisableRulebookActivations(view.unselectItemsAndRefresh);
  const disableActivationsWithWarning = useDisableRulebookActivationsWithWarning(
    view.unselectItemsAndRefresh
  );
  const restartRulebookActivations = useRestartRulebookActivations(view.unselectItemsAndRefresh);
  const deleteActivations = useDeleteRulebookActivations(view.unselectItemsAndRefresh);
  const deleteActivationsWithWarning = useDeleteRulebookActivationsWithWarning(
    view.unselectItemsAndRefresh
  );
  const copyRulebookActivation = useCopyRulebookActivation(view.refresh as () => void);
  const alertToaster = usePageAlertToaster();
  const parseError = useEdaErrorMessageParser();
  const enableActivationsWithWarning = useEnableRulebookActivationsWithWarning(
    view.unselectItemsAndRefresh
  );

  const enableActivation: (activation: EdaRulebookActivation) => Promise<void> = useCallback(
    async (activation) => {
      const alert: AlertProps = {
        variant: 'success',
        title: `${activation.name} ${t('enabled')}.`,
        timeout: 5000,
      };
      if (!activation.is_enabled && hasCopyNamePattern(activation?.name)) {
        // Dialog handles enable and refresh via onComplete callback
        enableActivationsWithWarning([activation]);
        return;
      } else {
        await postRequest(edaAPI`/activations/${activation.id.toString()}/${'enable/'}`, undefined)
          .then(() => alertToaster.addAlert(alert))
          .catch((err: Error) => {
            const errorResults = parseError(err);
            alertToaster.addAlert({
              variant: 'danger',
              title: `${t('Failed to enable')} ${activation.name}`,
              children: <>{errorResults.parsedErrors.map((errorResult) => errorResult.message)}</>,
              timeout: 5000,
            });
          });
        view.unselectItemsAndRefresh([activation]);
      }
    },
    [t, enableActivationsWithWarning, view, alertToaster, parseError]
  );
  const restartActivationsWithWarning = useRestartRulebookActivationsWithWarning(
    view.unselectItemsAndRefresh
  );
  const restartActivations = useCallback(
    (activations: EdaRulebookActivation[]) => {
      if (activations.some((activation) => activation.status === StatusEnum.WorkersOffline)) {
        restartActivationsWithWarning(activations);
      } else {
        restartRulebookActivations(activations);
      }
    },
    [restartActivationsWithWarning, restartRulebookActivations]
  );

  const disableActivations = useCallback(
    (activations: EdaRulebookActivation[]) => {
      if (activations.some((activation) => activation.status === StatusEnum.WorkersOffline)) {
        disableActivationsWithWarning(activations);
      } else {
        disableRulebookActivations(activations);
      }
    },
    [disableActivationsWithWarning, disableRulebookActivations]
  );

  const deleteRulebookActivations = useCallback(
    (activations: EdaRulebookActivation[]) => {
      if (activations.some((activation) => activation.status === StatusEnum.WorkersOffline)) {
        deleteActivationsWithWarning(activations);
      } else {
        deleteActivations(activations);
      }
    },
    [deleteActivationsWithWarning, deleteActivations]
  );

  const handleToggleActivation = useCallback(
    (activation: EdaRulebookActivation, enabled: boolean) => {
      const toggleAction = enabled
        ? enableActivation
        : (a: EdaRulebookActivation) => disableActivations([a]);
      toggleAction(activation);
    },
    [enableActivation, disableActivations]
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
        onToggle: handleToggleActivation,
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
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        label: t('Edit rulebook activation'),
        isPinned: true,
        isDisabled: (activation: EdaRulebookActivation) =>
          !activation.is_enabled
            ? ''
            : t(`To edit this rulebook activation, you must first disable it.`),
        onClick: (activation: EdaRulebookActivation) =>
          pageNavigate(EdaRoute.EditRulebookActivation, { params: { id: activation.id } }),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: CopyIcon,
        label: t(`Duplicate rulebook activation`),
        onClick: (activation: EdaRulebookActivation) => {
          return copyRulebookActivation(activation);
        },
        isDanger: false,
        isPinned: false,
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
  }, [
    t,
    handleToggleActivation,
    restartActivations,
    pageNavigate,
    copyRulebookActivation,
    deleteRulebookActivations,
  ]);
}
