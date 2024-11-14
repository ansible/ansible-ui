import { ITableColumn, TextCell } from '@ansible/ansible-ui-framework';
import { PageMultiSelectList } from '@ansible/ansible-ui-framework/PageTable/PageMultiSelectList';
import { Title } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxMultiSelectListView } from '../../../common/useAwxMultiSelectListView';
import { Team } from '../../../interfaces/Team';
import { useTeamsFilters } from '../../teams/hooks/useTeamsFilters';

const StyledTitle = styled(Title)`
  margin-bottom: 1rem;
`;

export function AwxSelectTeamsStep(props: { descriptionForTeamsSelection?: string }) {
  const toolbarFilters = useTeamsFilters();
  const { descriptionForTeamsSelection } = props;
  const { t } = useTranslation();

  const tableColumns: ITableColumn<Team>[] = useMemo(() => {
    return [
      {
        header: t('Name'),
        cell: (team: Team) => <TextCell text={team.name} />,
        card: 'name',
        list: 'name',
        sort: 'name',
        maxWidth: 200,
      },
    ];
  }, [t]);

  const view = useAwxMultiSelectListView<Team>(
    {
      url: awxAPI`/teams/`,
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
