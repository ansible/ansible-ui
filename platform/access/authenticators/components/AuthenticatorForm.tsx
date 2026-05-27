import {
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { AwxItemsResponse } from '@ansible/awx-ui/common/AwxItemsResponse';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { authenticatorErrorAdapter } from './authenticatorErrorAdapter';
import { PageFormAutoMigrateUsersSelect } from './PageFormAutoMigrateUsersSelect';
import { AuthenticatorSubForm } from './steps/AuthenticatorSubForm';
import { AuthenticatorTypeStep } from './steps/AuthenticatorTypeStep';
import { useWatch, useFormContext } from 'react-hook-form';
import { PlatformPageForm } from '../../../common/PlatformPageForm';

export interface Configuration {
  [key: string]: boolean | string | string[] | { [k: string]: string | boolean | object };
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
  auto_migrate_users_to: number | Authenticator[] | null;
}

interface AuthenticatorFormProps {
  handleSubmit: (values: AuthenticatorFormValues) => Promise<void>;
  plugins: AuthenticatorPlugins;
  authenticator?: Authenticator;
}

export function AuthenticatorForm(props: Readonly<AuthenticatorFormProps>) {
  const { plugins, authenticator } = props;
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  let initialValues = {
    type: AuthenticatorTypeEnum.Local,
    name: '',
    configuration: {},
    enabled: false,
    create_objects: false,
    remove_users: false,
    auto_migrate_users_to: null,
  };

  if (authenticator) {
    const plugin = plugins.authenticators.find((plugin) => plugin.type === authenticator.type);

    initialValues = {
      type: authenticator.type,
      name: authenticator.name,
      configuration: {},
      auto_migrate_users_to: null,
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

    initialValues.configuration = configuration;
  }
  const navigate = useNavigate();

  const [configurationFields, setConfigurationFields] = useState<string[]>(() => {
    // Initialize with default type configuration
    const defaultType = authenticator?.type ?? AuthenticatorTypeEnum.Local;
    const plugin = plugins.authenticators.find((p) => p.type === defaultType);
    return plugin?.configuration_schema?.map((field) => field.name) || [];
  });

  // Callback to update configuration fields based on current type
  const updateConfigurationFields = useCallback(
    (currentType: AuthenticatorTypeEnum) => {
      const plugin = plugins.authenticators.find((p) => p.type === currentType);
      const fields = plugin?.configuration_schema?.map((field) => field.name) || [];
      setConfigurationFields(fields);
    },
    [plugins.authenticators]
  );
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
      <PlatformPageForm
        submitText={
          !authenticator ? t('Create Authentication Method') : t('Save Authentication Method')
        }
        onSubmit={props.handleSubmit}
        onCancel={() => void navigate(-1)}
        defaultValue={initialValues}
        errorAdapter={(error: unknown) => authenticatorErrorAdapter(error, configurationFields)}
      >
        <AuthenticatorFormInputs
          plugins={plugins}
          authenticator={authenticator}
          onTypeChange={updateConfigurationFields}
        />
      </PlatformPageForm>
    </PageLayout>
  );
}

function AuthenticatorFormInputs(
  props: Readonly<{
    plugins: AuthenticatorPlugins;
    authenticator?: Authenticator;
    onTypeChange: (type: AuthenticatorTypeEnum) => void;
  }>
) {
  const { t } = useTranslation();
  const currentType = useWatch<AuthenticatorFormValues, 'type'>({ name: 'type' });
  const { onTypeChange, plugins, authenticator } = props;
  const { setValue } = useFormContext<AuthenticatorFormValues>();

  // Update configuration fields and populate defaults when type changes
  useEffect(() => {
    if (currentType) {
      onTypeChange(currentType);

      if (authenticator) {
        return;
      }

      const plugin = plugins.authenticators.find((p) => p.type === currentType);

      if (!plugin) {
        return;
      }

      plugin.configuration_schema.forEach((field) => {
        if (field.default !== undefined && field.default !== null) {
          let formValue: string | boolean;
          if (field.type === 'URLListField' && Array.isArray(field.default)) {
            formValue = (field.default as string[]).join(',');
          } else if (field.type === 'BooleanField') {
            formValue = Boolean(field.default);
          } else if (typeof field.default === 'string') {
            formValue = field.default;
          } else {
            formValue = JSON.stringify(field.default);
          }
          setValue(`configuration.${field.name}` as keyof AuthenticatorFormValues, formValue, {
            shouldDirty: false,
          });
        }
      });
    }
  }, [currentType, onTypeChange, plugins.authenticators, authenticator, setValue]);

  return (
    <>
      <PageFormTextInput
        name="name"
        label={t('Name')}
        isRequired
        placeholder={t('Enter authentication name')}
      />
      <PageFormAutoMigrateUsersSelect
        isLegacy={Boolean(props.authenticator?.type.includes('legacy'))}
      />
      <AuthenticatorTypeStep plugins={props.plugins} isDisabled={!!props.authenticator} />
      <AuthenticatorSubForm
        plugins={props.plugins}
        authenticator={props.authenticator}
      ></AuthenticatorSubForm>
    </>
  );
}

export function formatConfiguration(values: Configuration, plugin: AuthenticatorPlugin) {
  const formatted: Configuration = {};
  plugin.configuration_schema.forEach((definition) => {
    const key = definition.name;
    const value = values[key] as string;
    if (!values[key] && definition.type !== 'BooleanField') {
      // For JSON-like fields, send an empty object/array when cleared so the API knows
      // the user intentionally wants to remove nested values rather than use the default
      const dictFieldTypes = ['JSONField', 'DictField', 'LDAPConnectionOptions', 'UserAttrMap'];
      const listFieldTypes = ['ListField', 'LDAPSearchField'];
      if (dictFieldTypes.includes(definition.type)) {
        formatted[key] = {};
      } else if (listFieldTypes.includes(definition.type)) {
        formatted[key] = [];
      }
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
        formatted[key] = JSON.parse(value) as Configuration;
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
export function useSetAutoMigrateInitialValue() {
  return useCallback(async (auth?: Authenticator) => {
    return await requestGet<AwxItemsResponse<Authenticator>>(
      gatewayAPI`/authenticators/?auto_migrate_users_to=${auth?.id.toString() ?? ''} `
    ).then((res) => {
      if (auth?.type.includes('legacy')) {
        return auth?.summary_fields?.auto_migrate_users_to.id;
      }

      return res.results[0].id ?? null;
    });
  }, []);
}
