import { ITableColumn, TextCell } from '@ansible/ansible-ui-framework';
import { PageMultiSelectList } from '@ansible/ansible-ui-framework/PageTable/PageMultiSelectList';
import { Title } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { hubAPI } from '../../../common/api/formatPath';
import { useHubMultiSelectListView } from '../../../common/useHubMultiSelectListView';
import { HubUser } from '../../../interfaces/expanded/HubUser';
import { useHubUserFilters } from '../hooks/useHubUserFilters';

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
        cell: (user: HubUser) => <TextCell text={user?.username} />,
        sort: 'username',
        maxWidth: 200,
      },
      {
        header: t('First name'),
        type: 'text',
        value: (user: HubUser) => user?.first_name,
        sort: 'first_name',
      },
      {
        header: t('Last name'),
        type: 'text',
        value: (user: HubUser) => user?.last_name,
        sort: 'last_name',
      },
    ];
  }, [t]);

  const view = useHubMultiSelectListView<HubUser>(
    {
      url: hubAPI`/_ui/v2/users/`,
      queryParams: {
        is_superuser: 'false',
      },
      toolbarFilters,
      tableColumns,
      disableQueryString: true,
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
