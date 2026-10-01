import { useApplicationsColumns } from '@ansible/awx-ui/administration/applications/hooks/useApplicationsColumns';
import { useApplicationsFilters } from '@ansible/awx-ui/administration/applications/hooks/useApplicationsFilters';
import {
  createApplicationListQueryErrorText,
  oauthApplicationListForbiddenMessage,
} from '@ansible/awx-ui/administration/applications/applicationListAccess';
import { useApplicationListAccess } from '@ansible/awx-ui/administration/applications/hooks/useApplicationListAccess';
import { PageFormSingleSelectAwxResource } from '@ansible/awx-ui/common/PageFormSingleSelectAwxResource';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { FieldPath, FieldValues } from 'react-hook-form';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

export function OAuthApplicationSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: Readonly<{
    name: TFieldName;
    isRequired?: boolean;
    isDisabled?: string;
    helperText?: string;
  }>
) {
  const { t } = useTranslation();
  const applicationColumns = useApplicationsColumns({ disableLinks: true });
  const applicationFilters = useApplicationsFilters();
  const applicationsUrl = gatewayAPI`/applications/`;
  const { canList } = useApplicationListAccess(applicationsUrl);
  const forbiddenMessage = oauthApplicationListForbiddenMessage(t);
  const queryErrorText = useMemo(
    () => createApplicationListQueryErrorText(t, forbiddenMessage),
    [forbiddenMessage, t]
  );
  const listForbidden = canList === false;
  const isDisabled = props.isDisabled ?? (listForbidden ? forbiddenMessage : undefined);
  const helperText = props.helperText ?? (listForbidden ? forbiddenMessage : undefined);

  return (
    <PageFormSingleSelectAwxResource<Application, TFieldValues, TFieldName>
      name={props.name}
      id="application"
      label={t('OAuth application')}
      placeholder={t('Select OAuth application')}
      queryPlaceholder={t('Loading applications...')}
      queryErrorText={queryErrorText}
      noResultsMessage={t('No options currently available.')}
      isRequired={props.isRequired}
      isDisabled={isDisabled}
      helperText={helperText}
      enableBrowse={!listForbidden}
      url={applicationsUrl}
      tableColumns={applicationColumns}
      toolbarFilters={applicationFilters}
    />
  );
}
