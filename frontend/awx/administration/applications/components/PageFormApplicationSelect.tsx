import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormSingleSelectAwxResource } from '../../../common/PageFormSingleSelectAwxResource';
import { awxAPI } from '../../../common/api/awx-utils';
import { useApplicationsColumns } from '../hooks/useApplicationsColumns';
import { useApplicationsFilters } from '../hooks/useApplicationsFilters';
import { Application } from '../../../interfaces/Application';

export function PageFormApplicationSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: { name: TFieldName; isRequired?: boolean; isDisabled?: string; helperText?: string }) {
  const { t } = useTranslation();
  const applicationColumns = useApplicationsColumns({ disableLinks: true });
  const applicationFilters = useApplicationsFilters();
  return (
    <PageFormSingleSelectAwxResource<Application, TFieldValues, TFieldName>
      name={props.name}
      id="application"
      label={t('Application')}
      placeholder={t('Select application')}
      queryPlaceholder={t('Loading applications...')}
      queryErrorText={t('Error loading applications')}
      isRequired={props.isRequired}
      isDisabled={props.isDisabled}
      helperText={props.helperText}
      url={awxAPI`/applications/`}
      tableColumns={applicationColumns}
      toolbarFilters={applicationFilters}
    />
  );
}
