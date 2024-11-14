import { ITableColumn, IToolbarFilter, LoadingPage, TextCell } from '@ansible/ansible-ui-framework';
import { PageMultiSelectList } from '@ansible/ansible-ui-framework/PageTable/PageMultiSelectList';
import { useNameToolbarFilter } from '@ansible/awx-ui/common/awx-toolbar-filters';
import { Text, TextContent, TextVariants } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { usePlatformMultiSelectListView } from '../../../common/usePlatformMultiSelectListView';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

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
    gatewayAPI`/organizations/${params.id || ''}/`
  );

  const view = usePlatformMultiSelectListView<PlatformTeam>(
    {
      url: gatewayAPI`/organizations/${params.id || ''}/teams/`,
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
