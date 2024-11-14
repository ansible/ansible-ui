import { ITableColumn, TextCell } from '@ansible/ansible-ui-framework';
import { PageMultiSelectList } from '@ansible/ansible-ui-framework/PageTable/PageMultiSelectList';
import { Title } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { hubAPI } from '../../../common/api/formatPath';
import { useHubMultiSelectListView } from '../../../common/useHubMultiSelectListView';
import { HubTeam } from '../../../interfaces/expanded/HubTeam';
import { useHubTeamFilters } from '../hooks/useHubTeamFilters';

const StyledTitle = styled(Title)`
  margin-bottom: 1rem;
`;

export function HubSelectTeamsStep(props: { descriptionForTeamsSelection?: string }) {
  const toolbarFilters = useHubTeamFilters();
  const { descriptionForTeamsSelection } = props;
  const { t } = useTranslation();

  const tableColumns: ITableColumn<HubTeam>[] = useMemo(() => {
    return [
      {
        header: t('Name'),
        cell: (team: HubTeam) => <TextCell text={team.name} />,
        card: 'name',
        list: 'name',
        sort: 'name',
        maxWidth: 200,
      },
    ];
  }, [t]);

  const view = useHubMultiSelectListView<HubTeam>(
    {
      url: hubAPI`/_ui/v2/teams/`,
      toolbarFilters,
      tableColumns,
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
