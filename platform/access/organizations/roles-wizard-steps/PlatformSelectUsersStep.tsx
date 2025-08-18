import { ITableColumn, TextCell } from '@ansible/ansible-ui-framework';
import { PageMultiSelectList } from '@ansible/ansible-ui-framework/PageTable/PageMultiSelectList';
import { Content, ContentVariants } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlatformMultiSelectListView } from '../../../common/usePlatformMultiSelectListView';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useUsersFilters } from '../../users/hooks/useUsersFilters';

export function PlatformSelectUsersStep(props: { descriptionForUsersSelection?: string }) {
  const toolbarFilters = useUsersFilters();
  const { t } = useTranslation();

  const { descriptionForUsersSelection } = props;

  const tableColumns: ITableColumn<PlatformUser>[] = useMemo(() => {
    return [
      {
        header: t('Username'),
        cell: (user: PlatformUser) => <TextCell text={user?.username} />,
        card: 'name',
        list: 'name',
        sort: 'username',
        maxWidth: 200,
      },
      {
        header: t('First name'),
        type: 'text',
        value: (user: PlatformUser) => user?.first_name,
        sort: 'first_name',
      },
      {
        header: t('Last name'),
        type: 'text',
        value: (user: PlatformUser) => user?.last_name,
        sort: 'last_name',
      },
    ];
  }, [t]);

  const view = usePlatformMultiSelectListView<PlatformUser>(
    {
      url: gatewayAPI`/users/`,
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
      <Content>
        <Content component={ContentVariants.h1}>{t('Select user(s)')}</Content>
        <Content component={ContentVariants.p} style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          {descriptionForUsersSelection ??
            t('Select the user(s) that you want to apply new roles to.')}
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
