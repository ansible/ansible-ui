import { DropdownPosition } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout } from '../../../../framework';
import { PageDetailsFromColumns } from '../../../../framework/PageDetails/PageDetailsFromColumns';
import { useGet } from '../../../common/useItem';
import { RouteE } from '../../../Routes';
import { EdaUser } from '../../interfaces/EdaUser';
import { useUserActions } from './hooks/useUserActions';
import { useUserColumns } from './hooks/useUserColumns';

export function UserDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: User, mutate: refresh } = useGet<EdaUser>(`/eda/api/v1/Users/${params.id ?? ''}`);
  const tableColumns = useUserColumns();
  const itemActions = useUserActions(refresh);
  return (
    <PageLayout>
      <PageHeader
        title={User?.name}
        breadcrumbs={[{ label: t('Users'), to: RouteE.EdaUsers }, { label: User?.name }]}
        headerActions={
          <PageActions<EdaUser>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={User}
          />
        }
      />
      <PageDetailsFromColumns item={User} columns={tableColumns} />
    </PageLayout>
  );
}
