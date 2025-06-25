import { DateTimeCell, PageDetail, PageDetails } from '@ansible/ansible-ui-framework';
import { LoadingPage } from '@ansible/ansible-ui-framework/components/LoadingPage';
import { LastModifiedPageDetail } from '@ansible/common-ui/LastModifiedPageDetail';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { edaAPI } from '../../../common/eda-utils';
import { EdaTeam } from '../../../interfaces/EdaTeam';

export function TeamDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: team } = useGetItem<EdaTeam>(edaAPI`/teams/`, params.id);

  if (!team) {
    return <LoadingPage />;
  }

  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{team.name}</PageDetail>
      <PageDetail label={t('Description')}>{team.description}</PageDetail>
      <PageDetail label={t('Created')}>
        <DateTimeCell value={team.created} />
      </PageDetail>
      <LastModifiedPageDetail value={team.modified} />
    </PageDetails>
  );
}
