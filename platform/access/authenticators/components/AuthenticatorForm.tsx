import { useTranslation } from 'react-i18next';
import {
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
} from '../../../../framework';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { genericErrorAdapter } from '../../../../framework/PageForm/genericErrorAdapter';
import { AuthenticatorTypeStep } from './steps/AuthenticatorTypeStep';
import { AuthenticatorDetailsStep } from './steps/AuthenticatorDetailsStep';
import { AuthenticatorMappingStep } from './steps/AuthenticatorMappingStep';
import { AuthenticatorMappingOrderStep } from './steps/AuthenticatorMappingOrderStep';
import { AuthenticatorReviewStep } from './steps/AuthenticatorReviewStep';
import { Authenticator, AuthenticatorTypeEnum } from '../../../interfaces/Authenticator';
import { AuthenticatorMapType } from '../../../interfaces/AuthenticatorMap';
import type {
  AuthenticatorPlugin,
  AuthenticatorPlugins,
} from '../../../interfaces/AuthenticatorPlugin';
import type { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import type { PlatformTeam } from '../../../interfaces/PlatformTeam';

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

interface AuthenticatorFormProps {
  handleSubmit: (values: AuthenticatorFormValues) => Promise<void>;
  plugins: AuthenticatorPlugins;
  authenticator?: Authenticator;
}

export function AuthenticatorForm(props: AuthenticatorFormProps) {
  const { plugins, authenticator } = props;
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const steps: PageWizardStep[] = [
    {
      id: 'type',
      label: t('Authentication type'),
      inputs: <AuthenticatorTypeStep plugins={plugins} />,
      hidden: () => !!authenticator,
    },
    {
      id: 'details',
      label: t('Authentication details'),
      inputs: <AuthenticatorDetailsStep plugins={plugins} authenticator={authenticator} />,
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
      element: <AuthenticatorReviewStep plugins={plugins} authenticator={authenticator} />,
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
  if (authenticator) {
    const plugin = plugins.authenticators.find((plugin) => plugin.type === authenticator.type);
    initialValues.type = {
      type: authenticator.type,
    };
    initialValues.details = {
      name: authenticator.name,
      configuration: {},
    };

    plugin?.configuration_schema.forEach((field) => {
      initialValues.details.configuration[field.name] = authenticator.configuration[field.name];
    });
  }

  return (
    <PageLayout>
      <PageHeader
        title={authenticator ? t('Edit Authentication') : t('Create Authentication')}
        breadcrumbs={[
          { label: t('Authentication'), to: getPageUrl(PlatformRoute.Authenticators) },
          { label: t('Create Authentication') },
        ]}
      />
      <PageWizard<AuthenticatorFormValues>
        steps={steps}
        defaultValue={initialValues}
        onSubmit={props.handleSubmit}
        errorAdapter={genericErrorAdapter}
        disableGrid
      />
    </PageLayout>
  );
}

export function formatConfiguration(values: Configuration, plugin: AuthenticatorPlugin) {
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

export function buildTriggers(map: AuthenticatorMapValues) {
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
