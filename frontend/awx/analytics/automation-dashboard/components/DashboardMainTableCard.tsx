import {
  ITableColumn,
  PageDashboardCard,
  PageTable,
  usePageAlertToaster,
} from '@ansible/ansible-ui-framework';
import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IAutomationDashboardView, IJobTemplate } from '../types';
import { DashboardTableInputField } from './DashboardTableInputField';
import { DashboardTableToolbarRow } from './DashboardTableToolbarRow';
import { DashboardValueCard } from './DashboardValueCard';
import { usePutRequest } from '../../../../common/crud/usePutRequest';
import { currencyFormatter } from '../../utilities/currencyFormatter';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import useResizeObserver from '@react-hook/resize-observer';
import { CardBody } from '@patternfly/react-core';
import styled from 'styled-components';
import { ExportIcon } from '@patternfly/react-icons';
import { DashboardExportButton } from './DashboardExportButton';
import { hasValidRequiredFilters } from '../utils/queryString';

interface IJobTemplateModify {
  time_taken_manually_execute_minutes: number;
  time_taken_create_automation_minutes: number;
}

// Uses 1610px instead of PageDashboard's 1662px to account for card padding
const GRID_COLUMN_WIDTH = 1610 / 24; // ~67px per column

/** Fixed width (px) for time-input columns to keep editable fields consistently sized. */
const TIME_COLUMN_WIDTH = 212;

/**
 * The main table card always spans the full dashboard grid.
 * 32 exceeds the maximum expected column count (~31) so `span 32`
 * reliably fills the entire row on every viewport size.
 */
const MAIN_TABLE_FULL_SPAN = 32;

