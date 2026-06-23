import { CopyCell, DateTimeCell, PageDetail, PageDetails } from '@ansible/ansible-ui-framework';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { gatewayAPI } from '../../utils/gateway-api-utils';

interface FieldChoice {
  value: string;
  display_name: string;
}

interface ApplicationFieldMeta {
  type: string;
  choices?: FieldChoice[];
}

interface ApplicationOptionsResponse {
  actions?: {
    POST?: Record<string, ApplicationFieldMeta>;
  };
}

function getChoiceLabel(choices: FieldChoice[] | undefined, value: string | undefined): string {
  return choices?.find((c) => c.value === (value ?? ''))?.display_name ?? value ?? '';
}

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
  const { data: options } = useOptions<ApplicationOptionsResponse>(gatewayAPI`/applications/`);
  const fields = options?.actions?.POST;

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
        {getChoiceLabel(
          fields?.authorization_grant_type?.choices,
          props.application.authorization_grant_type
        )}
      </PageDetail>
      <PageDetail label={t('Client Type')}>
        {getChoiceLabel(fields?.client_type?.choices, props.application.client_type)}
      </PageDetail>
      <PageDetail label={t('Algorithm')}>
        {getChoiceLabel(fields?.algorithm?.choices, props.application.algorithm)}
      </PageDetail>
      <PageDetail label={t('Skip Authorization')}>
        {props.application.skip_authorization ? t('Yes') : t('No')}
      </PageDetail>
      <PageDetail label={t('Client ID')} fullWidth>
        <CopyCell text={props.application.client_id} />
      </PageDetail>
      <PageDetail label={t('Redirect URIs')} fullWidth>
        {props.application.redirect_uris}
      </PageDetail>
      <PageDetail label={t('Post Logout Redirect URIs')} fullWidth>
        {props.application.post_logout_redirect_uris}
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
