import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { RedoIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
  usePageAlertToaster,
} from '../../../../framework';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';
import { useGet } from '../../../common/crud/useGet';
import { EdaRoute } from '../../EdaRoutes';
import { API_PREFIX, SWR_REFRESH_INTERVAL } from '../../constants';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { Status906Enum } from '../../interfaces/generated/eda-api';
import { useRestartRulebookActivations } from '../hooks/useControlRulebookActivations';
import { useDeleteRulebookActivations } from '../hooks/useDeleteRulebookActivations';
import { postRequest } from '../../../common/crud/Data';
import { AlertProps } from '@patternfly/react-core';

export function RulebookActivationPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const alertToaster = usePageAlertToaster();
  const { data: rulebookActivation, refresh } = useGet<EdaRulebookActivation>(
    `${API_PREFIX}/activations/${params.id}/`,
    undefined,
    { refreshInterval: SWR_REFRESH_INTERVAL }
  );

  const restartRulebookActivation = useRestartRulebookActivations((restarted) => {
    if (restarted.length > 0) {
      refresh();
    }
  });

  const deleteRulebookActivations = useDeleteRulebookActivations((deleted) => {
    if (deleted.length > 0) {
      pageNavigate(EdaRoute.RulebookActivations);
    }
  });

  const handleToggle: (activation: EdaRulebookActivation, enabled: boolean) => Promise<void> =
    useCallback(
      async (activation, enabled) => {
        const alert: AlertProps = {
          variant: 'success',
          title: `${activation.name} ${enabled ? t('enabled') : t('disabled')}.`,
          timeout: 5000,
        };
        await postRequest(
          `${API_PREFIX}/activations/${activation.id}/${enabled ? 'enable/' : 'disable/'}`,
          undefined
        )
          .then(() => alertToaster.addAlert(alert))
          .catch(() => {
            alertToaster.addAlert({
              variant: 'danger',
              title: `${t('Failed to ')} ${enabled ? t('enable') : t('disable')} ${
                activation.name
              }`,
              timeout: 5000,
            });
          });
        refresh();
      },
      [alertToaster, refresh, t]
    );
  const isActionTab =
    location.pathname ===
    getPageUrl(EdaRoute.RulebookActivationDetails, { params: { id: rulebookActivation?.id } });
  const itemActions = useMemo<IPageAction<EdaRulebookActivation>[]>(() => {
    const actions: IPageAction<EdaRulebookActivation>[] = isActionTab
      ? [
          {
            type: PageActionType.Switch,
            selection: PageActionSelection.Single,
            ariaLabel: (isEnabled) =>
              isEnabled ? t('Click to disable instance') : t('Click to enable instance'),
            isPinned: true,
            label: t('Rulebook activation enabled'),
            labelOff: t('Rulebook activation disabled'),
            onToggle: (activation: EdaRulebookActivation, activate: boolean) =>
              handleToggle(activation, activate),
            isSwitchOn: (activation: EdaRulebookActivation) => activation.is_enabled ?? false,
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
            isDanger: false,
            isHidden: (activation: EdaRulebookActivation) => !activation.is_enabled,
            onClick: (activation: EdaRulebookActivation) => restartRulebookActivation([activation]),
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
  }, [handleToggle, isActionTab, restartRulebookActivation, deleteRulebookActivations, t]);

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
            position={DropdownPosition.right}
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
        ]}
        params={{ id: params.id }}
      />
    </PageLayout>
  );
}
