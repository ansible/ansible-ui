/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  DateTimeCell,
  PageDetail,
  PageDetails,
  TextCell,
  useGetPageUrl,
} from '../../../../../framework';
import { AwxRoute } from '../../../AwxRoutes';
import { Team } from '../../../interfaces/Team';

export function TeamDetails(props: { team: Team }) {
  const { t } = useTranslation();
  const { team } = props;
  const history = useNavigate();
  const getPageUrl = useGetPageUrl();

  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{team.name}</PageDetail>
      <PageDetail label={t('Description')}>{team.description}</PageDetail>
      <PageDetail label={t('Organization')}>
        <TextCell
          text={team.summary_fields?.organization?.name}
          to={getPageUrl(AwxRoute.OrganizationDetails, {
            params: { id: (team.summary_fields?.organization?.id ?? '').toString() },
          })}
        />
      </PageDetail>
      <PageDetail label={t('Created')}>
        <DateTimeCell
          format="since"
          value={team.created}
          author={team.summary_fields?.created_by?.username}
          onClick={() =>
            history(
              getPageUrl(AwxRoute.UserDetails, {
                params: { id: (team.summary_fields?.created_by?.id ?? 0).toString() },
              })
            )
          }
        />
      </PageDetail>
      <PageDetail label={t('Last modified')}>
        <DateTimeCell
          format="since"
          value={team.modified}
          author={team.summary_fields?.modified_by?.username}
          onClick={() =>
            history(
              getPageUrl(AwxRoute.UserDetails, {
                params: {
                  id: (team.summary_fields?.modified_by?.id ?? 0).toString(),
                },
              })
            )
          }
        />
      </PageDetail>
    </PageDetails>
  );
}
