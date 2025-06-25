/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useManagementJobColumns } from '../hooks/useManagementJobColumns';
import { useManagementJobFilters } from '../hooks/useManagementJobFilters';

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
