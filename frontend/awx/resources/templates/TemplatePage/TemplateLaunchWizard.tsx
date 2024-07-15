import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
  usePageAlertToaster,
} from '../../../../../framework';
import { yamlToJson } from '../../../../../framework/utils/codeEditorUtils';
import { useGet } from '../../../../common/crud/useGet';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { AwxError } from '../../../common/AwxError';
import { SurveyStep } from '../../../common/SurveyStep';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { awxAPI } from '../../../common/api/awx-utils';
import type { JobTemplate } from '../../../interfaces/JobTemplate';
import type { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import type { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useGetJobOutputUrl } from '../../../views/jobs/useGetJobOutputUrl';
import { parseStringToTagArray } from '../JobTemplateFormHelpers';
import { useLabelPayload } from '../hooks/useLabelPayload';
import { TemplateLaunchPromptStep } from './steps/TemplateLaunchPromptStep';
import { PromptFormValues } from '../WorkflowVisualizer/types';
import { CredentialPasswordsStep, TemplateLaunchReviewStep } from './steps';
import { requestGet } from '../../../../common/crud/Data';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { RequestError } from '../../../../common/crud/RequestError';
import { Credential } from '../../../interfaces/Credential';

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
  resource: JobTemplate;
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
      const {
        credential_passwords = {},
        prompt: {
          inventory,
          credentials,
          instance_groups,
          execution_environment,
          diff_mode,
          scm_branch,
          extra_vars,
          forks,
          job_slice_count,
          job_tags,
          job_type,
          labels,
          limit,
          skip_tags,
          timeout,
          verbosity,
        },
        survey,
      } = formValues;

      try {
        const labelPayload = await createLabelPayload(labels || [], template);

        let payload: Partial<LaunchPayload> = {};
        const setValue = <K extends LaunchPayloadProperty>(key: K, value: LaunchPayload[K]) => {
          const isValid = typeof value !== 'undefined' && value !== null;
          if (!isValid) {
            return;
          }

          if (jobType === 'workflow_job_templates') {
            if (
              config[formFieldToLaunchConfig[key as keyof unknown] as keyof LaunchConfiguration] ||
              config.survey_enabled
            ) {
              payload[key] = value;
            }
            return;
          }

          payload[key] = value;
        };

        setValue(
          'credentials',
          credentials?.map((cred) => Number(cred.id))
        );
        setValue('credential_passwords', credential_passwords);
        setValue('diff_mode', diff_mode);
        execution_environment && setValue('execution_environment', execution_environment);
        setValue('extra_vars', extra_vars);
        setValue('forks', forks);
        setValue(
          'instance_groups',
          instance_groups?.map(({ id }) => id)
        );
        inventory?.id && setValue('inventory', inventory?.id);
        setValue('job_slice_count', job_slice_count);
        setValue('job_tags', job_tags?.map((tag) => tag.name).join(','));
        setValue('job_type', job_type);
        setValue('limit', limit);
        setValue('scm_branch', scm_branch);
        setValue('skip_tags', skip_tags?.map((tag) => tag.name).join(','));
        setValue('timeout', timeout);
        setValue('verbosity', verbosity);

        if (labelPayload.length > 0) {
          setValue('labels', labelPayload);
        }

        if (config.survey_enabled && jobType === 'job_templates') {
          const extraVarsObj = extra_vars ? (JSON.parse(yamlToJson(extra_vars)) as object) : {};
          setValue('extra_vars', {
            ...extraVarsObj,
            ...survey,
          });
        }

        if (jobType === 'workflow_job_templates') {
          const extraVarsObj = extra_vars ? (JSON.parse(yamlToJson(extra_vars)) as object) : {};

          payload = {
            ...payload,
            extra_vars: { ...extraVarsObj, ...survey },
          };
        }

        const job = await postRequest(awxAPI`/${jobType}/${resourceId}/launch/`, payload);
        if (job) {
          navigate(getJobOutputUrl(job));
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
}: {
  template: JobTemplate;
  config: LaunchConfiguration;
  handleSubmit: (values: TemplateLaunch) => Promise<void>;
  jobType: string;
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { defaults } = config;
  const readOnlyLabels = defaults?.labels?.map((label) => ({
    ...label,
    isReadOnly: true,
  }));

  const initialValues = {
    resource: template,
    credential_passwords: {},
    prompt: {
      inventory: defaults.inventory.id ? defaults.inventory : null,
      credentials: defaults?.credentials,
      execution_environment: defaults.execution_environment?.id,
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
    survey: {},
  };
  const credentialVaultId = function (
    selectedCredential:
      | Credential
      | {
          id: number;
          name: string;
          credential_type: number;
          passwords_needed?: string[];
          vault_id?: string;
        }
  ) {
    if (
      selectedCredential &&
      'inputs' in selectedCredential &&
      'vault_id' in selectedCredential['inputs']
    ) {
      return selectedCredential.inputs.vault_id;
    }
    if (selectedCredential && 'vault_id' in selectedCredential) {
      return selectedCredential.vault_id;
    }
    return undefined;
  };

  const steps: PageWizardStep[] = [
    {
      id: 'nodePromptsStep',
      label: t('Prompts'),
      inputs: <TemplateLaunchPromptStep defaultValues={initialValues} />,
      hidden: () => !template.ask_inventory_on_launch,
      validate: async (formData) => {
        const missingCredentialTypes: string[] = [];
        await requestGet<AwxItemsResponse<Credential>>(
          awxAPI`/job_templates/${template.id?.toString()}/credentials/`
        ).then(({ results: originalCredentials }) => {
          const {
            prompt: { credentials: selectedCredentials },
          } = formData as TemplateLaunch;
          if (originalCredentials.length > 0 && selectedCredentials) {
            originalCredentials.forEach((originalCredential) => {
              if (
                !selectedCredentials.find((selectedCredential) => {
                  const selectedCredentialVaultID = credentialVaultId(selectedCredential);
                  const originalCredentialVaultID = credentialVaultId(originalCredential);
                  return (
                    (selectedCredential?.credential_type === originalCredential?.credential_type &&
                      !selectedCredentialVaultID &&
                      !originalCredentialVaultID) ||
                    (originalCredentialVaultID &&
                      selectedCredentialVaultID === originalCredentialVaultID)
                  );
                })
              ) {
                missingCredentialTypes.push(
                  originalCredential?.inputs?.vault_id
                    ? `${originalCredential?.summary_fields.credential_type.name} | ${originalCredential.inputs.vault_id}`
                    : originalCredential?.summary_fields.credential_type.name
                );
              }
            });
          }
          if (missingCredentialTypes.length > 0) {
            const errors = {
              __all__: [
                t(
                  `Job Template default credentials must be replaced with one of the same type.  Please select a credential for the following types in order to proceed: ${missingCredentialTypes.join(
                    ', '
                  )}`
                ),
              ],
            };
            throw new RequestError('', '', 400, '', errors);
          }

          return undefined;
        });
      },
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
        defaultValue={initialValues}
        onSubmit={handleSubmit}
        errorAdapter={awxErrorAdapter}
      />
    </PageLayout>
  );
}
