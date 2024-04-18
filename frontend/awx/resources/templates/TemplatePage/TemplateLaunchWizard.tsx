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
import { useGet } from '../../../../common/crud/useGet';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { PageFormCredentialSelect } from '../../../access/credentials/components/PageFormCredentialSelect';
import { PageFormExecutionEnvironmentSelect } from '../../../administration/execution-environments/components/PageFormExecutionEnvironmentSelect';
import { PageFormInstanceGroupSelect } from '../../../administration/instance-groups/components/PageFormInstanceGroupSelect';
import { AwxError } from '../../../common/AwxError';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { awxAPI } from '../../../common/api/awx-utils';
import type { Credential } from '../../../interfaces/Credential';
import type { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import type { Inventory } from '../../../interfaces/Inventory';
import type { JobTemplate } from '../../../interfaces/JobTemplate';
import type { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import type { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useGetJobOutputUrl } from '../../../views/jobs/useGetJobOutputUrl';
import { PageFormInventorySelect } from '../../inventories/components/PageFormInventorySelect';
import { parseStringToTagArray } from '../JobTemplateFormHelpers';
import { useLabelPayload } from '../hooks/useLabelPayload';
import { CredentialPasswordsStep, OtherPromptsStep, TemplateLaunchReviewStep } from './steps';
import { SurveyStep } from '../../../common/SurveyStep';
import { yamlToJson } from '../../../../../framework/utils/codeEditorUtils';

const addSurveyQuestionsToExtraVars = (
  config: LaunchConfiguration,
  extra_vars: string = '',
  formValues: TemplateLaunch,
  setValue: <K extends keyof LaunchPayload>(key: K, value: LaunchPayload[K]) => void
) => {
  let stringValue = '';
  config.variables_needed_to_start.forEach((key, index) => {
    const value = formValues.survey[key];
    if (Array.isArray(value)) {
      const variableNames: { name: string }[] = value as { name: string }[];
      const outputString = variableNames.reduce((acc, { name }) => `${acc},'${name}'`, '').slice(1);
      stringValue += `${key}: [${outputString}]`;
    } else {
      stringValue += `${key}: ${formValues.survey[key] as string}`;
    }

    if (index !== config.variables_needed_to_start.length - 1) {
      stringValue += '\n';
    }
  });

  if (extra_vars.endsWith('\n')) {
    setValue('extra_vars', extra_vars + stringValue);
  } else {
    setValue('extra_vars', extra_vars + '\n' + stringValue);
  }
};

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
  inventory: Inventory;
  credentials: Credential[];
  credential_passwords: { [key: string]: string };
  instance_groups: { id: number; name: string }[];
  execution_environment: ExecutionEnvironment;
  diff_mode: boolean;
  extra_vars: string;
  forks: number;
  job_slice_count: number;
  job_tags: { name: string }[];
  job_type: string;
  labels: { name: string; id?: number }[];
  limit: string;
  scm_branch: string;
  skip_tags: { name: string }[];
  timeout: number;
  verbosity: number;
  survey: { [key: string]: string | string[] | { name: string }[] };
}

interface LaunchPayload {
  credentials: number[];
  credential_passwords: { [key: string]: string };
  diff_mode: boolean;
  execution_environment: number;
  extra_vars: string | { [key: string]: string | string[] | { name: string }[] };
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

export function TemplateLaunchWizard({ jobType }: { jobType: string }) {
  const { t } = useTranslation();

  const postRequest = usePostRequest<Partial<LaunchPayload>, UnifiedJob>();
  const createLabelPayload = useLabelPayload();

  const alertToaster = usePageAlertToaster();
  const getPageUrl = useGetPageUrl();
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
        inventory,
        credentials,
        credential_passwords,
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
          credentials?.map((cred) => cred.id)
        );
        setValue('credential_passwords', credential_passwords);
        setValue('diff_mode', diff_mode);
        setValue('execution_environment', execution_environment?.id);
        setValue('extra_vars', extra_vars);
        setValue('forks', forks);
        setValue(
          'instance_groups',
          instance_groups?.map((ig) => ig.id)
        );
        setValue('inventory', inventory?.id);
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
          addSurveyQuestionsToExtraVars(config, extra_vars, formValues, setValue);
        }

        if (jobType === 'workflow_job_templates') {
          const extraVarsObj = extra_vars ? (JSON.parse(yamlToJson(extra_vars)) as object) : {};

          Object.keys(formValues.survey).forEach((key) => {
            const value = formValues.survey[key];
            if (Array.isArray(value)) {
              const variableNames: { name: string }[] = value as { name: string }[];
              formValues.survey[key] = variableNames.map((k) => k.name);
            }
          });

          payload = {
            ...payload,
            extra_vars: { ...extraVarsObj, ...formValues.survey },
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

  const steps: PageWizardStep[] = [
    {
      id: 'inventory',
      label: t('Inventory'),
      inputs: <PageFormInventorySelect<TemplateLaunch> name="inventory" isRequired />,
      hidden: () => !template.ask_inventory_on_launch,
    },
    {
      id: 'credentials',
      label: t('Credentials'),
      hidden: () => !template.ask_credential_on_launch,
      inputs: (
        <PageFormCredentialSelect<TemplateLaunch>
          name="credentials"
          label={t('Credentials')}
          placeholder={t('Add credentials')}
          labelHelpTitle={t('Credentials')}
          labelHelp={t(
            'Select credentials for accessing the nodes this job will be ran against. You can only select one credential of each type. For machine credentials (SSH), checking "Prompt on launch" without selecting credentials will require you to select a machine credential at run time. If you select credentials and check "Prompt on launch", the selected credential(s) become the defaults that can be updated at run time.'
          )}
          isMultiple
        />
      ),
    },
    {
      id: 'credential-passwords',
      label: t('Credential Passwords'),
      hidden: (wizardValues: Partial<TemplateLaunch>) => {
        const { credentials = [] } = 'credentials' in wizardValues ? wizardValues : config.defaults;

        const launchConfigAsksCredentials = config.ask_credential_on_launch;
        const launchConfigRequiresPasswords = config.passwords_needed_to_start?.length > 0;
        if (!launchConfigAsksCredentials && launchConfigRequiresPasswords) {
          // show step if the template requires passwords but doesn't prompt for credentials
          return false;
        }

        const showCredentialPasswordsStep = credentials.some((credential) => {
          if (!credential.inputs) {
            const launchConfigCredential = config.defaults.credentials.find(
              (defaultCred) => defaultCred.id === credential.id
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
      inputs: <CredentialPasswordsStep config={config} />,
    },
    {
      id: 'execution-environment',
      label: t('Execution Environment'),
      inputs: (
        <PageFormExecutionEnvironmentSelect<TemplateLaunch>
          name="execution_environment.name"
          executionEnvironmentPath="execution_environment"
          executionEnvironmentIdPath="execution_environment.id"
          organizationId={template.organization?.toString() ?? ''}
        />
      ),
      hidden: () => !template.ask_execution_environment_on_launch,
    },
    {
      id: 'instance-groups',
      label: t('Instance Groups'),
      hidden: () => !template.ask_instance_groups_on_launch,
      inputs: (
        <PageFormInstanceGroupSelect<TemplateLaunch>
          name="instance_groups"
          labelHelp={t(`Select the instance groups for this template to run on.`)}
        />
      ),
    },
    {
      id: 'other-prompts',
      label: t('Other prompts'),
      hidden: () => !shouldShowOtherStep(config),
      inputs: <OtherPromptsStep config={config} template={template} />,
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

  const { defaults } = config;

  const readOnlyLabels = defaults?.labels?.map((label) => ({
    ...label,
    isReadOnly: true,
  }));

  const initialValues = {
    inventory: {
      inventory: defaults.inventory.id ? defaults.inventory : null,
    },
    credentials: {
      credentials: defaults.credentials,
    },
    'credential-passwords': {},
    'execution-environment': {
      execution_environment: defaults.execution_environment,
    },
    'instance-groups': {
      instance_groups: defaults.instance_groups,
    },
    'other-prompts': {
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
    survey: {},
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Prompt on Launch')}
        breadcrumbs={[
          { label: t('Templates'), to: getPageUrl(AwxRoute.Templates) },
          {
            label: template.name,
            to: getPageUrl(AwxRoute.JobTemplateDetails, { params: { id: resourceId } }),
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

function shouldShowOtherStep(launchData: LaunchConfiguration) {
  return (
    launchData.ask_job_type_on_launch ||
    launchData.ask_limit_on_launch ||
    launchData.ask_verbosity_on_launch ||
    launchData.ask_tags_on_launch ||
    launchData.ask_skip_tags_on_launch ||
    launchData.ask_variables_on_launch ||
    launchData.ask_scm_branch_on_launch ||
    launchData.ask_diff_mode_on_launch ||
    launchData.ask_labels_on_launch ||
    launchData.ask_forks_on_launch ||
    launchData.ask_job_slice_count_on_launch ||
    launchData.ask_timeout_on_launch
  );
}
