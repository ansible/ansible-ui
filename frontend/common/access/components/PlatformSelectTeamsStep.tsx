import { ITableColumn, TextCell } from '@ansible/ansible-ui-framework';
import { PageMultiSelectList } from '@ansible/ansible-ui-framework/PageTable/PageMultiSelectList';
import { Title } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { PlatformTeam } from '@ansible/platform-ui/interfaces/PlatformTeam';
import { usePlatformMultiSelectListView } from '@ansible/platform-ui/common/usePlatformMultiSelectListView';
import { usePlatformTeamFilters } from '../hooks/usePlatformTeamFilters';

const StyledTitle = styled(Title)`
  margin-bottom: 1rem;
`;

export function PlatformSelectTeamsStep(props: { descriptionForTeamsSelection?: string }) {
  const toolbarFilters = usePlatformTeamFilters();
  const { descriptionForTeamsSelection } = props;
  const { t } = useTranslation();

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

  const view = usePlatformMultiSelectListView<PlatformTeam>(
    {
      url: gatewayAPI`/teams/`,
      toolbarFilters,
      tableColumns,
      disableQueryString: true,
    },
    'teams'
  );

  return (
    <>
      <StyledTitle headingLevel="h1">{t('Select team(s)')}</StyledTitle>
      <h2 style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        {descriptionForTeamsSelection ??
          t('Select the team(s) that you want to apply new roles to.')}
      </h2>
      <PageMultiSelectList
        view={view}
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
      />
    </>
  );
}
