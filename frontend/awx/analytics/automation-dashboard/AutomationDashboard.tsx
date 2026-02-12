import { useTranslation } from 'react-i18next';
import {
  IFilterState,
  PageDashboard,
  PageHeader,
  PageLayout,
  PageToolbar,
} from '@ansible/ansible-ui-framework';
import { Button } from '@patternfly/react-core';
import { getItemKey } from '../../../common/crud/Data';
import { useState } from 'react';
import { AutomationDashboardDateRangeFilterPresets } from './constants';
import { useAutomationDashboardToolbar } from './components';

export function AutomationDashboard() {
  const { t } = useTranslation();
  const toolbarFilters = useAutomationDashboardToolbar();
  const [filterState, setFilterState] = useState<IFilterState>({
    period: [AutomationDashboardDateRangeFilterPresets.monthToDate],
  });
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
      <PageDashboard></PageDashboard>
    </PageLayout>
  );
}
