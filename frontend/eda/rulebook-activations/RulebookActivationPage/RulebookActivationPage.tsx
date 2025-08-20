import { AlertProps } from '@patternfly/react-core';

import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageAlertToaster,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageRoutedTabs } from '@ansible/common-ui/PageRoutedTabs';
import { postRequest } from '@ansible/common-ui/crud/Data';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { CopyIcon, PencilAltIcon, RedoIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { edaAPI, hasCopyNamePattern } from '../../common/eda-utils';
import { useEdaErrorMessageParser } from '../../common/edaErrorAdapter';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { StatusEnum } from '../../interfaces/generated/eda-api';
import { EdaRoute } from '../../main/EdaRoutes';
import {
  useDisableRulebookActivations,
  useEnableRulebookActivationWithWarning,
  useRestartRulebookActivations,
} from '../hooks/useControlRulebookActivations';
import { useCopyRulebookActivation } from '../hooks/useCopyRulebookactivation';
import { useDeleteRulebookActivations } from '../hooks/useDeleteRulebookActivations';

export function RulebookActivationPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const alertToaster = usePageAlertToaster();
  const parseError = useEdaErrorMessageParser();

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(
    edaAPI`/activations/${params.id ?? ''}/`
  );
  const canPatchActivation = Boolean(data?.actions?.['PATCH']);

  const { data: rulebookActivation, refresh } = useGet<EdaRulebookActivation>(
    edaAPI`/activations/${params.id ?? ''}/`
  );

  const canEditRulebookActivation = Boolean(
    data?.actions?.['PATCH'] && !rulebookActivation?.is_enabled
  );

  const disableRulebookActivation = useDisableRulebookActivations((disabled) => {
    if (disabled.length > 0) {
      refresh();
    }
  });

  const restartRulebookActivation = useRestartRulebookActivations((restarted) => {
    if (restarted.length > 0) {
      refresh();
    }
  });

  const copyRulebookActivation = useCopyRulebookActivation();
  const enableActivationWithWarning = useEnableRulebookActivationWithWarning(
    enableActivation,
    refresh
  );

  const deleteRulebookActivations = useDeleteRulebookActivations((deleted) => {
    if (deleted.length > 0) {
      pageNavigate(EdaRoute.RulebookActivations);
    }
  });

  function enableActivation(activation: EdaRulebookActivation) {
    const alert: AlertProps = {
      variant: 'success',
      title: `${activation.name} ${t('enabled')}.`,
      timeout: 5000,
    };
    return postRequest(edaAPI`/activations/${activation.id.toString()}/${'enable/'}`, undefined)
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
  }

  const enableRulebookActivation: (activation: EdaRulebookActivation) => Promise<void> =
    useCallback(
      async (activation) => {
        const alert: AlertProps = {
          variant: 'success',
          title: `${activation.name} ${t('enabled')}.`,
          timeout: 5000,
        };
        if (!activation.is_enabled && hasCopyNamePattern(activation?.name)) {
          enableActivationWithWarning(activation);
        } else {
          await postRequest(edaAPI`/activations/${activation.id.toString()}/enable/`, undefined)
            .then(() => alertToaster.addAlert(alert))
            .catch((err: Error) => {
              const errorResults = parseError(err);
              alertToaster.addAlert({
                variant: 'danger',
                title: `${t('Failed to enable')} ${activation.name}`,
                children: (
                  <>{errorResults.parsedErrors.map((errorResult) => errorResult.message)}</>
                ),
                timeout: 5000,
              });
            });
          refresh();
        }
      },
      [t, enableActivationWithWarning, refresh, alertToaster, parseError]
    );

  const isActionTab = location.href.includes(
    getPageUrl(EdaRoute.RulebookActivationDetails, { params: { id: rulebookActivation?.id } })
  );

  const itemActions = useMemo<IPageAction<EdaRulebookActivation>[]>(() => {
    const actions: IPageAction<EdaRulebookActivation>[] = isActionTab
      ? [
          {
            type: PageActionType.Switch,
            selection: PageActionSelection.Single,
            ariaLabel: (isEnabled) =>
              isEnabled ? t('Click to disable instance') : t('Click to enable instance'),
            isPinned: true,
            label: rulebookActivation?.is_enabled
              ? t('Rulebook activation enabled')
              : t('Rulebook activation disabled'),
            onToggle: (activation: EdaRulebookActivation, activate: boolean) => {
              if (activate) void enableRulebookActivation(activation);
              else void disableRulebookActivation([activation]);
            },
            isSwitchOn: (activation: EdaRulebookActivation) => activation.is_enabled ?? false,
            isDisabled: (activation: EdaRulebookActivation) =>
              activation?.status === StatusEnum.Stopping
                ? t('Cannot change activation status while stopping')
                : undefined,
          },
          {
            type: PageActionType.Button,
            selection: PageActionSelection.Single,
            icon: PencilAltIcon,
            label: t('Edit rulebook activation'),
            isPinned: true,
            isDisabled: () =>
              canEditRulebookActivation
                ? ''
                : t(`To edit this rulebook activation, you must first disable it.`),
            onClick: (activation: EdaRulebookActivation) =>
              pageNavigate(EdaRoute.EditRulebookActivation, { params: { id: activation.id } }),
          },
          {
            type: PageActionType.Button,
            selection: PageActionSelection.Single,
            icon: RedoIcon,
            label: t('Restart rulebook activation'),
            isDanger: false,
            isHidden: (activation: EdaRulebookActivation) => !activation.is_enabled,
            onClick: (activation: EdaRulebookActivation) => restartRulebookActivation([activation]),
          },
          {
            type: PageActionType.Button,
            selection: PageActionSelection.Single,
            icon: CopyIcon,
            label: t(`Duplicate rulebook activation`),
            onClick: (activation: EdaRulebookActivation) => copyRulebookActivation(activation),
            isDisabled: () =>
              canPatchActivation
                ? ''
                : t(`The rulebook activation cannot be duplicated due to insufficient permission.`),
            isDanger: false,
          },
          {
            type: PageActionType.Seperator,
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
        ]
      : [];
    return actions;
  }, [
    isActionTab,
    rulebookActivation?.is_enabled,
    t,
    enableRulebookActivation,
    disableRulebookActivation,
    canEditRulebookActivation,
    pageNavigate,
    restartRulebookActivation,
    copyRulebookActivation,
    canPatchActivation,
    deleteRulebookActivations,
  ]);

  return (
    <PageLayout>
      <PageHeader
        title={rulebookActivation?.name}
        breadcrumbs={[
          { label: t('Rulebook Activations'), to: getPageUrl(EdaRoute.RulebookActivations) },
          { label: rulebookActivation?.name },
        ]}
        headerActions={
          <PageActions<EdaRulebookActivation>
            actions={itemActions}
            position={'right'}
            selectedItem={rulebookActivation}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Rulebook Activations'),
          page: EdaRoute.RulebookActivations,
          persistentFilterKey: 'rulebook-activations',
        }}
        tabs={[
          { label: t('Details'), page: EdaRoute.RulebookActivationDetails },
          { label: t('History'), page: EdaRoute.RulebookActivationHistory },
          { label: t('Team Access'), page: EdaRoute.RulebookActivationTeamAccess },
          { label: t('User Access'), page: EdaRoute.RulebookActivationUserAccess },
        ]}
        params={{ id: params.id }}
      />
    </PageLayout>
  );
}
