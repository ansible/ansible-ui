import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DateTimeCell, LabelsCell, PageDetail, PageDetails } from '../../../framework';
import { LastModifiedPageDetail } from '../LastModifiedPageDetail';

export type TeamDetailsType = {
  name: string;
  id: number;
} & Partial<{
  description: string;
  created: string;
  created_at: string;
  created_on: string;
  modified_on: string;
  modified: string;
  modified_at: string;
  summary_fields: {
    organization?: {
      id: number;
      name: string;
      description?: string;
    };
    created_by?: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
    };
    modified_by?: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
    };
    [key: string]: unknown;
  };
}>;

export function TeamDetails<T extends TeamDetailsType>(props: {
  team: T;
  // URL for routing to organization details page
  organizationDetailsUrl?: string;
  // URL for routing to details page for user who created the team
  createdByUserDetailsUrl?: string;
  // URL for routing to details page for user who last modified the team
  modifiedByUserDetailsUrl?: string;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { team, organizationDetailsUrl, createdByUserDetailsUrl, modifiedByUserDetailsUrl } = props;

  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{team.name}</PageDetail>
      {team.description && <PageDetail label={t('Description')}>{team.description}</PageDetail>}
      {team.summary_fields?.organization && (
        <PageDetail label={t('Organization')}>
          {organizationDetailsUrl ? (
            <LabelsCell
              labelsWithLinks={[
                { name: team.summary_fields?.organization?.name, link: organizationDetailsUrl },
              ]}
            />
          ) : (
            <LabelsCell labels={[team.summary_fields?.organization?.name]} />
          )}
        </PageDetail>
      )}
      {(team.created || team.created_on || team.created_at) && (
        <PageDetail label={t('Created')}>
          <DateTimeCell
            author={team.summary_fields?.created_by?.username}
            value={team.created ?? team.created_on ?? team.created_at}
            onClick={
              createdByUserDetailsUrl
                ? () => {
                    navigate(createdByUserDetailsUrl);
                  }
                : undefined
            }
          />
        </PageDetail>
      )}
      {(team.modified || team.modified_on || team.modified_at) && (
        <LastModifiedPageDetail
          author={team.summary_fields?.modified_by?.username}
          value={team.modified ?? team.modified_on ?? team.modified_at}
          onClick={
            modifiedByUserDetailsUrl
              ? () => {
                  navigate(modifiedByUserDetailsUrl);
                }
              : undefined
          }
        />
      )}
    </PageDetails>
  );
}
