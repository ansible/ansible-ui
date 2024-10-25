/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageTable, useGetPageUrl } from '../../../../../framework';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useManagementJobFilters } from '../hooks/useManagementJobFilters';
import { useManagementJobColumns } from '../hooks/useManagementJobColumns';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { PageTableEmptyState } from '../../../../../framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '../../../../../framework/components/ButtonLink';
import { ButtonVariant } from '@patternfly/react-core';

export function ManagementJobSchedules() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const toolbarFilters = useManagementJobFilters();
  const tableColumns = useManagementJobColumns();
  const view = useAwxView<SystemJobTemplate>({
    url: awxAPI`/system_job_templates/${params.id ?? ''}/schedules/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });

  return (
    <PageTable<SystemJobTemplate>
      id="awx-schedules-table"
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      errorStateTitle={t('Error loading schedules')}
      emptyState={
        <PageTableEmptyState
          title={t('No schedules yet')}
          description={t('To get started, create a schedule.')}
        >
          <ButtonLink
            icon={<PlusCircleIcon />}
            variant={ButtonVariant.primary}
            href={getPageUrl(AwxRoute.CreateSchedule)}
          >
            {t('Create schedule')}
          </ButtonLink>
        </PageTableEmptyState>
      }
      {...view}
    />
  );
}
