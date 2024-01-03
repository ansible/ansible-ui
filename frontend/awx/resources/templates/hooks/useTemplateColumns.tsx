import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnModalOption,
  ColumnTableOption,
  ITableColumn,
  usePageNavigate,
} from '../../../../../framework';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
  useTypeColumn,
  useOrganizationNameColumn,
  useInventoryNameColumn,
  useCredentialsColumn,
  useLastRanColumn,
} from '../../../../common/columns';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { AwxRoute } from '../../../AwxRoutes';
import { SummaryFieldRecentJob } from '../../../interfaces/summary-fields/summary-fields';
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
        item.summary_fields?.recent_jobs && item.summary_fields?.recent_jobs?.length > 0,
      table: ColumnTableOption.Expanded,
      card: 'hidden',
      list: 'hidden',
      modal: ColumnModalOption.Hidden,
    }),
    [t]
  );
  return column;
}

export function useTemplateColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  // TODO: URL should be dependant on template type
  const nameClick = useCallback(
    (template: JobTemplate | WorkflowJobTemplate) => {
      if (template.type === 'job_template') {
        pageNavigate(AwxRoute.JobTemplateDetails, { params: { id: template.id } });
        return;
      }
      pageNavigate(AwxRoute.WorkflowJobTemplateDetails, { params: { id: template.id } });
    },
    [pageNavigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
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
  const organizationColumn = useOrganizationNameColumn(AwxRoute.OrganizationDetails, options);
  const inventoryColumn = useInventoryNameColumn(AwxRoute.InventoryDetails, options);
  const credentialsColumn = useCredentialsColumn();
  const lastRanColumn = useLastRanColumn(options);
  const typeOfTemplate = useTypeColumn<JobTemplate | WorkflowJobTemplate>({
    ...options,
    makeReadable,
  });
  const tableColumns = useMemo<ITableColumn<JobTemplate | WorkflowJobTemplate>[]>(
    () => [
      nameColumn,
      activityColumn,
      descriptionColumn,
      typeOfTemplate,
      createdColumn,
      modifiedColumn,
      organizationColumn,
      inventoryColumn,
      credentialsColumn,
      lastRanColumn,
    ],
    [
      nameColumn,
      activityColumn,
      descriptionColumn,
      typeOfTemplate,
      createdColumn,
      modifiedColumn,
      organizationColumn,
      inventoryColumn,
      credentialsColumn,
      lastRanColumn,
    ]
  );
  return tableColumns;
}
