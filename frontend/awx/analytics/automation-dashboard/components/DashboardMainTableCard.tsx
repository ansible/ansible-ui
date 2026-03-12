import { ITableColumn, PageDashboardCard, PageTable } from '@ansible/ansible-ui-framework';
import { Flex } from '@patternfly/react-core';
import { DashboardValueCard } from './DashboardValueCard';
import { useTranslation } from 'react-i18next';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { IJobTemplate, ITemplateOptions } from '../interfaces';
import React, { useState } from 'react';
import { DashboardTableInputField } from './DashboardTableInputField';
import { DashboardTableToolbarRow } from './DashboardTableToolbarRow';

export function DashboardMainTableCard() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [toolbarState, setToolbarState] = useState<ITemplateOptions>({
    automated_process_cost_per_minute: 1,
    manual_cost_automation_per_hour: 10,
    enable_template_creation_time: true,
  });
  const keyFn = (item: IJobTemplate) => item.id;
  const onTableInputBlur = (
    _item: IJobTemplate,
    _columnKey: keyof IJobTemplate,
    _value: number
  ) => {
    // TODO: Implement logic to update the value in the backend or state management
  };

  // TODO: Replace with actual data fetching logic
  const items: IJobTemplate[] = [
    {
      id: 1,
      name: 'Job Template 1',
      runs: 10,
      num_hosts: 5,
      time_taken_manually_execute_minutes: 30,
      time_taken_create_automation_minutes: 60,
      elapsed: '00:15:00',
      automated_costs: 10,
      manual_costs: 110,
      savings: 100,
    },
    {
      id: 2,
      name: 'Job Template 2',
      runs: 20,
      num_hosts: 10,
      time_taken_manually_execute_minutes: 45,
      time_taken_create_automation_minutes: 60,
      elapsed: '01:15:27',
      automated_costs: 20,
      manual_costs: 120,
      savings: 100,
    },
    {
      id: 3,
      name: 'Job Template 1',
      runs: 10,
      num_hosts: 5,
      time_taken_manually_execute_minutes: 30,
      time_taken_create_automation_minutes: 60,
      elapsed: '00:15:00',
      automated_costs: 30,
      manual_costs: 130,
      savings: 100,
    },
    {
      id: 4,
      name: 'Job Template 2',
      runs: 20,
      num_hosts: 10,
      time_taken_manually_execute_minutes: 45,
      time_taken_create_automation_minutes: 60,
      elapsed: '01:15:27',
      automated_costs: 40,
      manual_costs: 140,
      savings: 100,
    },
    {
      id: 5,
      name: 'Job Template 1',
      runs: 10,
      num_hosts: 5,
      time_taken_manually_execute_minutes: 30,
      time_taken_create_automation_minutes: 60,
      elapsed: '00:15:00',
      automated_costs: 50,
      manual_costs: 150,
      savings: 100,
    },
    {
      id: 6,
      name: 'Job Template 2',
      runs: 20,
      num_hosts: 10,
      time_taken_manually_execute_minutes: 45,
      time_taken_create_automation_minutes: 60,
      elapsed: '01:15:27',
      automated_costs: 60,
      manual_costs: 160,
      savings: 100,
    },
    {
      id: 7,
      name: 'Job Template 1',
      runs: 10,
      num_hosts: 5,
      time_taken_manually_execute_minutes: 30,
      time_taken_create_automation_minutes: 60,
      elapsed: '00:15:00',
      automated_costs: 70,
      manual_costs: 170,
      savings: 100,
    },
    {
      id: 8,
      name: 'Job Template 2',
      runs: 20,
      num_hosts: 10,
      time_taken_manually_execute_minutes: 45,
      time_taken_create_automation_minutes: 60,
      elapsed: '01:15:27',
      automated_costs: 80,
      manual_costs: 180,
      savings: 100,
    },
    {
      id: 9,
      name: 'Job Template 1',
      runs: 10,
      num_hosts: 5,
      time_taken_manually_execute_minutes: 30,
      time_taken_create_automation_minutes: 60,
      elapsed: '00:15:00',
      automated_costs: 90,
      manual_costs: 190,
      savings: 100,
    },
    {
      id: 10,
      name: 'Job Template 2',
      runs: 20,
      num_hosts: 10,
      time_taken_manually_execute_minutes: 45,
      time_taken_create_automation_minutes: 60,
      elapsed: '01:15:27',
      automated_costs: 100,
      manual_costs: 200,
      savings: 100,
    },
  ]; // Replace with actual data fetching logic

  const tableInputField = (columnKey: keyof IJobTemplate, item: IJobTemplate) => (
    <DashboardTableInputField
      id={`${columnKey}_${item.id}`}
      min={1}
      max={1000000}
      type={'integer'}
      currentValue={item.time_taken_manually_execute_minutes}
      onBlur={(value: number) => onTableInputBlur(item, columnKey, value)}
    />
  );

  const timeTakenCreateAutomationColumn: ITableColumn<IJobTemplate> = {
    id: 'time_taken_create_automation',
    header: t('Time taken to create automation (min)'),
    cell: (item) => tableInputField('time_taken_create_automation_minutes', item),
  };

  const tableColumns: ITableColumn<IJobTemplate>[] = [
    {
      id: 'template_name',
      header: t('Template Name'),
      cell: (item) => item.name,
    },
    {
      id: 'num_job_executions',
      header: t('Number of job executions'),
      cell: (item) => item.runs,
    },
    {
      id: 'time_taken_manually_execute',
      header: t('Time taken to manually execute (min)'),
      cell: (item) => tableInputField('time_taken_manually_execute_minutes', item),
    },
    ...(toolbarState.enable_template_creation_time ? [timeTakenCreateAutomationColumn] : []),
    {
      id: 'elapsed',
      header: t('Running time'),
      cell: (item) => item.elapsed,
    },
    {
      id: 'automated_costs',
      header: t('Automated cost'),
      cell: (item) => item.automated_costs.toFixed(2),
    },
    {
      id: 'manual_costs',
      header: t('Manual cost'),
      cell: (item) => item.manual_costs.toFixed(2),
    },
    {
      id: 'savings',
      header: t('Savings'),
      cell: (item) => item.savings.toFixed(2),
    },
  ];

  return (
    <PageDashboardCard
      id={'ad-main-table-card'}
      width="xxl"
      height="xs"
      style={{ gridColumn: 'span 24', maxHeight: 'unset', height: '100%' }}
      isCompact={true}
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
          help={t(
            'Manual time of automation (minutes) * Host executions * Average cost of an employee minute'
          )}
          value={'$0.00'}
        ></DashboardValueCard>
        <DashboardValueCard
          id="cost-automated-execution-card"
          title={t('Cost of automated execution')}
          help={t('Running time (s) / 60 * Cost per minute of AAP')}
          value={'$0.00'}
        ></DashboardValueCard>
        <DashboardValueCard
          id="total-savings-card"
          title={t('Total savings/cost avoided')}
          help={t('Cost of manual automation - Cost of automated execution')}
          value={'$0.00'}
        ></DashboardValueCard>
        <DashboardValueCard
          id="total-hours-saved-card"
          title={t('Total hours saved/avoided')}
          help={t('Manual time of automation (minutes) * Host executions - Running time (s) / 60.')}
          value={'0.00h'}
        ></DashboardValueCard>
      </div>
      <DashboardTableToolbarRow
        isLoading={false}
        itemCount={items.length}
        toolbarState={toolbarState}
        setToolbarState={setToolbarState}
      ></DashboardTableToolbarRow>

      <Flex direction={{ default: 'column' }} style={{ marginTop: 'auto' }}>
        <PageTable
          autoHidePagination={true}
          disableBodyPadding={true}
          pageItems={items}
          tableColumns={tableColumns}
          errorStateTitle={t('Error loading data.')}
          itemCount={items.length}
          compact
          keyFn={keyFn}
          page={page}
          perPage={perPage}
          setPage={setPage}
          setPerPage={setPerPage}
          emptyStateIcon={PlusCircleIcon}
          emptyStateTitle={t('No data')}
          emptyStateDescription={t('There is currently no data available.')}
          disableLastRowBorder
        ></PageTable>
      </Flex>
    </PageDashboardCard>
  );
}
