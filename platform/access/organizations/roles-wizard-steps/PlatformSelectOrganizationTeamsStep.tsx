import { useTranslation } from 'react-i18next';
import { Text, TextContent, TextVariants } from '@patternfly/react-core';
import { ITableColumn, IToolbarFilter, LoadingPage, TextCell } from '../../../../framework';
import { useMemo } from 'react';
import { usePlatformMultiSelectListView } from '../../../common/usePlatformMultiSelectListView';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { useParams } from 'react-router-dom';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { PageMultiSelectList } from '../../../../framework/PageTable/PageMultiSelectList';
import { useNameToolbarFilter } from '../../../../frontend/awx/common/awx-toolbar-filters';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';

export function PlatformSelectOrganizationTeamsStep() {
  const { t } = useTranslation();
  const nameToolbarFilter = useNameToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(() => [nameToolbarFilter], [nameToolbarFilter]);
  const tableColumns: ITableColumn<PlatformTeam>[] = useMemo(() => {
    return [
      {
        header: t('Name'),
        cell: (team: PlatformTeam) => <TextCell text={team.name} />,
        card: 'name',
        list: 'name',
        sort: 'name',
        maxWidth: 200,
      },
    ];
  }, [t]);

  const params = useParams<{ id: string }>();
  const { data: organization, isLoading } = useGet<PlatformOrganization>(
    gatewayV1API`/organizations/${params.id || ''}/`
  );

  const view = usePlatformMultiSelectListView<PlatformTeam>(
    {
      url: gatewayV1API`/organizations/${params.id || ''}/teams/`,
      toolbarFilters,
      tableColumns,
    },
    'teams'
  );
  if (isLoading || !organization) return <LoadingPage />;

  return (
    <>
      <TextContent>
        <Text component={TextVariants.h1}>{t('Select team(s)')}</Text>
        <Text component={TextVariants.p} style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          {t('Select the teams that you want to apply new roles to.')}
        </Text>
      </TextContent>
      <PageMultiSelectList
        view={view}
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
      />
    </>
  );
}
