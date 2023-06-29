import { useNavigate } from 'react-router-dom';
import { RouteObj } from '../../../../Routes';
import { useTranslation } from 'react-i18next';
import { useCallback, useMemo } from 'react';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
  useTypeColumn,
} from '../../../../common/columns';
import { ITableColumn } from '../../../../../framework';

export function useTemplateColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  // TODO: URL should be dependant on template type
  const nameClick = useCallback(
    (template: JobTemplate | WorkflowJobTemplate) => {
      if (template.type === 'job_template') {
        navigate(RouteObj.JobTemplateDetails.replace(':id', template.id.toString()));
        return;
      }
      navigate(RouteObj.WorkflowJobTemplateDetails.replace(':id', template.id.toString()));
    },
    [navigate]
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
  const typeOfTemplate = useTypeColumn<JobTemplate | WorkflowJobTemplate>({
    ...options,
    makeReadable,
  });
  const tableColumns = useMemo<ITableColumn<JobTemplate | WorkflowJobTemplate>[]>(
    () => [nameColumn, descriptionColumn, typeOfTemplate, createdColumn, modifiedColumn],
    [nameColumn, descriptionColumn, typeOfTemplate, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
