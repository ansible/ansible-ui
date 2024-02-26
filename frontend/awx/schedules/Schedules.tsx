import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout } from '../../../framework';
import { ActivityStreamIcon } from '../common/ActivityStreamIcon';
import { SchedulesList } from './SchedulesList';

export function Schedules(props: { sublistEndpoint?: string }) {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <PageHeader
        title={t('Schedules')}
        titleHelpTitle={t('Schedule')}
        titleHelp={t(
          'Schedules are used to launch jobs on a regular basis. They can be used to launch jobs against machines, synchronize with inventory sources, and import project content from a version control system.'
        )}
        titleDocLink="https://docs.ansible.com/automation-controller/latest/html/userguide/scheduling.html"
        description={t(
          'Schedules are used to launch jobs on a regular basis. They can be used to launch jobs against machines, synchronize with inventory sources, and import project content from a version control system.'
        )}
        headerActions={<ActivityStreamIcon type={'schedule'} />}
      />
      <SchedulesList sublistEndpoint={props.sublistEndpoint} />
    </PageLayout>
  );
}
