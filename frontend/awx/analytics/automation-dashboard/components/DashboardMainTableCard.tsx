import {
  ITableColumn,
  PageDashboardCard,
  PageTable,
  usePageAlertToaster,
} from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { IAutomationDashboardView, IJobTemplate } from '../types';
import { DashboardTableInputField } from './DashboardTableInputField';
import { DashboardTableToolbarRow } from './DashboardTableToolbarRow';
import { DashboardValueCard } from './DashboardValueCard';
import { usePutRequest } from '../../../../common/crud/usePutRequest';
import { useState } from 'react';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';

interface IJobTemplateModify {
  time_taken_manually_execute_minutes: number;
  time_taken_create_automation_minutes: number;
}

export function DashboardMainTableCard(props: IAutomationDashboardView) {
  const {
    mainTableView,
    details,
    costState,
    setCostState,
    refresh,
    exportCsv,
    loading,
    detailsError,
  } = props;
  const { t } = useTranslation();
  const { activeAwxUser } = useAwxActiveUser();
  const putRequest = usePutRequest<IJobTemplateModify, IJobTemplateModify>();
  const alertToaster = usePageAlertToaster();

  const [errors, setErrors] = useState<Record<
    number,
    Partial<Record<keyof IJobTemplateModify, string>>
  > | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const onTableInputChange = async (
    item: IJobTemplate,
    columnKey: keyof IJobTemplateModify,
    value: number
  ) => {
    setIsSaving(true);
    setErrors(null);
    const templateName = item.template_name;
    const data = {
      time_taken_manually_execute_minutes: item.time_taken_manually_execute_minutes,
      time_taken_create_automation_minutes: item.time_taken_create_automation_minutes,
      [columnKey]: value,
    };
    try {
      let updatedData: IJobTemplateModify;
      try {
        updatedData = await putRequest(
          metricsAPI`/dashboard_reports/template_metadata/${item.id.toString()}/`,
          data as IJobTemplateModify
        );
      } catch (err) {
        const { genericErrors, fieldErrors } = awxErrorAdapter(err);
        alertToaster.addAlert({
          variant: 'danger',
          title: t('Failed to update template metadata for {{templateName}}.', { templateName }),
          children: (
            <>
              {genericErrors.map((e) => (
                <div key={String(e.message)}>{e.message}</div>
              ))}
            </>
          ),
          timeout: 5000,
        });
        setErrors({
          [item.id]: fieldErrors.reduce<Partial<Record<keyof IJobTemplateModify, string>>>(
            (acc, e) => ({ ...acc, [e.name]: String(e.message) }),
            {}
          ),
        });
        return;
      }

      mainTableView.updateItem({ ...item, ...updatedData });

      alertToaster.addAlert({
        variant: 'success',
        title: t('Template metadata for {{templateName}} updated successfully.', { templateName }),
        timeout: 5000,
      });

      // Refresh: a failure here does not undo the save.
      try {
        await refresh();
      } catch {
        alertToaster.addAlert({
          variant: 'warning',
          title: t('Update saved but failed to refresh view.'),
          timeout: 5000,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const tableInputField = (columnKey: keyof IJobTemplateModify, item: IJobTemplate) => (
    <DashboardTableInputField
      id={`${columnKey}_${item.id}`}
      min={1}
      max={1000000}
      type={'integer'}
      value={item[columnKey]}
      onChange={(value: number) => void onTableInputChange(item, columnKey, value)}
      readOnly={loading || isSaving}
      error={errors?.[item.id]?.[columnKey]}
    />
  );

  const timeTakenCreateAutomationColumn: ITableColumn<IJobTemplate> = {
    id: 'time_taken_create_automation',
    header: t('Time taken to create automation (min)'),
    helpText: t(
      'Time taken to create the automation for the job template. This is used to calculate the total time spent on automation, which includes both the time taken to create the automation and the time taken to execute it.'
    ),
    cell: (item) =>
      activeAwxUser?.is_superuser
        ? tableInputField('time_taken_create_automation_minutes', item)
        : item.time_taken_create_automation_minutes,
  };

  const tableColumns: ITableColumn<IJobTemplate>[] = [
    {
      id: 'template_name',
      header: t('Template Name'),
      cell: (item) => item.template_name,
      defaultSort: true,
      defaultSortDirection: 'asc',
      sort: 'template_name',
    },
    {
      id: 'num_job_executions',
      header: t('Number of job executions'),
      cell: (item) => item.runs,
      sort: 'runs',
    },
    {
      id: 'time_taken_manually_execute',
      header: t('Time taken to manually execute (min)'),
      cell: (item) =>
        activeAwxUser?.is_superuser
          ? tableInputField('time_taken_manually_execute_minutes', item)
          : item.time_taken_manually_execute_minutes,
    },
    ...(costState?.include_template_creation_time_in_costs
      ? [timeTakenCreateAutomationColumn]
      : []),
    {
      id: 'elapsed',
      header: t('Running time'),
      cell: (item) => item.elapsed,
      sort: 'elapsed',
    },
    {
      id: 'automated_costs',
      header: t('Automated cost'),
      cell: (item) => item.automated_costs,
      sort: 'automated_costs',
    },
    {
      id: 'manual_costs',
      header: t('Manual cost'),
      cell: (item) => item.manual_costs,
      sort: 'manual_costs',
    },
    {
      id: 'savings',
      header: t('Savings'),
      cell: (item) => item.savings,
      sort: 'savings',
    },
  ];

  return (
    <PageDashboardCard
      id={'ad-main-table-card'}
      width="xxl"
      style={{ gridColumn: 'span 24', maxHeight: 'unset', height: 'fit-content' }}
      isCompact={false}
      canCollapse={false}
    >
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(32px, 1fr))',
        }}
      >
        <DashboardValueCard
          id="cost-manual-automation-card"
          title={t('Cost of manual automation')}
          help={t('Total cost if all jobs were run manually')}
          value={details?.cost_of_manual_automation ?? '-'}
          error={detailsError}
          errorStateTitle={t('Error loading manual automation cost')}
        ></DashboardValueCard>
        <DashboardValueCard
          id="cost-automated-execution-card"
          title={t('Cost of automated execution')}
          help={t('Total cost of running jobs on AAP')}
          value={details?.cost_of_automated_execution ?? '-'}
          error={detailsError}
          errorStateTitle={t('Error loading automated execution cost')}
        ></DashboardValueCard>
        <DashboardValueCard
          id="total-savings-card"
          title={t('Total savings/cost avoided')}
          help={t('Difference between manual and automated cost')}
          value={details?.total_saving ?? '-'}
          error={detailsError}
          errorStateTitle={t('Error loading total savings')}
        ></DashboardValueCard>
        <DashboardValueCard
          id="total-hours-saved-card"
          title={t('Total hours saved/avoided')}
          help={t('Time saved by automation vs manual execution')}
          value={details?.total_time_saving ?? '-'}
          valueSuffix="h"
          error={detailsError}
          errorStateTitle={t('Error loading total hours saved')}
        ></DashboardValueCard>
      </div>
      <DashboardTableToolbarRow
        isLoading={loading}
        itemCount={mainTableView?.itemCount ?? 0}
        costState={costState}
        setCostState={setCostState}
        refresh={refresh}
        onExportCsv={() => void exportCsv()}
      ></DashboardTableToolbarRow>
      <PageTable
        autoHidePagination={true}
        disableBodyPadding={true}
        tableColumns={tableColumns}
        errorStateTitle={t('Error loading data.')}
        compact
        emptyStateIcon={PlusCircleIcon}
        emptyStateTitle={t('No data')}
        emptyStateDescription={t('There is currently no data available.')}
        disableLastRowBorder
        {...mainTableView}
      />
    </PageDashboardCard>
  );
}
