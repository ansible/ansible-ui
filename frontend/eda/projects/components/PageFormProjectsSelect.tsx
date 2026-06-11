import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormSingleSelectEdaResource } from '../../common/PageFormSingleSelectEdaResource';

import { edaAPI } from '../../common/eda-utils';
import { useProjectColumns } from '../hooks/useProjectColumns';
import { useProjectFilters } from '../hooks/useProjectFilters';
import { EdaProject } from '../../interfaces/EdaProject';

/**
 * A form input for selecting an rulebook.
 *
 * @example
 * ```tsx
 * <PageFormSelectProject<Credential> name="rulebook" />
 * ```
 */
export function PageFormProjectSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TFieldName;
  isRequired?: boolean;
  isDisabled?: string;
  helperText?: string;
  projectId?: string;
}) {
  const { t } = useTranslation();
  const projectColumns = useProjectColumns();
  const projectFilters = useProjectFilters();
  return (
    <PageFormSingleSelectEdaResource<EdaProject, TFieldValues, TFieldName>
      name={props.name}
      id="project_id"
      label={t('Project')}
      placeholder={t('Select project')}
      queryPlaceholder={t('Loading projects...')}
      queryErrorText={t('Error loading projects')}
      isRequired={props.isRequired}
      isDisabled={props.isDisabled}
      helperText={props.helperText}
      url={edaAPI`/projects/`}
      tableColumns={projectColumns}
      toolbarFilters={projectFilters}
    />
  );
}
