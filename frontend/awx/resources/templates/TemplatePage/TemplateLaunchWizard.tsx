import {
  LoadingPage,
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
  usePageAlertToaster,
} from '@ansible/ansible-ui-framework';
import { yamlToJson } from '@ansible/ansible-ui-framework/utils/codeEditorUtils';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { AwxError } from '../../../common/AwxError';
import { SurveyStep } from '../../../common/SurveyStep';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { awxAPI } from '../../../common/api/awx-utils';
import { Credential } from '../../../interfaces/Credential';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useGetJobOutputUrl } from '../../../views/jobs/useGetJobOutputUrl';
import { parseStringToTagArray } from '../JobTemplateFormHelpers';
import { PromptFormValues } from '../WorkflowVisualizer/types';
import { NodePromptsStep as PromptStep } from '../WorkflowVisualizer/wizard/NodePromptsStep';
import { shouldHideOtherStep } from '../WorkflowVisualizer/wizard/helpers';
import { useLabelPayload } from '../hooks/useLabelPayload';
import { CredentialPasswordsStep, TemplateLaunchReviewStep } from './steps';

export const formFieldToLaunchConfig = {
  job_type: 'ask_job_type_on_launch',
  inventory: 'ask_inventory_on_launch',
  credentials: 'ask_credential_on_launch',
  execution_environment: 'ask_execution_environment_on_launch',
  instance_groups: 'ask_instance_groups_on_launch',
  scm_branch: 'ask_scm_branch_on_launch',
  forks: 'ask_forks_on_launch',
  diff_mode: 'ask_diff_mode_on_launch',
  job_slice: 'ask_job_slice_count_on_launch',
  labels: 'ask_labels_on_launch',
  limit: 'ask_limit_on_launch',
  skip_tags: 'ask_skip_tags_on_launch',
  job_tags: 'ask_tags_on_launch',
  timeout: 'ask_timeout_on_launch',
  extra_vars: 'ask_variables_on_launch',
  verbosity: 'ask_verbosity_on_launch',
};

export interface TemplateLaunch {
  resource: JobTemplate | WorkflowJobTemplate;
  prompt: PromptFormValues;
  survey: { [key: string]: string | string[] };
  credential_passwords: { [key: string]: string };
  launch_config: LaunchConfiguration;
}

interface LaunchPayload {
  credentials: number[];
  credential_passwords: { [key: string]: string };
  diff_mode: boolean;
  execution_environment: number;
  extra_vars: string | { [key: string]: string | string[] };
  forks: number;
  instance_groups: number[];
  inventory: number;
  job_slice_count: number;
  job_tags: string;
  job_type: string;
  labels: number[];
  limit: string;
  scm_branch: string;
  skip_tags: string;
  timeout: number;
  verbosity: number;
}
type LaunchPayloadProperty = keyof LaunchPayload;

export function LaunchTemplate({ jobType }: { jobType: string }) {
  const { t } = useTranslation();
  const postRequest = usePostRequest<Partial<LaunchPayload>, UnifiedJob>();
  const createLabelPayload = useLabelPayload();

  const alertToaster = usePageAlertToaster();

  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const resourceId = params.id?.toString() ?? '';
  const {
    data: template,
    error: getTemplateError,
    refresh: getTemplateRefresh,
  } = useGet<JobTemplate>(awxAPI`/${jobType}/${resourceId}/`);
  const {
    data: config,
    error: getLaunchError,
    refresh: getLaunchRefresh,
  } = useGet<LaunchConfiguration>(awxAPI`/${jobType}/${resourceId}/launch/`);
  const error = getTemplateError || getLaunchError;
  const refresh = getTemplateRefresh || getLaunchRefresh;
  const getJobOutputUrl = useGetJobOutputUrl();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!config || !template) return <LoadingPage breadcrumbs tabs />;
  const handleSubmit = async (formValues: TemplateLaunch) => {
    if (formValues) {
      const { credential_passwords = {}, prompt = undefined, survey } = formValues;

      try {
        const labelPayload = await createLabelPayload(prompt?.labels || [], template);

        let payload: Partial<LaunchPayload> = {};
        const setValue = <K extends LaunchPayloadProperty>(key: K, value?: LaunchPayload[K]) => {
          const isValid = typeof value !== 'undefined' && value !== null;
          if (!isValid) {
            return;
          }

          if (jobType === 'workflow_job_templates') {
            if (
              config[formFieldToLaunchConfig[key as keyof unknown] as keyof LaunchConfiguration]
            ) {
              payload[key] = value;
            }
            return;
          }

          payload[key] = value;
        };
        if (prompt !== undefined) {
          setValue(
            'credentials',
            (prompt?.credentials || []).map((cred) => Number(cred.id))
          );
          setValue('credential_passwords', credential_passwords);
          setValue('diff_mode', prompt.diff_mode);
          prompt?.execution_environment &&
            setValue('execution_environment', prompt.execution_environment.id);
          setValue('extra_vars', prompt?.extra_vars);
          setValue('forks', prompt?.forks);
          setValue(
            'instance_groups',
            prompt.instance_groups?.map(({ id }) => id)
          );
          prompt.inventory?.id && setValue('inventory', prompt.inventory?.id);
          setValue('job_slice_count', prompt.job_slice_count);
          setValue('job_tags', prompt.job_tags?.map((tag) => tag.name).join(','));
          setValue('job_type', prompt.job_type);
          setValue('limit', prompt.limit);
          setValue('scm_branch', prompt.scm_branch);
          setValue('skip_tags', prompt.skip_tags?.map((tag) => tag.name).join(','));
          setValue('timeout', prompt.timeout);
          setValue('verbosity', prompt.verbosity);
        }
        if (labelPayload.length > 0) {
          setValue('labels', labelPayload);
        }

        if (config.survey_enabled && jobType === 'job_templates') {
          const extraVarsObj = prompt?.extra_vars
            ? (JSON.parse(yamlToJson(prompt?.extra_vars)) as object)
            : {};
          setValue('extra_vars', {
            ...extraVarsObj,
            ...survey,
          });
        }

        if (jobType === 'workflow_job_templates') {
          const extraVarsObj = prompt?.extra_vars
            ? (JSON.parse(yamlToJson(prompt?.extra_vars)) as object)
            : {};

          payload = {
            ...payload,
            extra_vars: { ...extraVarsObj, ...survey },
          };
        }

        if (config?.passwords_needed_to_start?.length > 0) {
          payload = {
            ...payload,
            credential_passwords: { ...credential_passwords },
          };
        }

        const job = await postRequest(awxAPI`/${jobType}/${resourceId}/launch/`, payload);
        if (job) {
          void navigate(getJobOutputUrl(job));
        }
      } catch (err) {
        alertToaster.addAlert({
          variant: 'danger',
          title: t('Failure to launch'),
          children: err instanceof Error && err.message,
        });
      }
    }
  };
  return (
    <LaunchWizard
      template={template}
      config={config}
      handleSubmit={handleSubmit}
      jobType={jobType}
    />
  );
}

