import { useApplicationsColumns } from '@ansible/awx-ui/administration/applications/hooks/useApplicationsColumns';
import { useApplicationsFilters } from '@ansible/awx-ui/administration/applications/hooks/useApplicationsFilters';
import { PageFormSingleSelectAwxResource } from '@ansible/awx-ui/common/PageFormSingleSelectAwxResource';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

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
      label={t('OAuth application')}
      placeholder={t('Select OAuth application')}
      queryPlaceholder={t('Loading applications...')}
      queryErrorText={t('Error loading applications')}
      isRequired={props.isRequired}
      isDisabled={props.isDisabled}
      helperText={props.helperText}
      url={gatewayAPI`/applications/`}
      tableColumns={applicationColumns}
      toolbarFilters={applicationFilters}
    />
  );
}
