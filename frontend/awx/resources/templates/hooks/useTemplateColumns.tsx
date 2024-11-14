import {
  ColumnModalOption,
  ColumnTableOption,
  ITableColumn,
  TextCell,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import {
  useCreatedColumn,
  useCredentialsColumn,
  useDescriptionColumn,
  useExecutionEnvColumn,
  useInventoryNameColumn,
  useLabelsColumn,
  useLastRanColumn,
  useModifiedColumn,
  useOrganizationNameColumn,
  useProjectNameColumn,
  useTypeColumn,
} from '@ansible/common-ui/columns';
import { Split } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { SummaryFieldRecentJob } from '../../../interfaces/summary-fields/summary-fields';
import { AwxRoute } from '../../../main/AwxRoutes';
import { Sparkline } from '../components/Sparkline';

function useActivityColumn() {
  const { t } = useTranslation();
  const column: ITableColumn<{
    summary_fields?: { recent_jobs?: SummaryFieldRecentJob[] | undefined };
  }> = useMemo(
    () => ({
      header: t('Activity'),
      cell: (item) => <Sparkline jobs={item.summary_fields?.recent_jobs} />,
      value: (item) =>
        item.summary_fields?.recent_jobs?.length
          ? item.summary_fields?.recent_jobs.length
          : undefined,
      table: ColumnTableOption.expanded,
      card: 'hidden',
      list: 'hidden',
      modal: ColumnModalOption.hidden,
    }),
    [t]
  );
  return column;
}

export function useTemplateColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const makeReadable: (template: JobTemplate | WorkflowJobTemplate) => string = (template) => {
    if (template.type === 'workflow_job_template') {
      return t('Workflow job template');
    }
    return t('Job template');
  };
  const createdColumn = useCreatedColumn(options);
  const descriptionColumn = useDescriptionColumn();
  const activityColumn = useActivityColumn();
  const modifiedColumn = useModifiedColumn(options);
  const organizationColumnDefault = useOrganizationNameColumn(
    AwxRoute.OrganizationDetails,
    options
  );
  const organizationColumn = useMemo<ITableColumn<JobTemplate | WorkflowJobTemplate>>(
    () => ({
      ...organizationColumnDefault,
      card: 'hidden',
      list: 'hidden',
    }),
    [organizationColumnDefault]
  );
  const inventoryColumn = useInventoryNameColumn(AwxRoute.InventoryDetails, options);
  const projectColumn = useProjectNameColumn(AwxRoute.ProjectDetails, options);
  const credentialsColumn = useCredentialsColumn();
  const labelsColumn = useLabelsColumn();
  const executionEnvColumn = useExecutionEnvColumn(AwxRoute.ExecutionEnvironments, options);

  const lastRanColumn = useLastRanColumn(options);
  const typeOfTemplate = useTypeColumn<JobTemplate | WorkflowJobTemplate>({
    ...options,
    makeReadable,
  });

  const tableColumns = useMemo<ITableColumn<JobTemplate | WorkflowJobTemplate>[]>(
    () => [
      {
        header: t('Name'),
        cell: (template: JobTemplate | WorkflowJobTemplate) => (
          <Split hasGutter>
            <TextCell
              text={template.name}
              to={getPageUrl(
                template.type === 'job_template'
                  ? AwxRoute.JobTemplateDetails
                  : AwxRoute.WorkflowJobTemplateDetails,
                { params: { id: template.id } }
              )}
            />
          </Split>
        ),
        card: 'name',
        list: 'name',
        sort: 'name',
      },
      activityColumn,
      descriptionColumn,
      typeOfTemplate,
      labelsColumn,
      organizationColumn,
      inventoryColumn,
      executionEnvColumn,
      projectColumn,
      credentialsColumn,
      lastRanColumn,
      createdColumn,
      modifiedColumn,
    ],
    [
      getPageUrl,
      t,
      activityColumn,
      descriptionColumn,
      typeOfTemplate,
      createdColumn,
      modifiedColumn,
      organizationColumn,
      inventoryColumn,
      executionEnvColumn,
      projectColumn,
      credentialsColumn,
      labelsColumn,
      lastRanColumn,
    ]
  );
  return tableColumns;
}
