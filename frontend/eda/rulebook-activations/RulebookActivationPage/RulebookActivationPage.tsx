import { AlertProps } from '@patternfly/react-core';
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
  usePageAlertToaster,
  usePageNavigate,
} from '../../../../framework';
import { PageRoutedTabs } from '../../../common/PageRoutedTabs';
import { postRequest } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { StatusEnum } from '../../interfaces/generated/eda-api';
import { EdaRoute } from '../../main/EdaRoutes';
import {
  useDisableRulebookActivations,
  useRestartRulebookActivations,
} from '../hooks/useControlRulebookActivations';
import { useDeleteRulebookActivations } from '../hooks/useDeleteRulebookActivations';

export function RulebookActivationPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const alertToaster = usePageAlertToaster();

  const { data: rulebookActivation, refresh } = useGet<EdaRulebookActivation>(
    edaAPI`/activations/${params.id ?? ''}/`
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

  const deleteRulebookActivations = useDeleteRulebookActivations((deleted) => {
    if (deleted.length > 0) {
      pageNavigate(EdaRoute.RulebookActivations);
    }
  });

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
        refresh();
      },
      [alertToaster, refresh, t]
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
            label: t('Rulebook activation enabled'),
            labelOff: t('Rulebook activation disabled'),
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
            icon: RedoIcon,
            label: t('Restart rulebook activation'),
            isDanger: false,
            isHidden: (activation: EdaRulebookActivation) => !activation.is_enabled,
            onClick: (activation: EdaRulebookActivation) => restartRulebookActivation([activation]),
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
    t,
    enableRulebookActivation,
    disableRulebookActivation,
    restartRulebookActivation,
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
          { label: t('Team Access'), page: EdaRoute.RulebookActivationTeamAccess },
          { label: t('User Access'), page: EdaRoute.RulebookActivationUserAccess },
        ]}
        params={{ id: params.id }}
      />
    </PageLayout>
  );
}
