import { DropdownPosition } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout } from '../../../../framework';
import { PageDetailsFromColumns } from '../../../../framework/PageDetails/PageDetailsFromColumns';
import { useGet } from '../../../common/useItem';
import { RouteE } from '../../../Routes';
import { EdaInventory } from '../../interfaces/EdaInventory';
import { useInventoriesColumns } from './hooks/useInventoryColumns';
import { useInventoryRowActions } from './hooks/useInventoryRowActions';

export function InventoryDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: inventory, mutate: refresh } = useGet<EdaInventory>(
    `/api/inventory/${params.id ?? ''}`
  );
  const tableColumns = useInventoriesColumns();
  const itemActions = useInventoryRowActions(refresh);
  return (
    <PageLayout>
      <PageHeader
        title={inventory?.name}
        breadcrumbs={[
          { label: t('Inventories'), to: RouteE.EdaInventories },
          { label: inventory?.name },
        ]}
        headerActions={
          <PageActions<EdaInventory>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={inventory}
          />
        }
      />
      <PageDetailsFromColumns item={inventory} columns={tableColumns} />
    </PageLayout>
  );
}
