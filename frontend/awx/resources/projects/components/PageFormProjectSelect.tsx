import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { Project } from '../../../interfaces/Project';
import { PageFormSingleSelectAwxResource } from '../../../common/PageFormSingleSelectAwxResource';
import { useProjectsColumns } from '../hooks/useProjectsColumns';
import { useProjectsFilters } from '../hooks/useProjectsFilters';

export function PageFormProjectSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: { readonly name: TFieldName; readonly isRequired?: boolean }) {
  const { t } = useTranslation();

  const tableColumns = useProjectsColumns();
  const toolbarFilters = useProjectsFilters();

  return (
    <PageFormSingleSelectAwxResource<Project, TFieldValues, TFieldName>
      name={props.name}
      tableColumns={tableColumns}
      toolbarFilters={toolbarFilters}
      url={awxAPI`/projects/`}
      id="project-select"
      label={t('Project')}
      placeholder={t('Select project')}
      queryPlaceholder={t('Loading projects...')}
      queryErrorText={t('Error loading projects')}
      isRequired={props.isRequired}
    />
  );
}
