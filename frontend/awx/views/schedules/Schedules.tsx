import { PageHeader, PageLayout } from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';
import { AwxRoute } from '../../main/AwxRoutes';
import { SchedulesList } from './SchedulesList';

export function Schedules(props: { sublistEndpoint?: string }) {
  const { t } = useTranslation();
  const config = useAwxConfig();
  return (
    <PageLayout>
      <PageHeader
        title={t('Schedules')}
        titleHelpTitle={t('Schedules')}
        titleHelp={t(
          'Schedules are used to launch jobs at predetermined times. Use a schedule to launch a job, synchronize inventory sources, and import project content from a version control system at set times.'
        )}
        titleDocLink={useGetDocsUrl(config, 'schedules')}
        description={t(
          'Schedules are used to launch jobs at predetermined times. Use a schedule to launch a job, synchronize inventory sources, and import project content from a version control system at set times.'
        )}
        headerActions={<ActivityStreamIcon type={'schedule'} />}
      />
      <SchedulesList
        createSchedulePageId={AwxRoute.CreateSchedule}
        sublistEndpoint={props.sublistEndpoint}
        url={awxAPI`/schedules/`}
      />
    </PageLayout>
  );
}
