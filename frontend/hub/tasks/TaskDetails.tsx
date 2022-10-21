import { PageSection } from '@patternfly/react-core'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import {
  Detail,
  DetailsList,
  PageBody,
  PageHeader,
  PageLayout,
  SinceCell,
} from '../../../framework'
import { Scrollable } from '../../../framework/components/Scrollable'
import { useSettings } from '../../../framework/Settings'
import { StatusCell } from '../../common/StatusCell'
import { useItem } from '../../common/useItem'
import { RouteE } from '../../Routes'
import { Task } from './Task'

export function TaskDetails() {
  const { t } = useTranslation()
  const params = useParams<{ id: string }>()
  const settings = useSettings()
  const task = useItem<Task>('/api/automation-hub/pulp/api/v3/tasks', params.id ?? '0')
  return (
    <PageLayout>
      <PageHeader
        title={task?.name}
        breadcrumbs={[{ label: t('Task management'), to: RouteE.Tasks }, { label: task?.name }]}
      />
      <PageBody>
        <Scrollable>
          <PageSection
            variant="light"
            style={{
              backgroundColor:
                settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--300)' : undefined,
            }}
          >
            <DetailsList>
              <Detail label={t('Name')}>{task?.name}</Detail>
              <Detail label={t('Status')}>
                <StatusCell status={task?.state} />
              </Detail>
              <Detail label={t('Started')}>
                <SinceCell value={task?.finished_at} />
              </Detail>
              <Detail label={t('Finished')}>
                <SinceCell value={task?.finished_at} />
              </Detail>
              <Detail label={t('Created')}>
                <SinceCell value={task?.pulp_created} />
              </Detail>
            </DetailsList>
          </PageSection>
        </Scrollable>
      </PageBody>
    </PageLayout>
  )
}
