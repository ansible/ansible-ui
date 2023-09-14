import {
  ClipboardCopy,
  DropdownPosition,
  PageSection,
  Skeleton,
  Stack,
} from '@patternfly/react-core';
import { CubesIcon, RedoIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  PageTab,
  PageTable,
  PageTabs,
  Scrollable,
  useGetPageUrl,
} from '../../../framework';
import { formatDateString } from '../../../framework/utils/formatDateString';
import { capitalizeFirstLetter } from '../../../framework/utils/strings';
import { RouteObj } from '../../common/Routes';
import { StatusCell } from '../../common/Status';
import { useGet } from '../../common/crud/useGet';
import { EdaRoute } from '../EdaRoutes';
import { API_PREFIX, SWR_REFRESH_INTERVAL } from '../constants';
import { EdaActivationInstance } from '../interfaces/EdaActivationInstance';
import { EdaRulebookActivation } from '../interfaces/EdaRulebookActivation';
import { Status0E7Enum } from '../interfaces/generated/eda-api';
import { useEdaView } from '../useEventDrivenView';
import { EdaExtraVarsCell } from './components/EdaExtraVarCell';
import { useActivationHistoryColumns } from './hooks/useActivationHistoryColumns';
import { useActivationHistoryFilters } from './hooks/useActivationHistoryFilters';
import {
  useDisableRulebookActivations,
  useEnableRulebookActivations,
  useRestartRulebookActivations,
} from './hooks/useControlRulebookActivations';
import { useDeleteRulebookActivations } from './hooks/useDeleteRulebookActivations';

