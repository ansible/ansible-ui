import { useTranslation } from 'react-i18next';
import {
  LoadingPage,
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
} from '../../../../framework';
import { PlatformRoute } from '../../../PlatformRoutes';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { postRequest } from '../../../../frontend/common/crud/Data';
import { awxErrorAdapter } from '../../../../frontend/awx/adapters/awxErrorAdapter';
import { AuthenticatorTypeStep } from './steps/AuthenticatorTypeStep';
import { AuthenticatorDetailsStep } from './steps/AuthenticatorDetailsStep';
// import { AuthenticatorMappingStep } from './steps/AuthenticatorMappingStep';
import { AuthenticatorReviewStep } from './steps/AuthenticatorReviewStep';
import { AuthenticatorTypeEnum } from '../../../interfaces/Authenticator';
import type {
  AuthenticatorPlugins,
  AuthenticatorPlugin,
} from '../../../interfaces/AuthenticatorPlugin';
import { gatewayAPI } from '../../../api/gateway-api-utils';

interface Configuration {
  [key: string]: string | string[] | { [k: string]: string };
}

export interface AuthenticatorForm {
  name: string;
  enabled: boolean;
  create_objects: boolean;
  users_unique: boolean;
  remove_users: boolean;
  configuration: Configuration;
  type: AuthenticatorTypeEnum;
  order: number;
}

export function CreateAuthenticator() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const { data: plugins } = useGet<AuthenticatorPlugins>(gatewayAPI`/v1/authenticator_plugins`);

  const handleSubmit = async (values: AuthenticatorForm) => {
    const { name, type, configuration } = values;
    const plugin = plugins?.authenticators.find((a) => a.type === type);
    if (!plugins || !plugin) {
      return;
    }
    const request = postRequest(gatewayAPI`/v1/authenticators/`, {
      name,
      type,
      configuration: formatConfiguration(configuration, plugin),
    });

    await Promise.all([request]);
  };

  if (!plugins) {
    return <LoadingPage />;
  }

  const steps: PageWizardStep[] = [
    {
      id: 'type',
      label: t('Authentication type'),
      inputs: <AuthenticatorTypeStep plugins={plugins} />,
      hidden: () => false, // TODO hide step when in edit mode
    },
    {
      id: 'details',
      label: t('Authentication details'),
      inputs: <AuthenticatorDetailsStep plugins={plugins} />,
    },
    // TODO
    // {
    //   id: 'mapping',
    //   label: t('Mapping'),
    //   inputs: <AuthenticatorMappingStep plugins={plugins} />,
    // },
    // {
    //   id: 'order',
    //   label: t('Mapping order'),
    //   inputs: <div />,
    // },
    {
      id: 'review',
      label: t('Review'),
      element: <AuthenticatorReviewStep plugins={plugins} />,
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

function formatConfiguration(values: Configuration, plugin: AuthenticatorPlugin) {
  const formatted: { [k: string]: string | object | [] } = {};
  plugin.configuration_schema.map((definition) => {
    const key = definition.name;
    const value = values[key] as string;
    if (!values[key]) {
      return;
    }
    switch (definition.type) {
      case 'URLListField':
        formatted[key] = value.split(',');
        return;
      case 'JSONField':
      case 'DictField':
      case 'ListField':
      case 'LDAPConnectionOptions':
      case 'LDAPSearchField':
      case 'UserAttrMap':
        formatted[key] = JSON.parse(value) as object | [];
        return;
      case 'CharField':
      case 'URLField':
      case 'ChoiceField':
      case 'DNField':
      case 'PublicCert':
      case 'PrivateKey':
      default:
        formatted[key] = value;
        return;
    }
  });

  return formatted;
}