export function LaunchWizard({
  template,
  config,
  handleSubmit,
  jobType,
}: Readonly<{
  template: JobTemplate;
  config: LaunchConfiguration;
  handleSubmit: (values: TemplateLaunch) => Promise<void>;
  jobType: string;
}>) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { defaults } = config;
  const readOnlyLabels = defaults?.labels?.map((label) => ({
    ...label,
    isReadOnly: true,
  }));

  const initialValues: { [stepId: string]: Partial<TemplateLaunch> } = {
    nodePromptsStep: {
      resource: template,
      prompt: {
        inventory: defaults.inventory.id ? defaults.inventory : null,
        credentials: defaults?.credentials,
        execution_environment: defaults.execution_environment,
        instance_groups: defaults.instance_groups,
        diff_mode: defaults.diff_mode,
        scm_branch: defaults.scm_branch,
        extra_vars: defaults.extra_vars,
        forks: defaults.forks,
        job_slice_count: defaults.job_slice_count,
        job_tags: parseStringToTagArray(defaults.job_tags),
        job_type: defaults.job_type,
        labels: readOnlyLabels,
        limit: defaults.limit,
        skip_tags: parseStringToTagArray(defaults.skip_tags),
        timeout: defaults.timeout,
        verbosity: defaults.verbosity,
      },
      launch_config: config,
    },
    credential_passwords: {},
    survey: {},
  };

  const steps: PageWizardStep[] = [
    {
      id: 'nodePromptsStep',
      label: t('Prompts'),
      inputs: <PromptStep />,
      hidden: () => shouldHideOtherStep(config),
    },
    {
      id: 'credential_passwords',
      label: t('Credential Passwords'),
      hidden: (wizardValues: Partial<TemplateLaunch>) => {
        const { prompt = {} } = wizardValues;
        if (!prompt && !config) return true;
        const credentials =
          'credentials' in prompt
            ? (wizardValues?.prompt?.credentials as Credential[])
            : (config.defaults.credentials as unknown as Credential[]);

        const launchConfigAsksCredentials = config.ask_credential_on_launch;
        const launchConfigRequiresPasswords = config.passwords_needed_to_start?.length > 0;
        if (!launchConfigAsksCredentials && launchConfigRequiresPasswords) {
          // show step if the template requires passwords but doesn't prompt for credentials
          return false;
        }

        const showCredentialPasswordsStep = credentials?.some((credential: Credential) => {
          if (!credential.inputs) {
            const launchConfigCredential = config.defaults.credentials?.find(
              (defaultCred) => JSON.stringify(defaultCred.id) === JSON.stringify(credential.id)
            );
            return launchConfigCredential && launchConfigCredential?.passwords_needed?.length > 0;
          }

          const passwordInputs = [
            'password',
            'become_password',
            'ssh_key_unlock',
            'vault_password',
          ];
          return passwordInputs.some((inputName) => credential.inputs?.[inputName] === 'ASK');
        });

        return !showCredentialPasswordsStep;
      },
      inputs: <CredentialPasswordsStep<LaunchConfiguration> config={config} />,
    },
    {
      id: 'survey',
      label: t('Survey'),
      hidden: () => !config?.survey_enabled,
      inputs: <SurveyStep jobType={jobType} templateId={template.id.toString()} />,
    },
    {
      id: 'review',
      label: t('Review'),
      element: <TemplateLaunchReviewStep template={template} />,
    },
  ];

  return (
    <PageLayout>
      <PageHeader
        title={t('Prompt on Launch')}
        breadcrumbs={[
          { label: t('Templates'), to: getPageUrl(AwxRoute.Templates) },
          {
            label: template.name,
            to: getPageUrl(AwxRoute.JobTemplateDetails, { params: { id: template.id } }),
          },
        ]}
      />
      <PageWizard<TemplateLaunch>
        steps={steps}
        stepDefaults={initialValues}
        onSubmit={handleSubmit}
        errorAdapter={awxErrorAdapter}
      />
    </PageLayout>
  );
}
