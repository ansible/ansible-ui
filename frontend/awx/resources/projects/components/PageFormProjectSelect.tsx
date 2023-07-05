import { useCallback } from 'react';
import { FieldPath, FieldPathValue, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ItemsResponse, requestGet } from '../../../../common/crud/Data';
import { Project } from '../../../interfaces/Project';
import { useSelectProject } from '../hooks/useSelectProject';
import { PageFormAsyncSelect } from '../../../../../framework/PageForm/Inputs/PageFormAsyncSelect';

export function PageFormProjectSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: { name: TFieldName; isRequired?: boolean; project?: string; projectPath?: string }) {
  const { t } = useTranslation();

  const openSelectDialog = useSelectProject();
  const query = useCallback(async () => {
    const response = await requestGet<ItemsResponse<Project>>('/api/v2/projects/?page_size=200');
    return Promise.resolve({
      total: response.count,
      values: response.results as FieldPathValue<TFieldValues, Path<TFieldValues>>[],
    });
  }, []);

  return (
    <PageFormAsyncSelect<TFieldValues, TFieldName>
      name={props.name}
      label={t('Project')}
      query={query}
      valueToString={(value) => {
        if (value && typeof value === 'string') {
          return value;
        }
        return (value as Project)?.name ?? '';
      }}
      placeholder={t('Select project')}
      loadingPlaceholder={t('Loading projects...')}
      loadingErrorText={t('Error loading projects')}
      isRequired={props.isRequired}
      limit={200}
      openSelectDialog={openSelectDialog}
    />
  );
}