const TdWrapper = styled.div`
  padding-block-start: var(--pf-t--global--spacer--control--vertical--default);
  padding-block-end: var(--pf-t--global--spacer--control--vertical--default);
`;

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
    isFilterStateDefault,
    toolbarFilters,
    topCardsWidth,
  } = props;
  const { t } = useTranslation();
  const { activeAwxUser } = useAwxActiveUser();
  const putRequest = usePutRequest<IJobTemplateModify, IJobTemplateModify>();
  const alertToaster = usePageAlertToaster();

  const ref = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(1);
  const filtersValid = hasValidRequiredFilters(toolbarFilters, mainTableView.filterState);
  const calculateGridColumns = (width: number) =>
    Math.max(1, Math.floor(width / GRID_COLUMN_WIDTH));

  useLayoutEffect(() => {
    setColumns(calculateGridColumns(ref.current?.clientWidth ?? 0));
  }, []);

  useResizeObserver(ref, (entry) => {
    setColumns(calculateGridColumns(entry.contentRect.width));
  });

  const [errors, setErrors] = useState<Record<
    number,
    Partial<Record<keyof IJobTemplateModify, string>>
  > | null>(null);

  const onTableInputChange = async (
    item: IJobTemplate,
    columnKey: keyof IJobTemplateModify,
    value: number
  ) => {
    setErrors(null);
    const templateName = item.template_name;
    const data = {
      time_taken_manually_execute_minutes: item.time_taken_manually_execute_minutes,
      time_taken_create_automation_minutes: item.time_taken_create_automation_minutes,
      [columnKey]: value,
    };
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
  };

  const tableInputField = (columnKey: keyof IJobTemplateModify, item: IJobTemplate) => (
    <div style={{ width: `${TIME_COLUMN_WIDTH}px` }}>
      <DashboardTableInputField
        id={`${columnKey}_${item.id}`}
        min={1}
        max={1000000}
        type={'integer'}
        value={item[columnKey]}
        onChange={(value: number) => void onTableInputChange(item, columnKey, value)}
        error={errors?.[item.id]?.[columnKey]}
      />
    </div>
  );

  const timeTakenCreateAutomationColumn: ITableColumn<IJobTemplate> = {
    id: 'time_taken_create_automation',
    maxWidth: TIME_COLUMN_WIDTH,
    minWidth: TIME_COLUMN_WIDTH,
    header: t('Time taken to create automation (min)'),
    helpText: t(
      'Time taken to create the automation for the job template. This is used to calculate the total time spent on automation, which includes both the time taken to create the automation and the time taken to execute it.'
    ),
    cell: (item) =>
      activeAwxUser?.is_superuser
        ? tableInputField('time_taken_create_automation_minutes', item)
        : tableCell('time_taken_create_automation_minutes', item, TIME_COLUMN_WIDTH),
  };
  const currencyColumnKeys: Set<keyof IJobTemplate> = new Set([
    'automated_costs',
    'manual_costs',
    'savings',
  ]);
  const tableCell = (
    columnKey: keyof IJobTemplate,
    item: IJobTemplate,
    maxWidth?: number | undefined
  ) => (
    <TdWrapper
      style={{
        maxWidth: maxWidth ?? 'unset',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {currencyColumnKeys.has(columnKey)
        ? currencyFormatter(item[columnKey] as number)
        : item[columnKey]}
    </TdWrapper>
  );

  const tableColumns: ITableColumn<IJobTemplate>[] = [
    {
      id: 'template_name',
      header: t('Template Name'),
      cell: (item) => tableCell('template_name', item, 250),
      defaultSort: true,
      defaultSortDirection: 'asc',
      sort: 'template_name',
      maxWidth: 250,
    },
    {
      id: 'num_job_executions',
      header: t('Number of job executions'),
      cell: (item) => tableCell('runs', item),
      sort: 'runs',
      maxWidth: 190,
      minWidth: 190,
    },
    {
      id: 'time_taken_manually_execute',
      header: t('Time taken to manually execute (min)'),
      maxWidth: TIME_COLUMN_WIDTH,
      minWidth: TIME_COLUMN_WIDTH,
      cell: (item) =>
        activeAwxUser?.is_superuser
          ? tableInputField('time_taken_manually_execute_minutes', item)
          : tableCell('time_taken_manually_execute_minutes', item, TIME_COLUMN_WIDTH),
    },
    ...(costState?.include_template_creation_time_in_costs
      ? [timeTakenCreateAutomationColumn]
      : []),
    {
      id: 'elapsed',
      header: t('Running time'),
      cell: (item) => tableCell('elapsed_str', item),
      sort: 'elapsed',
    },
    {
      id: 'time_savings',
      header: t('Time savings'),
      cell: (item) => tableCell('time_savings_str', item),
      sort: 'time_savings',
    },
    {
      id: 'automated_costs',
      header: t('Automated cost'),
      cell: (item) => tableCell('automated_costs', item),
      sort: 'automated_costs',
    },
    {
      id: 'manual_costs',
      header: t('Manual cost'),
      cell: (item) => tableCell('manual_costs', item),
      sort: 'manual_costs',
    },
    {
      id: 'savings',
      header: t('Savings'),
      cell: (item) => tableCell('savings', item),
      sort: 'savings',
    },
  ];

  const exportButton = (
    <DashboardExportButton
      exportType={'csv'}
      title={t('Export as CSV')}
      icon={ExportIcon}
      isDisabled={loading || !(mainTableView.itemCount ?? 0) || !costState || !filtersValid}
      onExport={exportCsv}
    ></DashboardExportButton>
  );

  return (
    <PageDashboardCard
      id={'ad-main-table-card'}
      title={t('Cost calculation')}
      width="xxl"
      isCompact
      canCollapse={false}
      disableBodyPadding
      style={{ gridColumn: `span ${MAIN_TABLE_FULL_SPAN}` }}
      headerControls={exportButton}
    >
      <CardBody>
        <DashboardTableToolbarRow
          costState={costState}
          setCostState={setCostState}
          refresh={refresh}
        ></DashboardTableToolbarRow>
        <div
          ref={ref}
          style={{ display: 'grid', gap: 16, gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          <DashboardValueCard
            id="cost-manual-automation-card"
            title={t('Cost of manual automation')}
            help={t('Total cost if all jobs were run manually')}
            value={details?.cost_of_manual_automation ?? '-'}
            formatAsCurrency={true}
            error={detailsError}
            errorStateTitle={t('Error loading manual automation cost')}
            width={topCardsWidth}
          ></DashboardValueCard>
          <DashboardValueCard
            id="cost-automated-execution-card"
            title={t('Cost of automated execution')}
            help={t('Total cost of running jobs on AAP')}
            value={details?.cost_of_automated_execution ?? '-'}
            formatAsCurrency={true}
            error={detailsError}
            errorStateTitle={t('Error loading automated execution cost')}
            width={topCardsWidth}
          ></DashboardValueCard>
          <DashboardValueCard
            id="total-savings-card"
            title={t('Total savings/cost avoided')}
            help={t('Difference between manual and automated cost')}
            value={details?.total_saving ?? '-'}
            formatAsCurrency={true}
            error={detailsError}
            errorStateTitle={t('Error loading total savings')}
            width={topCardsWidth}
          ></DashboardValueCard>
          <DashboardValueCard
            id="total-hours-saved-card"
            title={t('Total hours saved/avoided')}
            help={t('Time saved by automation vs manual execution')}
            value={details?.total_time_saving ?? '-'}
            valueSuffix={details?.total_time_saving ? 'h' : undefined}
            error={detailsError}
            errorStateTitle={t('Error loading total hours saved')}
            width={topCardsWidth}
          ></DashboardValueCard>
        </div>
      </CardBody>
      <CardBody>
        <PageTable<IJobTemplate>
          keyFn={(item) => item.id}
          autoHidePagination
          disableBodyPadding
          tableColumns={tableColumns}
          errorStateTitle={t('Error loading data.')}
          compact
          emptyStateTitle={t('No automation data yet')}
          emptyStateDescription={t('Dashboard data will appear after your first automation runs.')}
          disableLastRowBorder
          {...mainTableView}
          filterState={isFilterStateDefault ? undefined : mainTableView.filterState}
        />
      </CardBody>
    </PageDashboardCard>
  );
}
