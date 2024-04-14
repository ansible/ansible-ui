import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageWizard, useGetPageUrl } from '../../../../framework';
import { AwxRoute } from '../../main/AwxRoutes';
import { awxErrorAdapter } from '../../common/adapters/awxErrorAdapter';
import { useNavigate } from 'react-router-dom';
import { PageFormCredentialSelect } from '../../access/credentials/components/PageFormCredentialSelect';
import { RunCommandDetailStep } from './components/RunCommandDetailStep';

export function InventoryRunCommand() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const navigate = useNavigate();

  const onCancel = () => navigate(-1);

  const handleSubmit = async () => {

  }

  const steps = [
    {
      id: 'details',
      label: t('Details'),
      inputs: <RunCommandDetailStep />,
    },
    {
      id: 'credential',
      label: t('Credential'),
      inputs: (
        <PageFormCredentialSelect
          name="prompt.credentials"
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
  ];

  const initialValues = {
    module: '',
    arguments: '',
    verbosity: 0,
    limit: 'all',
    fork: 0,
    diff_mode: false,
    become_enabled: false,
    extra_vars: '---\n',
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
      <PageWizard
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
