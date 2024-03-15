/* eslint-disable react/prop-types */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { LoadingState } from '../../../../../framework/components/LoadingState';
import { PageLayout, PageTable, TextCell } from '../../../../../framework';
import { useHubView } from '../../../common/useHubView';
import { useGet } from '../../../../common/crud/useGet';
import { hubAPI } from '../../../common/api/formatPath';
import { HubUser } from '../../../interfaces/expanded/HubUser';

export function UserTeams() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: user } = useGet<HubUser>(params.id ? hubAPI`/_ui/v1/users/${params.id}/` : null);
  const tableColumns = [
    {
      header: t('Name'),
      cell: (team) => <TextCell text={team?.name} />,
      card: 'name',
      list: 'name',
    },
    {
      header: t('Organization'),
      // TODO
      cell: (team) => <TextCell text={team?.name} />,
    },
  ]; // TODO useUserTeamsColumns()
  const view = useHubView<HubControllerToken>({
    // TODO
    url: params.id ? hubAPI`/v1/users/${params.id}/teams` : null,
    tableColumns,
  });

  if (!user) return <LoadingState />;

  console.log('UserTeams', user, view);
  return (
    <PageLayout>
      <PageTable
        tableColumns={tableColumns}
        toolbarActions={[]}
        rowActions={[]}
        errorStateTitle={t('Error loading user teams')}
        emptyStateTitle={t('There are currently no teams added to this user.')}
        emptyStateDescription={t('Add teams by clicking the button below.')}
        emptyStateButtonText={t('Add teams')}
        emptyStateButtonClick={() => console.log('TODO')}
        {...view}
        defaultSubtitle={t('User teams')}
      />
    </PageLayout>
  );
}
