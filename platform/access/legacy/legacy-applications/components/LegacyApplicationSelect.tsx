import { useApplicationsColumns } from '@ansible/awx-ui/administration/applications/hooks/useApplicationsColumns';
import { useApplicationsFilters } from '@ansible/awx-ui/administration/applications/hooks/useApplicationsFilters';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { PageFormSingleSelectAwxResource } from '@ansible/awx-ui/common/PageFormSingleSelectAwxResource';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export function LegacyApplicationSelect<
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
      label={t('Legacy application')}
      placeholder={t('Select legacy application')}
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
