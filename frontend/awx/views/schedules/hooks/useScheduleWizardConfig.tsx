import { requestGet } from '../../../../common/crud/Data';
import { Project } from '../../../interfaces/Project';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { InventorySource } from '../../../interfaces/InventorySource';
import { resourceEndPoints } from './scheduleHelpers';
import { ScheduleFormWizard } from '../types';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import { awxAPI } from '../../../common/api/awx-utils';
import { DateTime } from 'luxon';
import { dateToInputDateTime } from '../../../../../framework/utils/dateTimeHelpers';
import { Frequency, RRule } from 'rrule';

export async function getScheduleWizardConfig(
  params: Readonly<
    Partial<{
      id: string;
      source_id?: string | undefined;
    }>
  >,
  pathname: string,
  onError: (err: Error) => void
) {
  const launchConfiguration: LaunchConfiguration = {} as LaunchConfiguration;
  const now = DateTime.now();
  const closestQuarterHour: DateTime = DateTime.fromMillis(
    Math.ceil(now.toMillis() / 900000) * 900000
  );
  const [currentDate, time]: string[] = dateToInputDateTime(closestQuarterHour.toISO() as string);
  const scheduleFormData: ScheduleFormWizard = {
    unified_job_template_object: null,
    unified_job_template: undefined,
    inventory: 0,
    resourceName: '',
    name: '',
    description: '',
    resource_type: '',
    startDateTime: { date: currentDate, time: time },
    timezone: '',
    exceptions: null,
    occurrences: {
      id: 0,
      freq: Frequency.WEEKLY,
      interval: 1,
      wkst: RRule.SU,
      byweekday: null,
      byweekno: null,
      bymonth: null,
      bymonthday: null,
      byyearday: null,
      bysetpos: null,
      until: null,
      endDate: '',
      endTime: '',
      count: null,
      byminute: null,
      byhour: null,
      endingType: '',
      rules: [],
    },
    prompt: null,
    defaultInstanceGroups: [],
    newInstanceGroups: [],
    launch_config: null,
  };

  const pathnameSplit = pathname.split('/');
  const resourceType = pathnameSplit[1] === 'projects' ? 'projects' : pathnameSplit[2];

  const getDefaultInstanceGroups = async (url: string) => {
    return requestGet<AwxItemsResponse<InstanceGroup>>(`${url}`)
      .then((response) => {
        scheduleFormData.defaultInstanceGroups = response.results;
        scheduleFormData.newInstanceGroups = response.results;
      })
      .catch((err) => {
        if (err instanceof Error) {
          onError(err);
        }
      });
  };

  const launchConfig = async (id: string, resource_type: string) => {
    return requestGet<LaunchConfiguration>(`${resourceEndPoints[resource_type]}${id}/launch/`)
      .then((response) => {
        scheduleFormData.launch_config = response;
        if (
          JSON.stringify(response.defaults.execution_environment) !== '{}' &&
          response.defaults.execution_environment?.id
        ) {
          scheduleFormData.launch_config.defaults.execution_environment = {
            ...response?.defaults?.execution_environment,
          };
        }
      })
      .catch((err) => {
        if (err instanceof Error) {
          onError(err);
        }
      });
  };

  const resType = resourceType ?? pathname.split('/')[2];
  if ((resType !== 'job_template' && resType !== 'workflow_job_template') || !params?.id) return;
  void launchConfig(params.id, resType);

  if (launchConfiguration && launchConfiguration?.ask_instance_groups_on_launch) {
    if (pathname.split('/').includes('job_template')) {
      void getDefaultInstanceGroups(
        awxAPI`/job_templates/${launchConfiguration.job_template_data.id.toString()}/instance_groups/`
      );
    }
    if (pathname.split('/').includes('workflow_ job_template')) {
      void getDefaultInstanceGroups(
        awxAPI`/workflow_job_templates/${launchConfiguration.job_template_data.id.toString()}/instance_groups/`
      );
    }
  }

  scheduleFormData.resource_type = resourceType;
  try {
    await requestGet<Project | JobTemplate | WorkflowJobTemplate | InventorySource>(
      `${resourceEndPoints[resourceType]}${params?.id}/`
    ).then((res) => {
      scheduleFormData.unified_job_template_object = res;
      scheduleFormData.unified_job_template = res.id;

      const resType = resourceType ?? pathname.split('/')[2];
      if ((resType !== 'job_template' && resType !== 'workflow_job_template') || !params?.id)
        return;
      void launchConfig(params.id, resType);

      if (launchConfiguration && launchConfiguration?.ask_instance_groups_on_launch) {
        if (pathname.split('/').includes('job_template')) {
          void getDefaultInstanceGroups(
            awxAPI`/job_templates/${launchConfiguration.job_template_data.id.toString()}/instance_groups/`
          );
        }
        if (pathname.split('/').includes('workflow_ job_template')) {
          void getDefaultInstanceGroups(
            awxAPI`/workflow_job_templates/${launchConfiguration.job_template_data.id.toString()}/instance_groups/`
          );
        }
      }
    });
    return scheduleFormData;
  } catch (err) {
    if (err instanceof Error) {
      onError(err);
    }
  }
}
