import { useTranslation } from 'react-i18next';
import {
  IFilterState,
  PageDashboard,
  PageHeader,
  PageLayout,
  PageToolbar,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { Button } from '@patternfly/react-core';
import { getItemKey } from '../../../common/crud/Data';
import { useState } from 'react';
import { AutomationDashboardDateRangeFilterPresets } from './constants';
import { useAutomationDashboardToolbar } from './components';
import { AwxRoute } from '../../main/AwxRoutes';
import { DashboardValueCard } from './components';

export function AutomationDashboard() {
  const { t } = useTranslation();
  const toolbarFilters = useAutomationDashboardToolbar();
  const [filterState, setFilterState] = useState<IFilterState>({
    period: [AutomationDashboardDateRangeFilterPresets.monthToDate],
  });
  const getPageUrl = useGetPageUrl();

  const description = t(
    'Discover the significant cost and time savings achieved by automating Ansible jobs with the Ansible Automation Platform. Explore how automation reduces manual effort, enhances efficiency, and optimizes IT operations across your organization.'
  );

  const downloadPdf = () => {};

  return (
    <PageLayout>
      <PageHeader
        title={t('Automation Dashboard')}
        titleHelpTitle={t('Automation Dashboard')}
        titleHelp={description}
        description={description}
        controls={
          <Button variant="secondary" onClick={downloadPdf}>
            {t('Save as PDF')}
          </Button>
        }
      />
      <PageToolbar
        keyFn={getItemKey}
        itemCount={0}
        toolbarFilters={toolbarFilters}
        setFilterState={setFilterState}
        filterState={filterState}
        disableCardView
        disableListView
        disableTableView
      />
      <PageDashboard>
        <DashboardValueCard
          id="successful-jobs-card"
          title={t('Total number of successful jobs')}
          help={t('This indicates the number of automation jobs that were completed successfully.')}
          linkText={t('See all successful jobs in AAP')}
          to={getPageUrl(AwxRoute.Jobs) + '?status=successful'}
          value={15}
        ></DashboardValueCard>
        <DashboardValueCard
          id="failed-jobs-card"
          title={t('Total number of failed jobs')}
          help={t('This indicates the number of automation jobs that were completed successfully.')}
          linkText={t('See all failed jobs in AAP')}
          to={getPageUrl(AwxRoute.Jobs) + '?status=failed'}
          value={5}
        ></DashboardValueCard>
        <DashboardValueCard
          id="unique-hosts-card"
          title={t('Total number of unique hosts automated')}
          help={t('This is the number of Controller inventory records you have automated.')}
          value={2}
        ></DashboardValueCard>
        <DashboardValueCard
          id="automation-hours-card"
          title={t('Total hours of automation')}
          help={t(
            'This represents the cumulative time that Ansible Automation Platform spent executing jobs.'
          )}
          value={2}
          valueSuffix="h"
        ></DashboardValueCard>
      </PageDashboard>
    </PageLayout>
  );
}
