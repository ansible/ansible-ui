/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DateTimeCell, PageDetail, PageDetails, TextCell } from '../../../../../framework';
import { RouteObj } from '../../../../common/Routes';
import { Team } from '../../../interfaces/Team';

export function TeamDetails(props: { team: Team; disablePadding?: boolean }) {
  const { t } = useTranslation();
  const { team } = props;
  const history = useNavigate();
  return (
    <PageDetails disablePadding={props.disablePadding}>
      <PageDetail label={t('Name')} isEmpty={!team.name}>
        {team.name}
      </PageDetail>
      <PageDetail label={t('Description')} isEmpty={!team.description}>
        {team.description}
      </PageDetail>
      <PageDetail label={t('Organization')} isEmpty={!team.summary_fields?.organization?.name}>
        <TextCell
          text={team.summary_fields?.organization?.name}
          to={RouteObj.OrganizationDetails.replace(
            ':id',
            (team.summary_fields?.organization?.id ?? '').toString()
          )}
        />
      </PageDetail>
      <PageDetail label={t('Created')} isEmpty={!team.created}>
        <DateTimeCell
          format="since"
          value={team.created}
          author={team.summary_fields?.created_by?.username}
          onClick={() =>
            history(
              RouteObj.UserDetails.replace(
                ':id',
                (team.summary_fields?.created_by?.id ?? 0).toString()
              )
            )
          }
        />
      </PageDetail>
      <PageDetail label={t('Last modified')} isEmpty={!team.modified}>
        <DateTimeCell
          format="since"
          value={team.modified}
          author={team.summary_fields?.modified_by?.username}
          onClick={() =>
            history(
              RouteObj.UserDetails.replace(
                ':id',
                (team.summary_fields?.modified_by?.id ?? 0).toString()
              )
            )
          }
        />
      </PageDetail>
    </PageDetails>
  );
}
