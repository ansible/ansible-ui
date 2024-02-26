import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { CopyCell, DateTimeCell, PageDetail, PageDetails } from '../../../../../framework';
import { useGetItem } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { Application } from '../../../interfaces/Application';

export function ApplicationPageDetails() {
  const params = useParams<{ id: string }>();
  const { data: application } = useGetItem<Application>(awxAPI`/applications/`, params.id);
  return application ? <ApplicationDetailInner application={application} /> : null;
}

export function ApplicationDetailInner(props: { application: Application }) {
  const { t } = useTranslation();

  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{props.application.name}</PageDetail>
      <PageDetail label={t('Description')}>{props.application.description}</PageDetail>
      <PageDetail label={t('Organization')}>
        {props.application.summary_fields.organization.name}
      </PageDetail>
      <PageDetail label={t('Authorization Grant Type')}>
        {props.application.authorization_grant_type}
      </PageDetail>
      <PageDetail label={t('Client ID')}>
        <CopyCell text={props.application.client_id} />
      </PageDetail>
      <PageDetail label={t('Redirect URIs')}>{props.application.redirect_uris}</PageDetail>
      <PageDetail label={t('Client Type')}>{props.application.client_type}</PageDetail>
      <PageDetail label={t('Created')}>
        <DateTimeCell value={props.application.created} />
      </PageDetail>
      <PageDetail label={t('Last modified')}>
        <DateTimeCell value={props.application.modified} />
      </PageDetail>
    </PageDetails>
  );
}