// eslint-disable-next-line react/prop-types
export function RulebookActivationDetails({ initialTabIndex = 0 }) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const restartPolicyHelpBlock = (
    <>
      <p>{t('A policy to decide when to restart a rulebook.')}</p>
      <br />
      <p>{t('Policies:')}</p>
      <p>{t('Always: restarts when a rulebook finishes.')}</p>
      <p>{t('Never: never restarts a rulebook when it finishes.')}</p>
      <p>{t('On failure: only restarts when it fails.')}</p>
    </>
  );

  const { data: rulebookActivation, refresh } = useGet<EdaRulebookActivation>(
    `${API_PREFIX}/activations/${params.id ?? ''}/`,
    undefined,
    { refreshInterval: SWR_REFRESH_INTERVAL }
  );

  const enableRulebookActivation = useEnableRulebookActivations((enabled) => {
    if (enabled.length > 0) {
      refresh();
    }
  });

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
      navigate(RouteObj.EdaRulebookActivations);
    }
  });
  const itemActions = useMemo<IPageAction<EdaRulebookActivation>[]>(() => {
    const actions: IPageAction<EdaRulebookActivation>[] = [
      {
        type: PageActionType.Switch,
        selection: PageActionSelection.Single,
        ariaLabel: (isEnabled) =>
          isEnabled ? t('Click to disable instance') : t('Click to enable instance'),
        isPinned: true,
        label: t('Rulebook activation enabled'),
        labelOff: t('Rulebook activation disabled'),
        onToggle: (activation: EdaRulebookActivation, activate: boolean) => {
          if (activate) void enableRulebookActivation([activation]);
          else void disableRulebookActivation([activation]);
        },
        isSwitchOn: (activation: EdaRulebookActivation) => activation.is_enabled ?? false,
        isDisabled: (activation: EdaRulebookActivation) =>
          activation.status === Status0E7Enum.Stopping
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
    ];
    return actions;
  }, [
    enableRulebookActivation,
    disableRulebookActivation,
    restartRulebookActivation,
    deleteRulebookActivations,
    t,
  ]);

  const renderActivationDetailsTab = (
    rulebookActivation: EdaRulebookActivation | undefined
  ): JSX.Element => {
    return (
      <Scrollable>
        <PageDetails>
          <PageDetail label={t('Activation ID')}>{rulebookActivation?.id || ''}</PageDetail>
          <PageDetail label={t('Name')}>{rulebookActivation?.name || ''}</PageDetail>
          <PageDetail label={t('Description')}>{rulebookActivation?.description || ''}</PageDetail>
          <PageDetail
            label={t('Project')}
            helpText={t('Projects are a logical collection of rulebooks.')}
          >
            {rulebookActivation && rulebookActivation.project?.id ? (
              <Link
                to={RouteObj.EdaProjectDetails.replace(
                  ':id',
                  `${rulebookActivation.project?.id || ''}`
                )}
              >
                {rulebookActivation?.project?.name}
              </Link>
            ) : (
              rulebookActivation?.project?.name || ''
            )}
          </PageDetail>
          <PageDetail
            label={t('Rulebook')}
            helpText={t('Rulebooks will be shown according to the project selected.')}
          >
            {rulebookActivation?.rulebook?.name || ''}
          </PageDetail>
          <PageDetail
            label={t('Decision environment')}
            helpText={t('Decision environments are a container image to run Ansible rulebooks.')}
          >
            {rulebookActivation && rulebookActivation?.decision_environment?.id ? (
              <Link
                to={RouteObj.EdaDecisionEnvironmentDetails.replace(
                  ':id',
                  `${rulebookActivation?.decision_environment?.id || ''}`
                )}
              >
                {rulebookActivation?.decision_environment?.name}
              </Link>
            ) : (
              rulebookActivation?.decision_environment?.name || ''
            )}
          </PageDetail>
          <PageDetail label={t('Restart policy')} helpText={restartPolicyHelpBlock}>
            {rulebookActivation?.restart_policy
              ? t(capitalizeFirstLetter(rulebookActivation?.restart_policy))
              : ''}
          </PageDetail>
          <PageDetail label={t('Activation status')}>
            <StatusCell status={rulebookActivation?.status || ''} />
          </PageDetail>
          <PageDetail label={t('Project git hash')}>
            <ClipboardCopy hoverTip="Copy" clickTip="Copied" variant="inline-compact">
              {rulebookActivation?.project?.git_hash || ''}
            </ClipboardCopy>
          </PageDetail>
          <PageDetail label={t('Number of rules')}>
            {rulebookActivation?.rules_count || 0}
          </PageDetail>
          <PageDetail label={t('Fire count')}>
            {rulebookActivation?.rules_fired_count || 0}
          </PageDetail>
          <PageDetail label={t('Last restarted')}>
            {rulebookActivation?.restarted_at
              ? formatDateString(rulebookActivation.restarted_at)
              : ''}
          </PageDetail>
          <PageDetail label={t('Restart count')}>
            {rulebookActivation?.restart_count || 0}
          </PageDetail>
          <PageDetail label={t('Created')}>
            {rulebookActivation?.created_at ? formatDateString(rulebookActivation?.created_at) : ''}
          </PageDetail>
          <PageDetail label={t('Last modified')}>
            {rulebookActivation?.modified_at
              ? formatDateString(rulebookActivation?.modified_at)
              : ''}
          </PageDetail>
        </PageDetails>
        {rulebookActivation?.extra_var?.id && (
          <PageSection variant="light">
            <EdaExtraVarsCell
              label={t('Variables')}
              helpText={t(
                `The variables for the rulebook are in a JSON or YAML format. The content would be equivalent to the file passed through the '--vars' flag of ansible-rulebook command.`
              )}
              id={rulebookActivation.extra_var.id}
            />
          </PageSection>
        )}
      </Scrollable>
    );
  };

  function ActivationHistoryTab() {
    const params = useParams<{ id: string }>();
    const { t } = useTranslation();
    const toolbarFilters = useActivationHistoryFilters();

    const tableColumns = useActivationHistoryColumns();
    const view = useEdaView<EdaActivationInstance>({
      url: `${API_PREFIX}/activations/${params?.id || ''}/instances/`,
      toolbarFilters,
      tableColumns,
    });
    return (
      <PageLayout>
        <PageTable
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          errorStateTitle={t('Error loading history')}
          emptyStateTitle={t('No activation history')}
          emptyStateIcon={CubesIcon}
          emptyStateDescription={t('No history for this rulebook activation')}
          {...view}
          defaultSubtitle={t('Rulebook Activation History')}
        />
      </PageLayout>
    );
  }

  const getPageUrl = useGetPageUrl();

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
      {rulebookActivation ? (
        <PageTabs initialTabIndex={initialTabIndex}>
          <PageTab label={t('Details')}>{renderActivationDetailsTab(rulebookActivation)}</PageTab>
          <PageTab label={t('History')}>
            <ActivationHistoryTab />
          </PageTab>
        </PageTabs>
      ) : (
        <PageTabs>
          <PageTab>
            <PageSection variant="light">
              <Stack hasGutter>
                <Skeleton />
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </Stack>
            </PageSection>
          </PageTab>
        </PageTabs>
      )}
    </PageLayout>
  );
}
