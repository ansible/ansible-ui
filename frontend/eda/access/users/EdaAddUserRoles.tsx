import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageLayout,
  PageHeader,
  PageWizard,
  PageWizardStep,
  usePageNavigate,
  LoadingPage,
  useGetPageUrl,
} from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaRoute } from '../../main/EdaRoutes';
import { EdaSelectResourceTypeStep } from '../common/EdaRolesWizardSteps/EdaSelectResourceTypeStep';
import { EdaUser } from '../../interfaces/EdaUser';
import { EdaSelectResourcesStep } from '../common/EdaRolesWizardSteps/EdaSelectResourcesStep';

interface WizardFormValues {
  resourceType: string;
  resources: number[];
  roles: number[];
}

export function EdaAddUserRoles() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const { data: user, isLoading } = useGet<EdaUser>(edaAPI`/users/${params.id ?? ''}/`);

  if (isLoading || !user) return <LoadingPage />;

  const steps: PageWizardStep[] = [
    {
      id: 'resource-type',
      label: t('Select a resource type'),
      inputs: <EdaSelectResourceTypeStep />,
    },
    {
      id: 'resources',
      label: t('Select resources'),
      inputs: <EdaSelectResourcesStep />,
    },
    { id: 'review', label: t('Review'), element: <div /> },
  ];

  const onSubmit = (/*data: WizardFormValues*/) => {
    // TODO
    return Promise.resolve();
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Add roles')}
        breadcrumbs={[
          { label: t('Users'), to: getPageUrl(EdaRoute.Users) },
          {
            label: user?.username,
            to: getPageUrl(EdaRoute.UserDetails, { params: { id: user?.id } }),
          },
          {
            label: t('Roles'),
            to: getPageUrl(EdaRoute.UserRoles, { params: { id: user?.id } }),
          },
          { label: t('Add roles') },
        ]}
      />
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
