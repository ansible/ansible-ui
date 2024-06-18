import { useTranslation } from 'react-i18next';
import { useUsersFilters } from '../../users/hooks/useUsersFilters';
import { Text, TextContent, TextVariants } from '@patternfly/react-core';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { ITableColumn, LoadingPage, TextCell } from '../../../../framework';
import { useMemo } from 'react';
import { usePlatformMultiSelectListView } from '../../../common/usePlatformMultiSelectListView';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { useParams } from 'react-router-dom';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { PageMultiSelectList } from '../../../../framework/PageTable/PageMultiSelectList';

export function PlatformSelectUsersStep() {
  const toolbarFilters = useUsersFilters();
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: organization, isLoading } = useGet<PlatformOrganization>(
    gatewayV1API`/organizations/${params.id || ''}/`
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
      url: gatewayV1API`/users/`,
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
