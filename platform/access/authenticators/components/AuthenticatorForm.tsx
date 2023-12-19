import { useTranslation } from 'react-i18next';
import {
  LoadingPage,
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  PageFormGrid,
  useGetPageUrl,
  PageFormSelect,
  // usePageAlertToaster,
} from '../../../../framework';
import { PlatformRoute } from '../../../PlatformRoutes';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { awxErrorAdapter } from '../../../../frontend/awx/adapters/awxErrorAdapter';
import { AuthenticatorDetailsStep } from './steps/AuthenticatorDetailsStep';
import { AuthenticatorTypeEnum } from '../../../interfaces/Authenticator';
import type { AuthenticatorPlugins } from '../../../interfaces/AuthenticatorPlugin';

export interface AuthenticatorForm {
  name: string;
  enabled: boolean;
  create_objects: boolean;
  users_unique: boolean;
  remove_users: boolean;
  configuration: {
    [key: string]: string | string[] | { [k: string]: string };
  };
  type: AuthenticatorTypeEnum;
  order: number;
}

export function CreateAuthenticator() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const { data: plugins } = useGet<AuthenticatorPlugins>(`/api/gateway/v1/authenticator_plugins`);

  const handleSubmit = async (formValues: AuthenticatorForm) => {
    console.log(formValues);
  };

  if (!plugins) {
    return <LoadingPage />;
  }

  const steps: PageWizardStep[] = [
    {
      id: 'type',
      label: t('Authentication type'),
      inputs: (
        <PageFormGrid isVertical>
          <PageFormSelect
            name="type"
            label={t('Authentication setting')}
            options={[
              { value: AuthenticatorTypeEnum.Local, label: t('Local') },
              { value: AuthenticatorTypeEnum.LDAP, label: t('LDAP') },
              { value: AuthenticatorTypeEnum.SAML, label: t('SAML') },
              { value: AuthenticatorTypeEnum.Keycloak, label: t('Keycloak') },
            ]}
            isRequired
          />
        </PageFormGrid>
      ),
      hidden: () => false, // TODO hide step when in edit mode
    },
    {
      id: 'details',
      label: t('Authentication details'),
      inputs: <AuthenticatorDetailsStep plugins={plugins} />,
    },
    {
      id: 'mapping',
      label: t('Mapping'),
      inputs: <div />,
    },
    {
      id: 'order',
      label: t('Mapping order'),
      inputs: <div />,
    },
    {
      id: 'review',
      label: t('Review'),
      element: <div />,
    },
  ];

  const initialValues = {
    type: {
      type: AuthenticatorTypeEnum.Local,
    },
    details: {
      name: '',
      configuration: {},
    },
    mapping: {},
    order: {},
    // enabled: true,
    // create_objects: false,
    // users_unique: false,
    // remove_users: false,
    // order: 1,
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Authentication')}
        breadcrumbs={[
          { label: t('Authentication'), to: getPageUrl(PlatformRoute.Authenticators) },
          { label: t('Create Authentication') },
        ]}
      />
      <PageWizard<AuthenticatorForm>
        steps={steps}
        defaultValue={initialValues}
        onSubmit={handleSubmit}
        errorAdapter={awxErrorAdapter}
        disableGrid
      />
    </PageLayout>
  );
}
