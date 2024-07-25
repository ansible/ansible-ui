import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout } from '../../../../framework';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';
import { useAwxConfig } from '../../common/useAwxConfig';
import { getDocsBaseUrl } from '../../common/util/getDocsBaseUrl';
import { SchedulesList } from './SchedulesList';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxRoute } from '../../main/AwxRoutes';

export function Schedules(props: { sublistEndpoint?: string }) {
  const { t } = useTranslation();
  const config = useAwxConfig();
  return (
    <PageLayout>
      <PageHeader
        title={t('Schedules')}
        titleHelpTitle={t('Schedules')}
        titleHelp={t(
          'Schedules are used to launch jobs on a regular basis. They can be used to launch jobs against machines, synchronize with inventory sources, and import project content from a version control system.'
        )}
        titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/scheduling.html`}
        description={t(
          'Schedules are used to launch jobs on a regular basis. They can be used to launch jobs against machines, synchronize with inventory sources, and import project content from a version control system.'
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
