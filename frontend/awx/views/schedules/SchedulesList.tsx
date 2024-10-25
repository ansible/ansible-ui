import { ButtonVariant } from '@patternfly/react-core';
import { CubesIcon, ExclamationTriangleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useParams } from 'react-router-dom';
import { PageTable, useGetPageUrl } from '../../../../framework';
import { PageTableEmptyState } from '../../../../framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '../../../../framework/components/ButtonLink';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import { useOptions } from '../../../common/crud/useOptions';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxView } from '../../common/useAwxView';
import { JobTemplate } from '../../interfaces/JobTemplate';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { Schedule } from '../../interfaces/Schedule';
import { missingResources } from '../../resources/templates/hooks/useTemplateColumns';
import { useSchedulesActions } from './hooks/useSchedulesActions';
import { useSchedulesColumns } from './hooks/useSchedulesColumns';
import { useSchedulesFilter } from './hooks/useSchedulesFilter';
import { useScheduleToolbarActions } from './hooks/useSchedulesToolbarActions';

/**
 * @param {string} createSchedulePageId -  param used to build the create schedule url.
 * @param {string} [sublistEndPoint] - Optional - This is pertinent to only schedules list within a resource
 * - awxAPI/job_templates/:id/schedules
 * - awxAPI/workflow_job_templates/:id/schedules
 * - awxAPI/projects/:id/schedules
 * - awxAPI/inventory_sources/id/schedules
 * - awxAPI/system_job_templates/:id/schedules
 * @param {string} [resourceType] - Optional - This param is used to help persist filters.
 * The only resources that ca have a schedule are:
 * - Job Templates
 * - Workflow Job Templates
 * - Projects
 * - Inventory Sources - Only regular inventory can have an inventory source
 * - Management Jobs aka System Job Templates
 * @param {string} [url] - Optional - If this param exists it will always be awxAPI/schedules/
 * */

export function SchedulesList(props: {
  createSchedulePageId: string;
  sublistEndpoint?: string;
  url?: string;
  resourceType?: string;
}) {
  const { t } = useTranslation();
  const pageUrl = useGetPageUrl();
  const params = useParams<{ inventory_type?: string; id?: string; source_id?: string }>();
  const resourceId = params.source_id ?? params.id;

  const compParams = useOutletContext<{ template: JobTemplate }>();
  const isMissingResource: boolean = compParams?.template
    ? missingResources(compParams?.template)
    : false;

  const apiEndPoint: string | undefined = props.sublistEndpoint
    ? `${props.sublistEndpoint}/${resourceId}/schedules/`
    : undefined;

  const toolbarFilters = useSchedulesFilter({
    url: props.url ? props.url : apiEndPoint,
  });
  const tableColumns = useSchedulesColumns();
  const view = useAwxView<Schedule>({
    url: apiEndPoint ?? awxAPI`/schedules/`,
    toolbarFilters,
    tableColumns,
  });
  usePersistentFilters(props.resourceType ? `${props.resourceType}-schedules` : 'schedules');

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(apiEndPoint ?? awxAPI`/schedules/`);
  const canCreateSchedule = Boolean(data && data.actions && data.actions['POST']);

  const toolbarActions = useScheduleToolbarActions(
    view.unselectItemsAndRefresh,
    pageUrl(props.createSchedulePageId, { params }),
    isMissingResource
  );
  const rowActions = useSchedulesActions({
    onScheduleDeleteCompleted: view.unselectItemsAndRefresh,
    onScheduleToggleCompleted: view.updateItem,
    sublistEndpoint: apiEndPoint,
  });

  let emptyStateTitle = '';
  let emptyStateDescription = '';

  if (isMissingResource) {
    emptyStateTitle = t('Resources are missing from this template.');
  } else if (canCreateSchedule) {
    emptyStateTitle = t('No schedules yet');
    emptyStateDescription = t('Please create a schedule by using the button below.');
  } else {
    emptyStateTitle = t('You do not have permission to create a schedule');
    emptyStateDescription = t(
      'Please contact your organization administrator if there is an issue with your access.'
    );
  }
  return (
    <PageTable<Schedule>
      id="awx-schedules-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading schedules')}
      emptyState={
        canCreateSchedule ? (
          <PageTableEmptyState
            title={emptyStateTitle}
            description={emptyStateDescription}
            icon={isMissingResource ? ExclamationTriangleIcon : undefined}
          >
            {!isMissingResource && (
              <ButtonLink
                icon={<PlusCircleIcon />}
                variant={ButtonVariant.primary}
                href={pageUrl(props.createSchedulePageId, { params })}
              >
                {t('Create schedule')}
              </ButtonLink>
            )}
          </PageTableEmptyState>
        ) : (
          <PageTableEmptyState
            icon={CubesIcon}
            title={emptyStateTitle}
            description={emptyStateDescription}
          />
        )
      }
      {...view}
    />
  );
}
