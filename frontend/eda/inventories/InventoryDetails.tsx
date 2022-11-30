import { DropdownPosition, PageSection } from '@patternfly/react-core'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { PageActions, PageHeader, PageLayout } from '../../../framework'
import { Scrollable } from '../../../framework/components/Scrollable'
import { TableDetails } from '../../../framework/PageTableDetails'
import { useSettings } from '../../../framework/Settings'
import { useGet } from '../../common/useItem'
import { RouteE } from '../../Routes'
import { EdaInventory } from '../interfaces/EdaInventory'
import { useInventoriesColumns } from './hooks/useInventoryColumns'
import { useInventoryRowActions } from './hooks/useInventoryRowActions'

export function InventoryDetails() {
  const { t } = useTranslation()
  const params = useParams<{ id: string }>()
  const { data: inventory, mutate: refresh } = useGet<EdaInventory>(
    `/api/inventory/${params.id ?? ''}`
  )
  const settings = useSettings()
  const tableColumns = useInventoriesColumns()
  const itemActions = useInventoryRowActions(refresh)
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
      <Scrollable>
        <PageSection
          variant="light"
          style={{
            backgroundColor:
              settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--300)' : undefined,
          }}
        >
          <TableDetails item={inventory} columns={tableColumns} />
        </PageSection>
      </Scrollable>
    </PageLayout>
  )
}
