import { DropdownPosition, PageSection } from '@patternfly/react-core'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { PageHeader, PageLayout, TypedActions } from '../../../framework'
import { Scrollable } from '../../../framework/components/Scrollable'
import { TableDetails } from '../../../framework/PageTableDetails'
import { useSettings } from '../../../framework/Settings'
import { useGet } from '../../common/useItem'
import { RouteE } from '../../Routes'
import { EdaProject } from '../interfaces/EdaProject'
import { useProjectRowActions } from './hooks/useProjectRowActions'
import { useProjectsColumns } from './hooks/useProjectsColumns'

export function ProjectDetails() {
  const { t } = useTranslation()
  const params = useParams<{ id: string }>()
  const { data: project, mutate: refresh } = useGet<EdaProject>(`/api/projects/${params.id ?? ''}`)
  const settings = useSettings()
  const tableColumns = useProjectsColumns()
  const itemActions = useProjectRowActions(refresh)
  return (
    <PageLayout>
      <PageHeader
        title={project?.name}
        breadcrumbs={[{ label: t('Projects'), to: RouteE.EdaProjects }, { label: project?.name }]}
        headerActions={
          <TypedActions<EdaProject>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={project}
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
          <TableDetails item={project} columns={tableColumns} />
        </PageSection>
      </Scrollable>
    </PageLayout>
  )
}
