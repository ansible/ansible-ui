import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useApplicationsColumns } from '../../../../frontend/awx/administration/applications/hooks/useApplicationsColumns';
import { useApplicationsFilters } from '../../../../frontend/awx/administration/applications/hooks/useApplicationsFilters';
import { PageFormSingleSelectAwxResource } from '../../../../frontend/awx/common/PageFormSingleSelectAwxResource';
import { Application } from '../../../../frontend/awx/interfaces/Application';
import { gatewayV1API } from '../../../api/gateway-api-utils';

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
      url={gatewayV1API`/applications/`}
      tableColumns={applicationColumns}
      toolbarFilters={applicationFilters}
    />
  );
}
