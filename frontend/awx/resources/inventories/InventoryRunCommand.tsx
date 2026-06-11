import {
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { useURLSearchParams } from '@ansible/ansible-ui-framework/components/useURLSearchParams';
import { postRequest } from '@ansible/common-ui/crud/Data';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { awxErrorAdapter } from '../../common/adapters/awxErrorAdapter';
import { awxAPI } from '../../common/api/awx-utils';
import { Inventory, RunCommandWizard } from '../../interfaces/Inventory';
import { AwxRoute } from '../../main/AwxRoutes';
import {
  RunCommandCredentialPasswordsStep,
  RunCommandCredentialStep,
  RunCommandDetailStep,
  RunCommandExecutionEnvionment,
  RunCommandReviewStep,
  shouldHideCredentialPasswordsStep,
} from './components/RunCommandSteps';

export function InventoryRunCommand() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { id } = useParams();
  const [searchParams] = useURLSearchParams();
  let limit = searchParams.get('limit') || 'all';
  const storage = searchParams.get('storage');

  if (storage) {
    limit = localStorage.getItem('runCommandActionSelectedItems') || limit;
  }

  const pageNavigate = usePageNavigate();
  const { data: inventory } = useGet<Inventory>(awxAPI`/inventories/${id as string}/`);

  const navigate = useNavigate();

  const onCancel = () => void navigate(-1);

  const handleSubmit = async (data: RunCommandWizard) => {
    const eeId = data.execution_environment;
    const runCommandObj: Record<string, unknown> = {
      module_name: data.module_name,
      module_args: data.module_args,
      verbosity: data.verbosity,
      limit: data.limit,
      forks: data.forks,
      diff_mode: data.diff_mode,
      become_enabled: data.become_enabled,
      extra_vars: data.extra_vars,
      credential: data.credential,
      execution_environment: eeId,
    };

    // Include credential passwords at the top level of the request payload
    if (data.credential_passwords && Object.keys(data.credential_passwords).length > 0) {
      Object.entries(data.credential_passwords).forEach(([key, value]) => {
        runCommandObj[key] = value;
      });
    }

    const result: { id: string } = await postRequest(
      awxAPI`/inventories/${id ?? ''}/ad_hoc_commands/`,
      runCommandObj
    );
    pageNavigate(AwxRoute.JobOutput, { params: { id: result.id, job_type: 'command' } });
  };

  const steps: PageWizardStep[] = [
    {
      id: 'details',
      label: t('Details'),
      inputs: <RunCommandDetailStep />,
    },
    {
      id: 'execution_environment',
      label: t('Execution Environment'),
      inputs: (
        <RunCommandExecutionEnvionment
          orgId={inventory?.summary_fields.organization.id.toString() ?? ''}
        />
      ),
    },
    {
      id: 'credential',
      label: t('Credential'),
      inputs: <RunCommandCredentialStep />,
    },
    {
      id: 'credential_passwords',
      label: t('Credential Passwords'),
      inputs: <RunCommandCredentialPasswordsStep />,
      hidden: (wizardData: Partial<RunCommandWizard>) =>
        shouldHideCredentialPasswordsStep(wizardData),
    },
    {
      id: 'review',
      label: t('Review'),
      inputs: <RunCommandReviewStep />,
    },
  ];

  const initialValues = {
    details: {
      module_name: '',
      module_args: '',
      verbosity: 0,
      limit,
      forks: 0,
      diff_mode: false,
      become_enabled: false,
      extra_vars: '',
    },
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Run command')}
        breadcrumbs={[
          { label: t('Inventories'), to: getPageUrl(AwxRoute.Inventories) },
          { label: t('Run command') },
        ]}
      />
      <PageWizard<RunCommandWizard>
        steps={steps}
        singleColumn={false}
        onCancel={onCancel}
        stepDefaults={initialValues}
        onSubmit={handleSubmit}
        errorAdapter={awxErrorAdapter}
      />
    </PageLayout>
  );
}
