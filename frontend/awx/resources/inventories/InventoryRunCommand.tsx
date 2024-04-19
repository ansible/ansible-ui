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
  RunCommandReviewStep,
} from './components/RunCommandSteps';
import { RunCommandWizard } from '../../interfaces/Inventory';
import { postRequest } from '../../../common/crud/Data';
import { awxAPI } from '../../common/api/awx-utils';

export function InventoryRunCommand() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { id } = useParams();
  const pageNavigate = usePageNavigate();

  const navigate = useNavigate();

  const onCancel = () => navigate(-1);

  const handleSubmit = async (data: RunCommandWizard) => {
    const runCommandObj = {
      ...data,
      verbosity: data.verbosity,
      forks: data.forks,
      credential: data.credentials[0].id,
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
      module: '',
      module_args: '',
      verbosity: 0,
      limit: 'all',
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
