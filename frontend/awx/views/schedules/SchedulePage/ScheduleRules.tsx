import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IPageAction,
  ITableColumn,
  LoadingPage,
  PageActionSelection,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTable,
} from '../../../../../framework';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { Schedule } from '../../../interfaces/Schedule';
import { useGetCreateRuleRoute } from '../hooks/scheduleHelpers';

export function ScheduleRules() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id: string; schedule_id: string; source_id?: string }>();
  const {
    data: schedule,
    error,
    refresh,
  } = useGetItem<Schedule>(awxAPI`/schedules/`, params.schedule_id);
  const createUrl: string = useGetCreateRuleRoute();

  const rowActions = useMemo<IPageAction<{ rrule: string }>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        label: t('Edit rule'),
        onClick: () => navigate(createUrl),
        isPinned: true,
      },
    ],
    [createUrl, navigate, t]
  );
  const toolbarActions = useMemo<IPageAction<{ rrule: string }>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create rule'),
        href: createUrl,
      },
    ],
    [createUrl, t]
  );
  const columns = useMemo<ITableColumn<{ rrule: string }>>(
    () => ({
      header: 'Rrule',
      type: 'text',
      value: (item: { rrule: string }) => item.rrule,
    }),
    []
  );

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!schedule) return <LoadingPage breadcrumbs tabs />;

  const [_dtstart, ...rules] = schedule.rrule.split(' ');
  const mappedRRules = rules.map((rule) => ({ rrule: rule }));

  const view = {
    pageItems: mappedRRules,
    keyFn: (item: { rrule: string }) => item.rrule,
    tableColumns: [columns],
    itemCount: mappedRRules.length,
  };
  return (
    <PageLayout>
      <PageHeader
        title={t('Schedule Rules')}
        titleHelpTitle={t('Schedule Rules')}
        titleHelp={t('Create as many schedule rules as you need.')}
        titleDocLink="https://docs.ansible.com/automation-controller/latest/html/userguide/scheduling.html"
        description={t(
          'Schedule rules are a component of an overall schedule.  A schedule rule is used to determine when a schedule will run.  A schedule can have multiple rules.'
        )}
      />
      <PageTable<{ rrule: string }>
        id="awx-schedule-rules-table"
        rowActions={rowActions}
        toolbarActions={toolbarActions}
        errorStateTitle={t('Error loading rule')}
        emptyStateTitle={t('No rules yet')}
        emptyStateDescription={t('To get started, create a rule.')}
        emptyStateButtonText={t('Create Rule')}
        emptyStateButtonClick={() => navigate(createUrl)}
        defaultSubtitle={t('Rules')}
        disablePagination
        page={1}
        perPage={mappedRRules.length}
        setPage={() => 1}
        setPerPage={() => mappedRRules.length}
        {...view}
      />
    </PageLayout>
  );
}
