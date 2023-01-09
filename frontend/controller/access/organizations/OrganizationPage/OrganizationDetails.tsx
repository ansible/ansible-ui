/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageDetail, PageDetails, SinceCell } from '../../../../../framework';
import { RouteE } from '../../../../Routes';
import { Organization } from '../../../interfaces/Organization';

export function OrganizationDetails(props: { organization: Organization }) {
  const { t } = useTranslation();
  const { organization } = props;
  const history = useNavigate();
  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{organization.name}</PageDetail>
      <PageDetail label={t('Description')}>{organization.description}</PageDetail>
      <PageDetail label={t('Created')}>
        <SinceCell
          value={organization.created}
          author={organization.summary_fields?.created_by?.username}
          onClick={() =>
            history(
              RouteE.UserDetails.replace(
                ':id',
                (organization.summary_fields?.created_by?.id ?? 0).toString()
              )
            )
          }
        />
      </PageDetail>
      <PageDetail label={t('Last modified')}>
        <SinceCell
          value={organization.modified}
          author={organization.summary_fields?.modified_by?.username}
          onClick={() =>
            history(
              RouteE.UserDetails.replace(
                ':id',
                (organization.summary_fields?.modified_by?.id ?? 0).toString()
              )
            )
          }
        />
      </PageDetail>
    </PageDetails>
  );
}
