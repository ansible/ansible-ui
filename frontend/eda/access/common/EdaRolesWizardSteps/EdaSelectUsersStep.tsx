import { useTranslation } from 'react-i18next';
import { useUserFilters } from '../../users/hooks/useUserFilters';
import { useMemo } from 'react';
import { EdaUser } from '../../../interfaces/EdaUser';
import { ITableColumn, TextCell } from '../../../../../framework';
import { edaAPI } from '../../../common/eda-utils';
import { useEdaMultiSelectListView } from '../../../common/useEdaMultiSelectListView';
import { PageMultiSelectList } from '../../../../../framework/PageTable/PageMultiSelectList';
import styled from 'styled-components';
import { Title } from '@patternfly/react-core';

const StyledTitle = styled(Title)`
  margin-bottom: 1rem;
`;

export function EdaSelectUsersStep(props: { descriptionForUsersSelection?: string }) {
  const toolbarFilters = useUserFilters();
  const { t } = useTranslation();
  const { descriptionForUsersSelection } = props;

  const tableColumns: ITableColumn<EdaUser>[] = useMemo(() => {
    return [
      {
        header: t('Username'),
        cell: (user: EdaUser) => <TextCell text={user.username} />,
        card: 'name',
        list: 'name',
        sort: 'username',
        maxWidth: 200,
      },
      {
        header: t('First name'),
        type: 'text',
        value: (user: EdaUser) => user.first_name,
        sort: 'first_name',
      },
      {
        header: t('Last name'),
        type: 'text',
        value: (user: EdaUser) => user.last_name,
        sort: 'last_name',
      },
    ];
  }, [t]);

  const view = useEdaMultiSelectListView<EdaUser>(
    {
      url: edaAPI`/users/`,
      toolbarFilters,
      tableColumns,
    },
    'users'
  );

  return (
    <>
      <StyledTitle headingLevel="h1">{t('Select user(s)')}</StyledTitle>
      <h2 style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        {descriptionForUsersSelection ??
          t('Select the user(s) that you want to apply new roles to.')}
      </h2>
      <PageMultiSelectList
        view={view}
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
      />
    </>
  );
}
