import { PageHeader, PageLayout, PageTable } from '../../../../framework';

import {
  Divider,
  PageSection,
  Stack,
  Title,
  TitleSizes,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { TachometerAltIcon } from '@patternfly/react-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { JobsChart } from '../../dashboard/charts/JobsChart';
import { UnifiedJob } from '../../interfaces/UnifiedJob';
import { useControllerView } from '../../useControllerView';
import { useJobRowActions } from './hooks/useJobRowActions';
import { useJobsColumns } from './hooks/useJobsColumns';
import { useJobsFilters } from './hooks/useJobsFilters';
import { useJobToolbarActions } from './hooks/useJobToolbarActions';

export default function Jobs() {
  const { t } = useTranslation();
  const toolbarFilters = useJobsFilters();
  const tableColumns = useJobsColumns();
  const view = useControllerView<UnifiedJob>({
    url: '/api/v2/unified_jobs/',
    queryParams: {
      not__launch_type: 'sync',
    },
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useJobToolbarActions(view.unselectItemsAndRefresh);
  const rowActions = useJobRowActions(view.unselectItemsAndRefresh);

  const [showGraph, setShowGraph] = useState(true);

  return (
    <PageLayout>
      <PageHeader
        title={t('Jobs')}
        titleHelpTitle={t('Jobs')}
        titleHelp={t('jobs.title.help')}
        titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/jobs.html"
        description={t('jobs.title.description')}
        headerActions={
          <ToggleGroup aria-label="Icon variant toggle group">
            <ToggleGroupItem
              icon={<TachometerAltIcon />}
              aria-label="copy"
              buttonId="toggle-group-icons-1"
              isSelected={showGraph}
              onChange={() => setShowGraph((show) => !show)}
            />
          </ToggleGroup>
        }
      />
      {showGraph && (
        <>
          <PageSection variant="light">
            <Stack hasGutter>
              <Title headingLevel="h2" size={TitleSizes['lg']}>
                {t('Job runs in the last 30 days')}
              </Title>
              <JobsChart height={250} />
            </Stack>
          </PageSection>
          <Divider />
        </>
      )}
      <PageTable
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading jobs')}
        emptyStateTitle={t('No jobs yet')}
        emptyStateDescription={t('Please run a job to populate this list.')}
        {...view}
      />
    </PageLayout>
  );
}
