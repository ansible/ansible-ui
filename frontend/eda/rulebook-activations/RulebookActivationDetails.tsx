import { DropdownPosition, PageSection, Skeleton, Stack } from '@patternfly/react-core';
import { CubesIcon, RedoIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
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
} from '../../../framework';
import { formatDateString } from '../../../framework/utils/formatDateString';
import { capitalizeFirstLetter } from '../../../framework/utils/strings';
import { RouteObj } from '../../Routes';
import { StatusCell } from '../../common/StatusCell';
import { useGet } from '../../common/crud/useGet';
import { API_PREFIX, SWR_REFRESH_INTERVAL } from '../constants';
import { EdaActivationInstance } from '../interfaces/EdaActivationInstance';
import { EdaRulebookActivation } from '../interfaces/EdaRulebookActivation';
import { useEdaView } from '../useEventDrivenView';
import { useActivationHistoryColumns } from './hooks/useActivationHistoryColumns';
import {
  useDisableRulebookActivations,
  useEnableRulebookActivations,
  useRestartRulebookActivations,
} from './hooks/useControlRulebookActivations';
import { useDeleteRulebookActivations } from './hooks/useDeleteRulebookActivations';
import { PageDetailsSection } from '../common/PageDetailSection';
import { EdaExtraVarsCell } from './components/EdaExtraVarCell';

// eslint-disable-next-line react/prop-types
export function RulebookActivationDetails({ initialTabIndex = 0 }) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const restartPolicyHelpBlock = (
    <Trans i18nKey="restartPolicyHelpBlock">
      <p>A policy to decide when to restart a rulebook.</p>
      <br />
      <p>Policies:</p>
      <p>Always: restarts when a rulebook finishes.</p>
      <p>Never: never restarts a rulebook when it finishes.</p>
      <p>On failure: only restarts when it fails.</p>
    </Trans>
  );

  const { data: rulebookActivation, refresh } = useGet<EdaRulebookActivation>(
    `${API_PREFIX}/activations/${params.id ?? ''}/`,
    undefined,
    SWR_REFRESH_INTERVAL
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
        isPinned: true,
        label: t('Rulebook activation enabled'),
        labelOff: t('Rulebook activation disabled'),
        onToggle: (activation: EdaRulebookActivation, activate: boolean) => {
          if (activate) void enableRulebookActivation([activation]);
          else void disableRulebookActivation([activation]);
        },
        isSwitchOn: (activation: EdaRulebookActivation) => activation.is_enabled ?? false,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: RedoIcon,
        label: t('Restart rulebook activation'),
        isDanger: false,
        isHidden: (activation: EdaRulebookActivation) =>
          !activation.is_enabled || activation.restart_policy !== 'always',
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
        <PageSection variant="light">
          <PageDetails>
            <PageDetail label={t('Name')}>{rulebookActivation?.name || ''}</PageDetail>
            <PageDetail label={t('Description')}>
              {rulebookActivation?.description || ''}
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
            <PageDetail
              label={t('Rulebook')}
              helpText={t('Rulebooks will be shown according to the project selected.')}
            >
              {rulebookActivation?.rulebook?.name || ''}
            </PageDetail>
            <PageDetail label={t('Restart policy')} helpText={restartPolicyHelpBlock}>
              {rulebookActivation?.restart_policy
                ? t(capitalizeFirstLetter(rulebookActivation?.restart_policy))
                : ''}
            </PageDetail>
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
            <PageDetail label={t('Activation status')}>
              <StatusCell status={rulebookActivation?.status || ''} />
            </PageDetail>
            <PageDetail label={t('Project git hash')}>
              {rulebookActivation?.project?.git_hash || ''}
            </PageDetail>
            <PageDetail label={t('Last restarted')}>
              {rulebookActivation?.last_restarted
                ? formatDateString(rulebookActivation.last_restarted)
                : ''}
            </PageDetail>
            <PageDetail label={t('Restarted count')}>
              {rulebookActivation?.restart_count || 0}
            </PageDetail>
            <PageDetail label={t('Created')}>
              {rulebookActivation?.created_at
                ? formatDateString(rulebookActivation?.created_at)
                : ''}
            </PageDetail>
            <PageDetail label={t('Last modified')}>
              {rulebookActivation?.modified_at
                ? formatDateString(rulebookActivation?.modified_at)
                : ''}
            </PageDetail>
          </PageDetails>
          {rulebookActivation?.extra_var?.id && (
            <PageDetailsSection>
              <PageDetail
                label={t('Variables')}
                helpText={t(
                  'Pass extra command line variables to the playbook. This is the -e or --extra-vars command line parameter for ansible-playbook. Provide key/value pairs using either YAML or JSON. Refer to the documentation for example syntax.'
                )}
              >
                <EdaExtraVarsCell id={rulebookActivation.extra_var.id} />
              </PageDetail>
            </PageDetailsSection>
          )}
        </PageSection>
      </Scrollable>
    );
  };

  function ActivationHistoryTab() {
    const params = useParams<{ id: string }>();
    const { t } = useTranslation();

    const tableColumns = useActivationHistoryColumns();
    const view = useEdaView<EdaActivationInstance>({
      url: `${API_PREFIX}/activations/${params?.id || ''}/instances/`,
      tableColumns,
    });
    return (
      <PageLayout>
        <PageTable
          tableColumns={tableColumns}
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

  return (
    <PageLayout>
      <PageHeader
        title={rulebookActivation?.name}
        breadcrumbs={[
          { label: t('Rulebook Activations'), to: RouteObj.EdaRulebookActivations },
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
