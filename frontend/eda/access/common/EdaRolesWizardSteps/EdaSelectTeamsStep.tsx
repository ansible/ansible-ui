import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../../framework';
import { edaAPI } from '../../../common/eda-utils';
import { useEdaMultiSelectListView } from '../../../common/useEdaMultiSelectListView';
import { PageMultiSelectList } from '../../../../../framework/PageTable/PageMultiSelectList';
import { EdaTeam } from '../../../interfaces/EdaTeam';
import { Title } from '@patternfly/react-core';
import styled from 'styled-components';
import { useEdaTeamFilters } from '../../teams/hooks/useEdaTeamFilters';

const StyledTitle = styled(Title)`
  margin-bottom: 1rem;
`;

export function EdaSelectTeamsStep(props: { descriptionForTeamsSelection?: string }) {
  const toolbarFilters = useEdaTeamFilters();
  const { descriptionForTeamsSelection } = props;
  const { t } = useTranslation();

  const tableColumns: ITableColumn<EdaTeam>[] = useMemo(() => {
    return [
      {
        header: t('Name'),
        cell: (team: EdaTeam) => <TextCell text={team.name} />,
        card: 'name',
        list: 'name',
        sort: 'name',
        maxWidth: 200,
      },
    ];
  }, [t]);

  const view = useEdaMultiSelectListView<EdaTeam>(
    {
      url: edaAPI`/teams/`,
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
