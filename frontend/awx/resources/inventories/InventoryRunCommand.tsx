import { useTranslation } from 'react-i18next';
import {
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { AwxRoute } from '../../main/AwxRoutes';
import { awxErrorAdapter } from '../../common/adapters/awxErrorAdapter';
import { useNavigate, useParams } from 'react-router-dom';
import {
  RunCommandCredentialStep,
  RunCommandDetailStep,
  RunCommandExecutionEnvionment,
  RunCommandReviewStep,
} from './components/RunCommandSteps';
import { Inventory, RunCommandWizard } from '../../interfaces/Inventory';
import { postRequest } from '../../../common/crud/Data';
import { awxAPI } from '../../common/api/awx-utils';
import { useGet } from '../../../common/crud/useGet';
import { useURLSearchParams } from '../../../../framework/components/useURLSearchParams';

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

  const onCancel = () => navigate(-1);

  const handleSubmit = async (data: RunCommandWizard) => {
    const runCommandObj = {
      ...data,
      verbosity: data.verbosity,
      forks: data.forks,
      credential: data.credentialIdPath,
      execution_environment: data.execution_environment.id,
    };
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
        defaultValue={initialValues}
        onSubmit={handleSubmit}
        errorAdapter={awxErrorAdapter}
      />
    </PageLayout>
  );
}
