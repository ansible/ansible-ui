import { DropdownPosition, PageSection, Skeleton, Stack } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageActions,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
} from '../../../../framework';
import { useGet } from '../../../common/useItem';
import { RouteE } from '../../../Routes';
import { EdaInventory } from '../../interfaces/EdaInventory';
import { useInventoryRowActions } from './hooks/useInventoryRowActions';
import { formatDateString } from '../../../../framework/utils/formatDateString';

export function InventoryDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: inventory, mutate: refresh } = useGet<EdaInventory>(
    `/api/inventory/${params.id ?? ''}`
  );
  const itemActions = useInventoryRowActions(refresh);

  const renderInventoryDetailsTab = (inventory: EdaInventory | undefined): JSX.Element => {
    return (
      <PageDetails>
        <PageDetail label={t('Name')}>{inventory?.name || ''}</PageDetail>
        <PageDetail label={t('Description')}>{inventory?.description || ''}</PageDetail>
        <PageDetail label={t('Source of Inventory')}>{inventory?.source || ''}</PageDetail>
        <PageDetail label={t('Created')}>
          {inventory?.created_at ? formatDateString(inventory.created_at) : ''}
        </PageDetail>
        <PageDetail label={t('Modified')}>
          {inventory?.modified_at ? formatDateString(inventory.modified_at) : ''}
        </PageDetail>
        <PageDetail label={t('Inventory')}>{inventory?.inventory || ''}</PageDetail>
      </PageDetails>
    );
  };

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
      {inventory ? (
        <PageTabs>
          <PageTab label={t('Details')}>{renderInventoryDetailsTab(inventory)}</PageTab>
        </PageTabs>
      ) : (
        <PageTabs>
          <PageTab>
            <PageSection variant="light">
              <Stack hasGutter>
                <Skeleton />
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </Stack>
            </PageSection>
          </PageTab>
        </PageTabs>
      )}
    </PageLayout>
  );
}
