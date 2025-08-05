import { CopyCell, DateTimeCell, PageDetail, PageDetails } from '@ansible/ansible-ui-framework';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { gatewayAPI } from '../../utils/gateway-api-utils';

export function OAuthApplicationDetails() {
  const params = useParams<{ applicationId: string }>();
  const { data: application } = useGetItem<Application>(
    gatewayAPI`/applications/`,
    params.applicationId
  );
  return application ? <ApplicationDetailInner application={application} /> : null;
}

export function ApplicationDetailInner(props: { application: Application }) {
  const { t } = useTranslation();

  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{props.application.name}</PageDetail>
      <PageDetail label={t('Organization')}>
        {props.application.summary_fields.organization?.name}
      </PageDetail>
      <PageDetail label={t('URL')} fullWidth>
        {props.application.app_url}
      </PageDetail>
      <PageDetail label={t('Description')} fullWidth>
        {props.application.description}
      </PageDetail>
      <PageDetail label={t('Authorization Grant Type')}>
        {props.application.authorization_grant_type}
      </PageDetail>
      <PageDetail label={t('Client Type')}>{props.application.client_type}</PageDetail>
      <PageDetail label={t('Client ID')} fullWidth>
        <CopyCell text={props.application.client_id} />
      </PageDetail>
      <PageDetail label={t('Redirect URIs')} fullWidth>
        {props.application.redirect_uris}
      </PageDetail>
      <PageDetail label={t('Created')}>
        <DateTimeCell value={props.application.created} />
      </PageDetail>
      <PageDetail label={t('Last modified')}>
        <DateTimeCell value={props.application.modified} />
      </PageDetail>
    </PageDetails>
  );
}
