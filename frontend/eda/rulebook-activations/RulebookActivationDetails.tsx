import { DropdownPosition, PageSection, Skeleton, Stack } from '@patternfly/react-core';
import { TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActions,
  PageActionType,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  PageTab,
  PageTable,
  PageTabs,
  Scrollable,
  useInMemoryView,
} from '../../../framework';
import { capitalizeFirstLetter } from '../../../framework/utils/capitalize';
import { formatDateString } from '../../../framework/utils/formatDateString';
import { useGet } from '../../common/crud/useGet';
import { RouteObj } from '../../Routes';
import { API_PREFIX } from '../constants';
import { EdaJob } from '../interfaces/EdaJob';
import { EdaRulebookActivation } from '../interfaces/EdaRulebookActivation';
import { useActivationActionColumns } from './hooks/useActivationActionColumns';
import { useActivationActionFilters } from './hooks/useActivationActionFilters';
import { useActivationActionsActions } from './hooks/useActivationActionsActions';
import {
  useDisableActivation,
  useRelaunchActivation,
  useRestartActivation,
} from './hooks/useActivationDialogs';
import { useActivationHistoryColumns } from './hooks/useActivationHistoryColumns';
import { useDeleteRulebookActivations } from './hooks/useDeleteRulebookActivations';

export function RulebookActivationDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const relaunchActivation = useRelaunchActivation();
  const restartActivation = useRestartActivation();
  const disableActivation = useDisableActivation();
  const deleteRulebookActivations = useDeleteRulebookActivations((deleted) => {
    if (deleted.length > 0) {
      navigate(RouteObj.EdaRulebookActivations);
    }
  });

  const { data: rulebookActivation } = useGet<EdaRulebookActivation>(
    `${API_PREFIX}/activations/${params.id ?? ''}/`
  );
  const itemActions = useMemo<IPageAction<EdaRulebookActivation>[]>(
    () => [
      {
        type: PageActionType.single,
        label: 'Relaunch',
        onClick: (activation: EdaRulebookActivation) => relaunchActivation(activation),
      },
      {
        type: PageActionType.single,
        label: 'Restart',
        onClick: (activation: EdaRulebookActivation) => restartActivation(activation),
      },
      {
        type: PageActionType.single,
        label: 'Disable',
        onClick: (activation: EdaRulebookActivation) => disableActivation(activation),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete rulebookActivation'),
        onClick: (rulebookActivation: EdaRulebookActivation) =>
          deleteRulebookActivations([rulebookActivation]),
        isDanger: true,
      },
    ],
    [relaunchActivation, restartActivation, deleteRulebookActivations, disableActivation, t]
  );

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
            <PageDetail label={t('Decision environment')}>
              {rulebookActivation?.decision_environment || ''}
            </PageDetail>
            <PageDetail label={t('Rulebook')}>
              {rulebookActivation && rulebookActivation.rulebook?.id ? (
                <Link
                  to={RouteObj.EdaRulebookDetails.replace(
                    ':id',
                    `${rulebookActivation.rulebook?.id || ''}`
                  )}
                >
                  {rulebookActivation?.rulebook?.name}
                </Link>
              ) : (
                rulebookActivation?.rulebook?.name || ''
              )}
            </PageDetail>
            <PageDetail label={t('Restart policy')}>
              {rulebookActivation?.restart_policy
                ? t(capitalizeFirstLetter(rulebookActivation?.restart_policy))
                : ''}
            </PageDetail>
            <PageDetail label={t('Project')}>{rulebookActivation?.project?.name || ''}</PageDetail>
            <PageDetail label={t('Activation status')}>
              {rulebookActivation?.status || ''}
            </PageDetail>
            <PageDetail label={t('Throttle')}>{rulebookActivation?.throttle || ''}</PageDetail>
            <PageDetail label={t('Variables template')}>
              {rulebookActivation?.variables_template || ''}
            </PageDetail>
            <PageDetail label={t('Last restarted')}>
              {rulebookActivation?.last_restarted
                ? formatDateString(rulebookActivation.last_restarted)
                : ''}
            </PageDetail>
            <PageDetail label={t('Restarted count')}>
              {rulebookActivation?.restarted_count || 0}
            </PageDetail>
            <PageDetail label={t('Created')}>
              {rulebookActivation?.created_at
                ? formatDateString(rulebookActivation?.created_at)
                : ''}
            </PageDetail>
            <PageDetail label={t('Modified')}>
              {rulebookActivation?.modified_at
                ? formatDateString(rulebookActivation?.modified_at)
                : ''}
            </PageDetail>
          </PageDetails>
        </PageSection>
      </Scrollable>
    );
  };

  function ActivationActionsTab() {
    const _params = useParams<{ id: string }>();
    const { t } = useTranslation();
    const toolbarFilters = useActivationActionFilters();
    const tableColumns = useActivationActionColumns();

    function useGetActivationActions(id: string) {
      return useGet<EdaJob[]>(`${API_PREFIX}/activation_instance_job_instances/${id}/`);
    }

    const { data: actions } = useGetActivationActions('8' || '');

    const view = useInMemoryView<EdaJob>({
      items: actions,
      tableColumns,
      toolbarFilters,
      keyFn: (item) => item?.id,
    });

    const rowActions = useActivationActionsActions();
    return (
      <PageLayout>
        <PageTable
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          rowActions={rowActions}
          errorStateTitle={t('Error loading actions')}
          emptyStateTitle={t('No actions yet')}
          emptyStateDescription={t('No actions for this rulebook activation')}
          {...view}
          defaultSubtitle={t('Rulebook activation')}
        />
      </PageLayout>
    );
  }

  function ActivationHistoryTab() {
    const params = useParams<{ id: string }>();
    const { t } = useTranslation();
    const toolbarFilters = useActivationActionFilters();

    function useGetActivationHistory(id: string) {
      return useGet<EdaJob[]>(`${API_PREFIX}/activation_instance_job_instances/${id}/`);
    }
    const { data: actions } = useGetActivationHistory(params?.id || '');
    const tableColumns = useActivationHistoryColumns();
    const view = useInMemoryView<EdaJob>({
      items: actions,
      tableColumns,
      toolbarFilters,
      keyFn: (item) => item?.id,
    });
    return (
      <PageLayout>
        <PageTable
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          errorStateTitle={t('Error loading history')}
          emptyStateTitle={t('No actions history')}
          emptyStateDescription={t('No actions history  for this rulebook activation')}
          {...view}
          defaultSubtitle={t('Rulebook activation history')}
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
        <PageTabs>
          <PageTab label={t('Details')}>{renderActivationDetailsTab(rulebookActivation)}</PageTab>
          <PageTab label={t('Actions')}>
            <ActivationActionsTab />
          </PageTab>
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
