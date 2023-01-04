import { PageSection } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageBody, PageDetails, PageHeader, PageLayout, SinceCell } from '../../../../framework';
import { Scrollable } from '../../../../framework/components/Scrollable';
import { PageDetail } from '../../../../framework/PageDetails/PageDetail';
import { useSettings } from '../../../../framework/Settings';
import { StatusCell } from '../../../common/StatusCell';
import { useItem } from '../../../common/useItem';
import { RouteE } from '../../../Routes';
import { Task } from './Task';

export function TaskDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const settings = useSettings();
  const task = useItem<Task>('/api/automation-hub/pulp/api/v3/tasks', params.id ?? '0');
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
            <PageDetails>
              <PageDetail label={t('Name')}>{task?.name}</PageDetail>
              <PageDetail label={t('Status')}>
                <StatusCell status={task?.state} />
              </PageDetail>
              <PageDetail label={t('Started')}>
                <SinceCell value={task?.finished_at} />
              </PageDetail>
              <PageDetail label={t('Finished')}>
                <SinceCell value={task?.finished_at} />
              </PageDetail>
              <PageDetail label={t('Created')}>
                <SinceCell value={task?.pulp_created} />
              </PageDetail>
            </PageDetails>
          </PageSection>
        </Scrollable>
      </PageBody>
    </PageLayout>
  );
}
