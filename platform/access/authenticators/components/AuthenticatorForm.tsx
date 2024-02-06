import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LoadingPage,
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
  usePageAlertToaster,
  usePageNavigate,
} from '../../../../framework';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { postRequest } from '../../../../frontend/common/crud/Data';
import { genericErrorAdapter } from '../../../../framework/PageForm/genericErrorAdapter';
import { AuthenticatorTypeStep } from './steps/AuthenticatorTypeStep';
import { AuthenticatorDetailsStep } from './steps/AuthenticatorDetailsStep';
import { AuthenticatorMappingStep } from './steps/AuthenticatorMappingStep';
import { AuthenticatorMappingOrderStep } from './steps/AuthenticatorMappingOrderStep';
import { AuthenticatorReviewStep } from './steps/AuthenticatorReviewStep';
import { Authenticator, AuthenticatorTypeEnum } from '../../../interfaces/Authenticator';
import { AuthenticatorMapType } from '../../../interfaces/AuthenticatorMap';
import type {
  AuthenticatorPlugins,
  AuthenticatorPlugin,
} from '../../../interfaces/AuthenticatorPlugin';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { gatewayAPI } from '../../../api/gateway-api-utils';

interface Configuration {
  [key: string]: string | string[] | { [k: string]: string };
}

interface MapBase {
  map_type: AuthenticatorMapType;
  name: string;
  revoke: boolean;
  order?: number;
  organization?: PlatformOrganization;
  team?: PlatformTeam;
}
interface MapAlways extends MapBase {
  trigger: 'always';
}
interface MapNever extends MapBase {
  trigger: 'never';
}
interface MapGroups extends MapBase {
  trigger: 'groups';
  conditional: 'or' | 'and';
  groups_value: { name: string }[];
}
interface MapAttributes extends MapBase {
  trigger: 'attributes';
  conditional: 'or' | 'and';
  criteria: string;
  criteria_conditional: 'contains' | 'matches' | 'ends_with' | 'equals' | 'in';
  criteria_value: string;
}

export type AuthenticatorMapValues = MapAlways | MapNever | MapGroups | MapAttributes;

export interface AuthenticatorFormValues {
  name: string;
  enabled: boolean;
  create_objects: boolean;
  users_unique: boolean;
  remove_users: boolean;
  configuration: Configuration;
  type: AuthenticatorTypeEnum;
  order: number;
  mappings: AuthenticatorMapValues[];
}

type Errors =
  | {
      [key: string]: string;
    }
  | undefined;

export function CreateAuthenticator() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const alertToaster = usePageAlertToaster();
  const pageNavigate = usePageNavigate();

  const { data: plugins } = useGet<AuthenticatorPlugins>(gatewayAPI`/authenticator_plugins`);

  const handleSubmit = async (values: AuthenticatorFormValues) => {
    const { name, type, configuration, mappings } = values;
    const plugin = plugins?.authenticators.find((a) => a.type === type);
    if (!plugins || !plugin) {
      return;
    }
    const request = postRequest(gatewayAPI`/authenticators/`, {
      name,
      type,
      configuration: formatConfiguration(configuration, plugin),
    });

    try {
      const authenticator = await request;

      const mapRequests = mappings.map((map, index) => {
        const data = {
          name: map.name,
          map_type: map.map_type,
          revoke: map.revoke,
          order: index + 1,
          authenticator: (authenticator as Authenticator).id,
          triggers: buildTriggers(map),
          organization: ['organization', 'team'].includes(map.map_type)
            ? map.organization?.name
            : null,
          team: ['team'].includes(map.map_type) ? map.team?.name : null,
        };
        return postRequest(gatewayAPI`/authenticator_maps/`, data);
      });
      await Promise.all(mapRequests);
      pageNavigate(PlatformRoute.AuthenticatorDetails, {
        params: { id: (authenticator as Authenticator).id },
      });
    } catch (err) {
      let children: ReactNode | string | string[];
      if (err && typeof err === 'object' && 'body' in err) {
        const errorMessages = err.body as Errors;
        if (errorMessages) {
          children = Object.keys(errorMessages).map((key) => (
            <p key="key">{`${key}: ${errorMessages[key]}`}</p>
          ));
        }
      } else if (err instanceof Error && err.message) {
        children = err.message;
      }
      alertToaster.addAlert({
        variant: 'danger',
        title: t('Error saving authenticator'),
        children,
      });
    }
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
    {
      id: 'mapping',
      label: t('Mapping'),
      inputs: <AuthenticatorMappingStep />,
    },
    {
      id: 'order',
      label: t('Mapping order'),
      inputs: <AuthenticatorMappingOrderStep />,
    },
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
      <PageWizard<AuthenticatorFormValues>
        steps={steps}
        defaultValue={initialValues}
        onSubmit={handleSubmit}
        errorAdapter={genericErrorAdapter}
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

function buildTriggers(map: AuthenticatorMapValues) {
  const triggers: { [k: string]: string | object } = {};
  let key;
  switch (map.trigger) {
    case 'always':
      triggers.always = {};
      break;
    case 'never':
      triggers.never = {};
      break;
    case 'groups':
      key = `has_${map.conditional}`; // has_or or has_and
      triggers.groups = {
        [key]: map.groups_value.map(({ name }) => name),
      };
      break;
    case 'attributes':
      key = map.criteria_conditional;
      triggers.attributes = {
        join_condition: map.conditional || 'or',
        [map.criteria]: {
          [key]: key === 'in' ? [map.criteria_value?.split(',')] : map.criteria_value,
        },
      };
      break;
  }

  return triggers;
}
