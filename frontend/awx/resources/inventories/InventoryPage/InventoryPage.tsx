/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout, PageTab, PageTabs } from '../../../../../framework';
import { useGet } from '../../../../common/crud/useGet';
import { RouteObj } from '../../../../Routes';
import { Inventory } from '../../../interfaces/Inventory';
import { useInventoryActions } from '../hooks/useInventoryActions';
import { InventoryDetails } from './InventoryDetails';

export function InventoryPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; inventory_type: string }>();
  const inventory = useGetInventory(params.id, params.inventory_type);
  const navigate = useNavigate();
  const itemActions = useInventoryActions({
    onInventoriesDeleted: () => navigate(RouteObj.Inventories),
  });
  return (
    <PageLayout>
      <PageHeader
        title={inventory?.name}
        breadcrumbs={[
          { label: t('Inventories'), to: RouteObj.Inventories },
          { label: inventory?.name },
        ]}
        headerActions={
          <PageActions<Inventory>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={inventory}
          />
        }
      />
      <PageTabs loading={!inventory}>
        <PageTab label={t('Details')}>
          <InventoryDetails inventory={inventory!} />
        </PageTab>
        <PageTab label={t('Access')}>TODO</PageTab>
        {inventory?.kind !== 'smart' && <PageTab label={t('Groups')}>TODO</PageTab>}
        <PageTab label={t('Hosts')}>TODO</PageTab>
        {inventory?.kind !== 'constructed' && <PageTab label={t('Sources')}>TODO</PageTab>}
        <PageTab label={t('Jobs')}>TODO</PageTab>
        <PageTab label={t('Job Templates')}>TODO</PageTab>
      </PageTabs>
    </PageLayout>
  );
}

function useGetInventory(id?: string, inventory_type?: string) {
  const path =
    inventory_type === 'constructed_inventory' ? 'constructed_inventories' : 'inventories';
  const { data: job } = useGet<Inventory>(id ? `/api/v2/${path}/${id}/` : '');
  return job;
}
