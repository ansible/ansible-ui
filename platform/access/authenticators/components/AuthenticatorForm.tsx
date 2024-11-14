import {
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';
import { Authenticator, AuthenticatorTypeEnum } from '../../../interfaces/Authenticator';
import {
  AttributeDefinition,
  AttributesTriggers,
  AuthenticatorMap,
  AuthenticatorMapTriggers,
  AuthenticatorMapType,
} from '../../../interfaces/AuthenticatorMap';
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
interface Attribute {
  attribute: string;
  comparison: 'contains' | 'matches' | 'ends_with' | 'equals' | 'in';
  value: string;
}
interface MapAttributes extends MapBase {
  trigger: 'attributes';
  conditional: 'or' | 'and';
  attributes: Attribute[];
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
            team: mapping.team,
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
        stepDefaults={initialValues}
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

export function buildTriggers(map: AuthenticatorMapValues): AuthenticatorMapTriggers {
  let attributes: AttributesTriggers['attributes'];
  switch (map.trigger) {
    case 'always':
      return {
        always: {},
      };
    case 'never':
      return {
        never: {},
      };
    case 'groups':
      if (map.conditional === 'or') {
        return {
          groups: { has_or: map.groups_value.map(({ name }) => name) },
        };
      } else {
        return {
          groups: { has_and: map.groups_value.map(({ name }) => name) },
        };
      }
    case 'attributes':
      attributes = {
        join_condition: map.conditional || 'or',
      };
      map.attributes.forEach(({ attribute, comparison, value }) => {
        if (!attributes[attribute]) {
          attributes[attribute] = {} as AttributesTriggers['attributes'][typeof attribute];
        }
        (attributes[attribute] as AttributeDefinition)[comparison] =
          comparison === 'in' ? value?.split(',') : value;
      });
      return {
        attributes,
      };
  }
}

/* converts triggers from AuthenticatorMap to form field format */
export function parseTrigger(mapping: AuthenticatorMap) {
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
    const values = {
      trigger: 'attributes',
      conditional: attributes.join_condition,
      attributes: [] as Attribute[],
    };
    Object.keys(attributes).forEach((attribute) => {
      if (attribute !== 'join_condition') {
        Object.entries(attributes[attribute]).forEach(([comparison, value]) => {
          values.attributes.push({
            attribute,
            comparison: comparison as 'contains' | 'matches' | 'ends_with' | 'equals' | 'in',
            value: Array.isArray(value) ? value.join(',') : value,
          });
        });
      }
    });

    return values;
  }
  if ('never' in triggers) {
    return { trigger: 'never' };
  }
  return { trigger: 'always' };
}
