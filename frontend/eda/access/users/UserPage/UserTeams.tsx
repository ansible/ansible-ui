/* eslint-disable react/prop-types */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { LoadingState } from '../../../../../framework/components/LoadingState';
import { PageLayout, PageTable, TextCell } from '../../../../../framework';
import { useEdaView } from '../../../common/useEventDrivenView';
import { useGet } from '../../../../common/crud/useGet';
import { edaAPI } from '../../../common/eda-utils';
import { EdaUser } from '../../../interfaces/EdaUser';

export function UserTeams() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: user } = useGet<EdaUser>(params.id ? edaAPI`/users/${params.id}/` : null);
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
  const view = useEdaView<EdaControllerToken>({
    // TODO api
    url: params.id ? edaAPI`/v1/users/${params.id}/teams` : null,
    tableColumns,
  });
  const toolbarActions = []; // TODO useUserTeamsActions(view)
  const rowActions = []; // TODO useUserTeamActions(view)

  if (!user) return <LoadingState />;

  console.log('UserTeams', user, view);
  return (
    <PageLayout>
      <PageTable
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
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
