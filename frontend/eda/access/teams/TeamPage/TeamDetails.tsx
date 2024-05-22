import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { DateTimeCell, PageDetail, PageDetails } from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { LastModifiedPageDetail } from '../../../../common/LastModifiedPageDetail';
import { useGetItem } from '../../../../common/crud/useGet';
import { EdaTeam } from '../../../interfaces/EdaTeam';
import { edaAPI } from '../../../common/eda-utils';

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
