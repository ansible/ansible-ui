import { DateTime } from 'luxon';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  PageFormSubmitHandler,
  PageHeader,
  PageLayout,
  usePageNavigate,
} from '../../../../framework';
import { useGetPageUrl } from '../../../../framework/PageNavigation/useGetPageUrl';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { dateToInputDateTime } from '../../../../framework/utils/dateTimeHelpers';
import { postRequest } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { AwxError } from '../../common/AwxError';
import { AwxPageForm } from '../../common/AwxPageForm';
import { awxAPI } from '../../common/api/awx-utils';
import { getAddedAndRemoved } from '../../common/util/getAddedAndRemoved';
import { ScheduleFormFields } from '../../interfaces/ScheduleFormFields';
import { AwxRoute } from '../../main/AwxRoutes';
import { ScheduleInputs } from './components/ScheduleInputs';
import { buildScheduleContainer } from './hooks/scheduleHelpers';

export function CreateSchedule() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const now = DateTime.now();
  const [error, setError] = useState<Error | null>(null);
  const closestQuarterHour: DateTime = DateTime.fromMillis(
    Math.ceil(now.toMillis() / 900000) * 900000
  );
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();

  const [currentDate, time]: string[] = dateToInputDateTime(closestQuarterHour.toISO() as string);

  const onSubmit: PageFormSubmitHandler<ScheduleFormFields> = async (values) => {
    const {
      name,
      unified_job_template,
      unified_job_template_object,
      resource_type,
      defaultInstanceGroups,
      newInstanceGroups,
      arrayedJobTags,
      arrayedSkipTags,
      inventory,
      credentials,
      newCredentials,
      execution_environment,
      job_type,
      verbosity,
      extra_vars,
      limit,
      diff_mode,
      scm_branch,
      forks,
      job_slice_count,
      labels,
      newLabels,
      timeout,
    } = values;
    const { added: addedLabels, removed: removedLabels } = getAddedAndRemoved(
      labels || [],
      newLabels || []
    );
    const { added: addedInstanceGroups, removed: removedInstanceGroups } = getAddedAndRemoved(
      defaultInstanceGroups || [],
      newInstanceGroups || []
    );
    const { added: addedCredentials, removed: removedCredentials } = getAddedAndRemoved(
      credentials || [],
      newCredentials || []
    );
    const ruleSet = buildScheduleContainer(values);
    const requestData = {
      name,
      unified_job_template: values.unified_job_template_object.id,
      rrule: ruleSet.toString().replace(/\n/g, ' '),
      job_type,
      verbosity,
      extra_vars,
      limit,
      scm_branch,
      forks,
      job_slice_count,
      timeout,
      diff_mode,
      inventory: inventory?.id,
      execution_environment: execution_environment?.id,
      enabled: true,
      job_tags: arrayedJobTags
        ?.filter((tag) => tag.name.trim().length)
        .map((tag) => tag.name)
        .join(','),
      skip_tags: arrayedSkipTags
        ?.filter((tag) => tag.name.trim().length)
        .map((tag) => tag.name)
        .join(','),
    };

    const response = await postRequest<ScheduleFormFields>(
      unified_job_template_object.related?.schedules,
      requestData
    );

    await Promise.all(
      removedLabels.map((label) =>
        postRequest(awxAPI`/schedules/${response.id.toString()}/labels/`, {
          id: label.id,
          disassociate: true,
        })
      )
    );
    await Promise.all(
      removedInstanceGroups.map((instanceGroup) =>
        postRequest(awxAPI`/schedules/${response.id.toString()}/instance_groups/`, {
          id: instanceGroup.id,
          disassociate: true,
        })
      )
    );
    await Promise.all(
      removedCredentials.map((credential) =>
        postRequest(awxAPI`/schedules/${response.id.toString()}/credentials/`, {
          id: credential.id,
          disassociate: true,
        })
      )
    );

    await Promise.all(
      addedLabels.map((label) =>
        postRequest(awxAPI`/schedules/${response.id.toString()}/labels/`, {
          id: label.id,
        })
      )
    );

    await Promise.all(
      addedInstanceGroups.map((instanceGroup) =>
        postRequest(awxAPI`/schedules/${response.id.toString()}/instance_groups/`, {
          id: instanceGroup.id,
        })
      )
    );

    await Promise.all(
      addedCredentials.map((credential) =>
        postRequest(awxAPI`/schedules/${response.id.toString()}/credentials/`, {
          id: credential.id,
        })
      )
    );
    if (resource_type === 'inventory_source' && inventory) {
      pageNavigate(AwxRoute.InventorySourceScheduleDetails, {
        params: { id: inventory.id, source_id: unified_job_template, schedule_id: response?.id },
      });
    } else {
      switch (unified_job_template_object.type) {
        case 'inventory_source':
          pageNavigate(AwxRoute.InventorySourceScheduleDetails, {
            params: {
              id: inventory?.id,
              schedule_id: response?.id,
            },
          });
          break;
        case 'job_template':
          pageNavigate(AwxRoute.JobTemplateScheduleDetails, {
            params: {
              id: unified_job_template_object.id,
              schedule_id: response?.id,
            },
          });
          break;
        case 'workflow_job_template':
          pageNavigate(AwxRoute.WorkflowJobTemplateScheduleDetails, {
            params: {
              id: unified_job_template_object.id,
              schedule_id: response?.id,
            },
          });
          break;
        case 'project':
          pageNavigate(AwxRoute.ProjectScheduleDetails, {
            params: {
              id: unified_job_template_object.id,
              schedule_id: response?.id,
            },
          });
          break;
      }
    }
  };
  const onCancel = () => navigate(-1);
  const { data, isLoading } = useGet<{ zones: string[]; links: Record<string, string> }>(
    awxAPI`/schedules/zoneinfo/`
  );

  const timeZones = useMemo(
    () =>
      (data?.zones || []).map((zone) => ({
        value: zone,
        key: zone,
        label: zone,
      })),
    [data?.zones]
  );

  if (isLoading) {
    return <LoadingPage />;
  }
  if (error) {
    return <AwxError error={error} />;
  }

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Schedule')}
        breadcrumbs={[
          { label: t('Schedules'), to: getPageUrl(AwxRoute.Schedules) },
          { label: t('Create Schedule') },
        ]}
      />
      <AwxPageForm<ScheduleFormFields>
        defaultValue={{
          resourceName: '',
          name: '',
          description: '',
          frequencies: [],
          freq: 3,
          interval: 1,
          wkst: 'SU',
          byweekday: [], //iCalendar RFC's equivalent to the byday keyword
          byweekno: [],
          bymonth: [],
          endDate: DateTime.now().toFormat('yyyy-LL-dd'),
          endTime: time,
          count: 1,
          endingType: 'never',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          startDateTime: { date: currentDate, time: time },
        }}
        submitText={t('Submit schedule')}
        onSubmit={onSubmit}
        onCancel={onCancel}
      >
        <ScheduleInputs
          timeZones={timeZones}
          onError={(err) => setError(err)}
          zoneLinks={data?.links}
        />
      </AwxPageForm>
    </PageLayout>
  );
}
