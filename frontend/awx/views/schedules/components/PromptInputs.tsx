import { useTranslation } from 'react-i18next';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { resourceEndPoints, useGetPromptOnLaunchFields } from '../hooks/scheduleHelpers';
import { useFormContext, useWatch } from 'react-hook-form';
import { InventorySource } from '../../../interfaces/InventorySource';
import { Project } from '../../../interfaces/Project';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { useCallback, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { requestGet } from '../../../../common/crud/Data';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import { awxAPI } from '../../../common/api/awx-utils';

export function PromptInputs(props: { onError: (err: Error) => void }) {
  const { onError } = props;
  const { t } = useTranslation();
  const { setValue } = useFormContext();
  const params: { [string: string]: string } = useParams<{ id?: string; source_id?: string }>();
  const { pathname } = useLocation();
  const resourceType = useWatch({
    name: 'resource_type',
  }) as string;
  const launchConfiguration = useWatch({ name: 'launchConfiguration' }) as LaunchConfiguration;
  const resourceForSchedule = useWatch({ name: 'unified_job_template_object' }) as
    | InventorySource
    | Project
    | JobTemplate
    | WorkflowJobTemplate;
  const promptOnLaunchFields = useGetPromptOnLaunchFields(resourceForSchedule);

  useEffect(() => {
    const resource = async () => {
      if (resourceForSchedule || !params?.id) {
        return;
      }

      const pathnameSplit = pathname.split('/');
      const resourceType = pathnameSplit[1] === 'projects' ? 'projects' : pathnameSplit[2];
      try {
        const response = await requestGet<
          Project | JobTemplate | WorkflowJobTemplate | InventorySource
        >(`${resourceEndPoints[resourceType]}${params?.id}/`);
        setValue('unified_job_template_object', response);
        setValue('unified_job_template', response.id);
      } catch (err) {
        if (err instanceof Error) {
          onError(err);
        }
      }
    };

    void resource();
  }, [params, pathname, resourceForSchedule, setValue, onError]);

  useEffect(() => {
    const getDefaultInstanceGroups = async (url: string) => {
      return requestGet<AwxItemsResponse<InstanceGroup>>(`${url}`)
        .then((response) => {
          setValue('defaultInstanceGroups', response.results);
          setValue('newInstanceGroups', response.results);
        })
        .catch((err) => {
          if (err instanceof Error) {
            onError(err);
          }
        });
    };

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
  }, [launchConfiguration, params.id, pathname, onError, setValue]);

  const launchConfig = useCallback(
    async (id: string, resource_type: string) => {
      return requestGet<LaunchConfiguration>(`${resourceEndPoints[resource_type]}${id}/launch/`)
        .then((response) => {
          setValue('launchConfiguration', response);
          setValue('defaultLabels', response.defaults.labels);
          setValue('labels', response.defaults.labels);
          setValue('credentials', response.defaults.credentials);
          setValue('newCredentials', response.defaults.credentials);
          setValue('extra_vars', response.defaults.extra_vars);
          setValue('limit', response.defaults.limit);
          setValue('diff_mode', response.defaults.diff_mode);
          setValue('scm_branch', response.defaults.scm_branch);
          setValue('forks', response.defaults.forks);
          setValue('job_slice_count', response.defaults.job_slice_count);
          setValue('timeout', response.defaults.timeout);
          setValue('verbosity', response.defaults.verbosity);
          setValue('job_type', response.defaults.job_type);
          setValue('inventory', response.defaults.inventory);
          if (JSON.stringify(response.defaults.execution_environment) !== '{}') {
            setValue('execution_environment', {
              ...response?.defaults?.execution_environment,
            });
          }
          if (response.defaults.skip_tags) {
            setValue(
              'arrayedSkipTags',
              response.defaults.skip_tags.split(',')?.map((tag) => ({ name: tag }))
            );
          }
          if (response.defaults.job_tags) {
            setValue(
              'arrayedJobTags',
              response.defaults.job_tags.split(',')?.map((tag) => ({ name: tag }))
            );
          }
        })
        .catch((err) => {
          if (err instanceof Error) {
            onError(err);
          }
        });
    },
    [onError, setValue]
  );

  useEffect(() => {
    const resType = resourceType ?? pathname.split('/')[2];
    if (
      (resType !== 'job_template' && resType !== 'workflow_job_template') ||
      (!resourceForSchedule?.id && !params?.id)
    )
      return;
    if (resourceForSchedule?.id) {
      void launchConfig(resourceForSchedule.id.toString(), resType);
      return;
    }
    void launchConfig(params.id, resType);
  }, [launchConfig, pathname, resourceForSchedule?.id, params.id, resourceType]);

  return (
    <>
      {promptOnLaunchFields?.length ? (
        <PageFormSection title={t('Prompt on launch fields')}>
          {promptOnLaunchFields.map((field) => field)}
        </PageFormSection>
      ) : null}
    </>
  );
}
