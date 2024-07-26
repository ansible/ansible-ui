import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { ITableColumn, TextCell } from '../../../../../framework';
import { PageMultiSelectList } from '../../../../../framework/PageTable/PageMultiSelectList';
import styled from 'styled-components';
import { Title } from '@patternfly/react-core';
import { useHubUserFilters } from '../hooks/useHubUserFilters';
import { HubUser } from '../../../interfaces/expanded/HubUser';
import { useHubMultiSelectListView } from '../../../common/useHubMultiSelectListView';
import { hubAPI } from '../../../common/api/formatPath';

const StyledTitle = styled(Title)`
  margin-bottom: 1rem;
`;

export function HubSelectUsersStep(props: { descriptionForUsersSelection?: string }) {
  const toolbarFilters = useHubUserFilters();
  const { t } = useTranslation();
  const { descriptionForUsersSelection } = props;

  const tableColumns: ITableColumn<HubUser>[] = useMemo(() => {
    return [
      {
        header: t('Username'),
        cell: (user: HubUser) => <TextCell text={user.username} />,
        card: 'name',
        list: 'name',
        sort: 'username',
        maxWidth: 200,
      },
      {
        header: t('First name'),
        type: 'text',
        value: (user: HubUser) => user.first_name,
        sort: 'first_name',
      },
      {
        header: t('Last name'),
        type: 'text',
        value: (user: HubUser) => user.last_name,
        sort: 'last_name',
      },
    ];
  }, [t]);

  const view = useHubMultiSelectListView<HubUser>(
    {
      url: hubAPI`/_ui/v1/users/`,
      queryParams: {
        is_superuser: 'false',
      },
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
