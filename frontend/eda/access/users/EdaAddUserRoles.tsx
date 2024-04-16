import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageLayout,
  PageHeader,
  PageWizard,
  PageWizardStep,
  usePageNavigate,
  LoadingPage,
} from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaRoute } from '../../main/EdaRoutes';
import { EdaSelectResourceTypeStep } from '../roles/components/EdaSelectResourceTypeStep';
import { EdaUser } from '../../interfaces/EdaUser';

interface WizardFormValues {
  resourceType: string;
  resources: number[];
  roles: number[];
}

export function EdaAddUserRoles() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const { data: user, isLoading } = useGet<EdaUser>(edaAPI`/users/${params.id ?? ''}/`);

  if (isLoading || !user) return <LoadingPage />;

  const steps: PageWizardStep[] = [
    {
      id: 'resource-type',
      label: t('Select a resource type'),
      inputs: <EdaSelectResourceTypeStep />,
    },
    { id: 'review', label: t('Review'), element: <div /> },
  ];

  const onSubmit = (/*data: WizardFormValues*/) => {
    // TODO
    return Promise.resolve();
  };

  return (
    <PageLayout>
      <PageHeader title={t('Add roles')} />
      <PageWizard<WizardFormValues>
        steps={steps}
        onSubmit={onSubmit}
        onCancel={() => {
          pageNavigate(EdaRoute.UserDetails, { params: { id: user?.id } });
        }}
      />
    </PageLayout>
  );
}
