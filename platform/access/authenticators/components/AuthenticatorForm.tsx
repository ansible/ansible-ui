import { useTranslation } from 'react-i18next';
import {
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
} from '../../../../framework';
import { Authenticator, AuthenticatorTypeEnum } from '../../../interfaces/Authenticator';
import { AuthenticatorMap, AuthenticatorMapType } from '../../../interfaces/AuthenticatorMap';
import type {
  AuthenticatorPlugin,
  AuthenticatorPlugins,
} from '../../../interfaces/AuthenticatorPlugin';
import type { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { authenticatorErrorAdapter } from './authenticatorErrorAdapter';
import { AuthenticatorDetailsStep, validateDetailsStep } from './steps/AuthenticatorDetailsStep';
import { AuthenticatorMappingOrderStep } from './steps/AuthenticatorMappingOrderStep';
import { AuthenticatorMappingStep, validateMappingStep } from './steps/AuthenticatorMappingStep';
import { AuthenticatorReviewStep } from './steps/AuthenticatorReviewStep';
import { AuthenticatorTypeStep } from './steps/AuthenticatorTypeStep';

export interface Configuration {
  [key: string]: boolean | string | string[] | { [k: string]: string };
}

interface MapBase {
  map_type: AuthenticatorMapType;
  name: string;
  revoke: boolean;
  order?: number;
  organization?: string;
  team?: PlatformTeam;
  role?: string;
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
  mappings?: AuthenticatorMap[];
}

export function AuthenticatorForm(props: AuthenticatorFormProps) {
  const { plugins, authenticator, mappings = [] } = props;
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
      validate: async (formData, wizardData) => {
        return validateDetailsStep(
          formData as { name: string; configuration: Configuration },
          wizardData as AuthenticatorFormValues,
          plugins,
          authenticator
        );
      },
    },
    {
      id: 'mapping',
      label: t('Mapping'),
      inputs: <AuthenticatorMappingStep />,
      validate: (formData, _) => {
        return validateMappingStep(formData, t);
      },
    },
    {
      id: 'order',
      label: t('Mapping order'),
      inputs: <AuthenticatorMappingOrderStep />,
      hidden: (wizardData) =>
        !mappings.length && !(wizardData as { mappings?: object[] }).mappings?.length,
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
      enabled: false,
      create_objects: false,
      remove_users: false,
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
      enabled: authenticator.enabled,
      create_objects: authenticator.create_objects,
      remove_users: authenticator.remove_users,
    };

    const configuration: Configuration = {};

    plugin?.configuration_schema.forEach((field) => {
      let val = authenticator.configuration[field.name];

      if (field.type === 'URLListField' && Array.isArray(val)) {
        val = val.join(',');
      } else if (field.type === 'BooleanField') {
        val = Boolean(val);
      } else if (typeof val !== 'string') {
        val = JSON.stringify(val);
      }
      configuration[field.name] = val;
    });

    initialValues.details.configuration = configuration;

    initialValues.mapping = {
      mappings: mappings
        .sort((a, b) => a.order - b.order)
        .map((mapping) => {
          return {
            map_type: mapping.map_type,
            name: mapping.name,
            revoke: mapping.revoke,
            ...parseTrigger(mapping),
            organization: mapping.organization,
            role: mapping.role,
          };
        }),
    };
  }

  return (
    <PageLayout>
      <PageHeader
        title={
          authenticator
            ? t('Edit {{authenticatorName}}', { authenticatorName: authenticator?.name })
            : t('Create authentication')
        }
        breadcrumbs={[
          { label: t('Authentication Methods'), to: getPageUrl(PlatformRoute.Authenticators) },
          {
            label: authenticator
              ? t('Edit {{authenticatorName}}', { authenticatorName: authenticator?.name })
              : t('Create authentication'),
          },
        ]}
      />
      <PageWizard<AuthenticatorFormValues>
        steps={steps}
        defaultValue={initialValues}
        onSubmit={props.handleSubmit}
        errorAdapter={authenticatorErrorAdapter}
      />
    </PageLayout>
  );
}

export function formatConfiguration(values: Configuration, plugin: AuthenticatorPlugin) {
  const formatted: { [k: string]: boolean | string | object | [] } = {};
  plugin.configuration_schema.forEach((definition) => {
    const key = definition.name;
    const value = values[key] as string;
    if (!values[key] && definition.type !== 'BooleanField') {
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
      case 'BooleanField':
        formatted[key] = Boolean(value);
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

/* converts form field values to AuthenticatorMap triggers format */
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
          [key]: key === 'in' ? map.criteria_value?.split(',') : map.criteria_value,
        },
      };
      break;
  }

  return triggers;
}

/* converts triggers from AuthenticatorMap to form field format */
function parseTrigger(mapping: AuthenticatorMap) {
  const { triggers } = mapping;

  if ('groups' in triggers) {
    const groups = Object.values(triggers.groups).pop() || [];
    return {
      trigger: 'groups',
      conditional: 'has_and' in triggers.groups ? 'and' : 'or',
      groups_value: groups.map((group: string) => ({
        name: group,
      })),
    };
  }
  if ('attributes' in triggers) {
    const { attributes } = triggers;
    const criteria = Object.keys(attributes).find((k) => k !== 'join_condition');
    let criteriaConditional = '';
    let criteriaValue = '';
    if (criteria) {
      const criteriaObj = attributes[criteria];
      criteriaConditional = Object.keys(criteriaObj).pop() || 'contains';
      if (criteriaConditional === 'in') {
        criteriaValue = (criteriaObj as { in: string[] }).in.join(',');
      } else {
        criteriaValue = (criteriaObj as { [k: string]: string })[criteriaConditional];
      }
    }
    return {
      trigger: 'attributes',
      conditional: attributes.join_condition,
      criteria,
      criteria_conditional: criteriaConditional,
      criteria_value: criteriaValue,
    };
  }
  if ('never' in triggers) {
    return { trigger: 'never' };
  }
  return { trigger: 'always' };
}
