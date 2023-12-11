import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, usePageNavigate } from '../../../../../framework';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
  useTypeColumn,
  useOrganizationNameColumn,
  useInventoryNameColumn,
  useCredentialTypeColumn,
  useLastRanColumn,
} from '../../../../common/columns';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { AwxRoute } from '../../../AwxRoutes';

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
  const modifiedColumn = useModifiedColumn(options);
  const organizationColumn = useOrganizationNameColumn(AwxRoute.OrganizationDetails, options);
  const inventoryColumn = useInventoryNameColumn(AwxRoute.InventoryDetails, options);
  const credentialsColumn = useCredentialTypeColumn(options);
  const lastRanColumn = useLastRanColumn(options);
  const typeOfTemplate = useTypeColumn<JobTemplate | WorkflowJobTemplate>({
    ...options,
    makeReadable,
  });
  const tableColumns = useMemo<ITableColumn<JobTemplate | WorkflowJobTemplate>[]>(
    () => [
      nameColumn,
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
