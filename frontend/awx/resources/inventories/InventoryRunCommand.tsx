import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageWizard, useGetPageUrl } from '../../../../framework';
import { AwxRoute } from '../../main/AwxRoutes';
import { awxErrorAdapter } from '../../common/adapters/awxErrorAdapter';
import { useNavigate } from 'react-router-dom';
import { RunCommandCredentialStep, RunCommandDetailStep } from './components/RunCommandSteps';
import { RunCommandWizard } from '../../interfaces/Inventory';
import { postRequest } from '../../../common/crud/Data';
import { awxAPI } from '../../common/api/awx-utils';

export function InventoryRunCommand() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const navigate = useNavigate();

  const onCancel = () => navigate(-1);

  const handleSubmit = async (data: RunCommandWizard) => {
    const runCommandObj = {
      ...data,
      verbosity: data.verbosity,
      forks: data.forks,
      credential: data.credentials,
    };
    await postRequest(awxAPI`/ad_hoc_commands/`, runCommandObj);
  };

  const steps = [
    {
      id: 'details',
      label: t('Details'),
      inputs: <RunCommandDetailStep />,
    },
    {
      id: 'credentials',
      label: t('Credential'),
      inputs: <RunCommandCredentialStep />,
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
    credentials: {
      credentials: 1,
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
