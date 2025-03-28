import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageAlertToaster,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { postRequest } from '@ansible/common-ui/crud/Data';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { AlertProps, ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon, RedoIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { edaAPI, hasCopyNamePattern } from '../../common/eda-utils';
import { useEdaErrorMessageParser } from '../../common/edaErrorAdapter';
import { IEdaView } from '../../common/useEventDrivenView';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { EdaRoute } from '../../main/EdaRoutes';
import {
  useDisableRulebookActivations,
  useEnableRulebookActivationsWithWarning,
  useRestartRulebookActivations,
} from './useControlRulebookActivations';
import { useDeleteRulebookActivations } from './useDeleteRulebookActivations';

export function useRulebookActivationsActions(view: IEdaView<EdaRulebookActivation>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteRulebookActivations = useDeleteRulebookActivations(view.unselectItemsAndRefresh);
  const disableRulebookActivations = useDisableRulebookActivations(view.unselectItemsAndRefresh);
  const restartRulebookActivations = useRestartRulebookActivations(view.unselectItemsAndRefresh);
  const parseError = useEdaErrorMessageParser();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(edaAPI`/activations/`);
  const canCreateActivations = Boolean(data && data.actions && data.actions['POST']);
  const alertToaster = usePageAlertToaster();
  const enableActivationsWithWarning = useEnableRulebookActivationsWithWarning(
    view.unselectItemsAndRefresh
  );
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
          .catch((err: Error) => {
            const errorResults = parseError(err);
            alertToaster.addAlert({
              variant: 'danger',
              title: `${t('Failed to enable')} ${activation.name}`,
              children: <>{errorResults.parsedErrors.map((errorResult) => errorResult.message)}</>,
              timeout: 5000,
            });
          });
      },
      [alertToaster, parseError, t]
    );
  const enableRulebookActivations = useCallback(
    (activations: EdaRulebookActivation[]) => {
      if (activations.filter((activation) => hasCopyNamePattern(activation?.name)).length > 0) {
        enableActivationsWithWarning(activations);
      } else {
        for (const activation of activations) {
          if (!activation.is_enabled) {
            void enableRulebookActivation(activation);
          }
        }
      }
    },
    [enableActivationsWithWarning, enableRulebookActivation]
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
        isDisabled: canCreateActivations
          ? undefined
          : t(
              'You do not have permission to create a rulebook activation. Please contact your organization administrator if there is an issue with your access.'
            ),
        onClick: () => pageNavigate(EdaRoute.CreateRulebookActivation),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: PlusCircleIcon,
        label: t('Enable rulebook activations'),
        onClick: (rulebookActivations: EdaRulebookActivation[]) =>
          enableRulebookActivations(rulebookActivations),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: MinusCircleIcon,
        label: t('Disable rulebook activations'),
        onClick: (rulebookActivations: EdaRulebookActivation[]) =>
          disableRulebookActivations(rulebookActivations),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: RedoIcon,
        label: t('Restart rulebook activations'),
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
        label: t('Delete rulebook activations'),
        onClick: (rulebookActivations: EdaRulebookActivation[]) =>
          deleteRulebookActivations(rulebookActivations),
        isDanger: true,
      },
    ];
    return actions;
  }, [
    t,
    canCreateActivations,
    pageNavigate,
    enableRulebookActivations,
    disableRulebookActivations,
    restartRulebookActivations,
    deleteRulebookActivations,
  ]);
}
