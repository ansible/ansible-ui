/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageDetail, PageDetails, SinceCell, TextCell } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { Credential } from '../../../interfaces/Credential';

export function CredentialDetails(props: { credential: Credential }) {
  const { t } = useTranslation();
  const { credential } = props;
  const history = useNavigate();
  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{credential.name}</PageDetail>
      <PageDetail label={t('Description')}>{credential.description}</PageDetail>
      <PageDetail label={t('Organization')}>
        <TextCell
          text={credential.summary_fields?.organization?.name}
          to={RouteObj.OrganizationDetails.replace(
            ':id',
            (credential.summary_fields?.organization?.id ?? '').toString()
          )}
        />
      </PageDetail>
      <PageDetail label={t('Credential type')}>
        <TextCell
          text={credential.summary_fields?.credential_type?.name}
          to={RouteObj.CredentialTypeDetails.replace(
            ':id',
            (credential.summary_fields?.credential_type?.id ?? '').toString()
          )}
        />
      </PageDetail>
      <PageDetail label={t('Created')}>
        <SinceCell
          value={credential.created}
          author={credential.summary_fields?.created_by?.username}
          onClick={() =>
            history(
              RouteObj.UserDetails.replace(
                ':id',
                (credential.summary_fields?.created_by?.id ?? 0).toString()
              )
            )
          }
        />
      </PageDetail>
      <PageDetail label={t('Last modified')}>
        <SinceCell
          value={credential.modified}
          author={credential.summary_fields?.modified_by?.username}
          onClick={() =>
            history(
              RouteObj.UserDetails.replace(
                ':id',
                (credential.summary_fields?.modified_by?.id ?? 0).toString()
              )
            )
          }
        />
      </PageDetail>
    </PageDetails>
  );
}
