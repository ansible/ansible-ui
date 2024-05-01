import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { ITableColumn, TextCell } from '../../../../../framework';
import { useAwxMultiSelectListView } from '../../../common/useAwxMultiSelectListView';
import { PageMultiSelectList } from '../../../../../framework/PageTable/PageMultiSelectList';
import styled from 'styled-components';
import { Title } from '@patternfly/react-core';
import { useUsersFilters } from '../../users/hooks/useUsersFilters';
import { AwxUser } from '../../../interfaces/User';
import { awxAPI } from '../../../common/api/awx-utils';

const StyledTitle = styled(Title)`
  margin-bottom: 1rem;
`;

export function AwxSelectUsersStep(props: { descriptionForUsersSelection?: string }) {
  const toolbarFilters = useUsersFilters();
  const { t } = useTranslation();
  const { descriptionForUsersSelection } = props;

  const tableColumns: ITableColumn<AwxUser>[] = useMemo(() => {
    return [
      {
        header: t('Username'),
        cell: (user: AwxUser) => <TextCell text={user.username} />,
        card: 'name',
        list: 'name',
        sort: 'username',
        maxWidth: 200,
      },
      {
        header: t('First name'),
        type: 'text',
        value: (user: AwxUser) => user.first_name,
        sort: 'first_name',
      },
      {
        header: t('Last name'),
        type: 'text',
        value: (user: AwxUser) => user.last_name,
        sort: 'last_name',
      },
    ];
  }, [t]);

  const view = useAwxMultiSelectListView<AwxUser>(
    {
      url: awxAPI`/users/`,
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
