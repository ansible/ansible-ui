import { ITableColumn, IToolbarFilter, LoadingPage, TextCell } from '@ansible/ansible-ui-framework';
import { PageMultiSelectList } from '@ansible/ansible-ui-framework/PageTable/PageMultiSelectList';
import { useNameToolbarFilter } from '@ansible/awx-ui/common/awx-toolbar-filters';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { Content, ContentVariants } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
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
      disableQueryString: true,
    },
    'teams'
  );
  if (isLoading || !organization) return <LoadingPage />;

  return (
    <>
      <Content>
        <Content component={ContentVariants.h1}>{t('Select team(s)')}</Content>
        <Content component={ContentVariants.p} style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          {t('Select the teams that you want to apply new roles to.')}
        </Content>
      </Content>
      <PageMultiSelectList
        view={view}
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
      />
    </>
  );
}
