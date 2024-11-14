import { ITableColumn, LoadingPage, TextCell } from '@ansible/ansible-ui-framework';
import { PageMultiSelectList } from '@ansible/ansible-ui-framework/PageTable/PageMultiSelectList';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { Text, TextContent, TextVariants } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { usePlatformMultiSelectListView } from '../../../common/usePlatformMultiSelectListView';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useUsersFilters } from '../../users/hooks/useUsersFilters';

export function PlatformSelectUsersStep() {
  const toolbarFilters = useUsersFilters();
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: organization, isLoading } = useGet<PlatformOrganization>(
    gatewayAPI`/organizations/${params.id || ''}/`
  );

  const tableColumns: ITableColumn<PlatformUser>[] = useMemo(() => {
    return [
      {
        header: t('Username'),
        cell: (user: PlatformUser) => <TextCell text={user.username} />,
        card: 'name',
        list: 'name',
        sort: 'username',
        maxWidth: 200,
      },
      {
        header: t('First name'),
        type: 'text',
        value: (user: PlatformUser) => user.first_name,
        sort: 'first_name',
      },
      {
        header: t('Last name'),
        type: 'text',
        value: (user: PlatformUser) => user.last_name,
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
    },
    'users'
  );
  if (isLoading || !organization) return <LoadingPage />;

  return (
    <>
      <TextContent>
        <Text component={TextVariants.h1}>{t('Select user(s)')}</Text>
        <Text component={TextVariants.p} style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          {t('Select the users that you want to apply new roles to.')}
        </Text>
      </TextContent>
      <PageMultiSelectList
        view={view}
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
      />
    </>
  );
}
