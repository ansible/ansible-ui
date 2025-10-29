import {
  LoadingPage,
  PageForm,
  PageFormSubmitHandler,
  PageHeader,
  PageLayout,
  PageNotFound,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { usePatchRequest } from '@ansible/common-ui/crud/usePatchRequest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AttributeDefinition,
  AttributesTriggers,
  AuthenticatorMap,
  AuthenticatorMapTriggers,
  AuthenticatorMapType,
} from '../../../interfaces/AuthenticatorMap';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { PlatformRole } from '../../../interfaces/PlatformRole';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { MappingFields } from './MappingFields';

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

export function CreateAuthenticatorMapping() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const postRequest = usePostRequest<AuthenticatorMapValues, AuthenticatorMap>();
  const params = useParams<{ id?: string }>();
  const pageNavigate = usePageNavigate();

  const onSubmit: PageFormSubmitHandler<AuthenticatorMapValues> = async (map) => {
    const data = {
      name: map.name,
      map_type: map.map_type,
      revoke: map.revoke,
      order: 1,
      authenticator: params.id,
      triggers: buildTriggers(map),
      organization: ['organization', 'team', 'role'].includes(map.map_type)
        ? map.organization
        : null,
      team: ['team', 'role'].includes(map.map_type) ? map.team : null,
      role: ['organization', 'team', 'role'].includes(map.map_type) ? map.role : null,
    };
    const newMapping = await postRequest(
      gatewayAPI`/authenticator_maps/`,
      data as unknown as AuthenticatorMapValues
    );
    pageNavigate(PlatformRoute.AuthenticatorMappingDetails, {
      params: { id: params.id, map_id: newMapping.id },
    });
  };
  const getPageUrl = useGetPageUrl();
  return (
    <PageLayout>
      <PageHeader
        title={t('Create mapping')}
        breadcrumbs={[
          {
            label: t('Mappings'),
            to: getPageUrl(PlatformRoute.AuthenticatorMappings, { params: { id: params.id } }),
          },
          { label: t('Create mapping') },
        ]}
      />
      <PageForm
        submitText={t('Create mapping')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={() => void navigate(-1)}
        defaultValue={{ map_type: AuthenticatorMapType.allow }}
      >
        <MappingInputs />
      </PageForm>
    </PageLayout>
  );
}

export function EditAuthenticatorMapping() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string; map_id?: string }>();
  const {
    data: mapping,
    isLoading,
    error,
  } = useGet<AuthenticatorMap>(gatewayAPI`/authenticator_maps/${params?.map_id ?? ''}/`);
  const patchRequest = usePatchRequest<AuthenticatorMapValues, AuthenticatorMap>();
  const onSubmit: PageFormSubmitHandler<AuthenticatorMapValues> = async (map) => {
    const data = {
      name: map.name,
      map_type: map.map_type,
      revoke: map.revoke,
      order: 1,
      authenticator: params.id,
      triggers: buildTriggers(map),
      organization: ['organization', 'team', 'role'].includes(map.map_type)
        ? map.organization
        : null,
      team: ['team', 'role'].includes(map.map_type) ? map.team : null,
      role: ['organization', 'team', 'role'].includes(map.map_type) ? map.role : null,
    };
    await patchRequest(
      gatewayAPI`/authenticator_maps/${params?.map_id ?? ''}/`,
      data as unknown as AuthenticatorMapValues
    );
    void navigate(-1);
  };
  const getPageUrl = useGetPageUrl();
  if (isLoading) return <LoadingPage breadcrumbs />;
  if (error) return <AwxError error={error} />;
  if (!mapping) return <PageNotFound />;

  const initialValues = {
    map_type: mapping.map_type,
    name: mapping.name,
    revoke: mapping.revoke,
    ...parseTrigger(mapping),
    organization: mapping.organization,
    role: mapping.role,
    team: mapping.team,
  };

  return (
    <PageLayout>
      <PageHeader
        title={
          mapping?.name ? t('Edit {{mappingName}}', { mappingName: mapping?.name }) : t('Mappings')
        }
        breadcrumbs={[
          {
            label: t('Mappings'),
            to: getPageUrl(PlatformRoute.AuthenticatorMappings, { params: { id: params.id } }),
          },
          {
            label: mapping?.name
              ? t('Edit {{mappingName}}', { mappingName: mapping?.name })
              : t('Mappings'),
          },
        ]}
      />
      <PageForm
        submitText={t('Save mapping')}
        onSubmit={onSubmit}
        onCancel={() => void navigate(-1)}
        defaultValue={initialValues as AuthenticatorMapValues}
      >
        <MappingInputs />
      </PageForm>
    </PageLayout>
  );
}

function MappingInputs() {
  const { data: roles, isLoading: isRolesLoading } = useGet<PlatformItemsResponse<PlatformRole>>(
    gatewayAPI`/role_definitions/?order_by=name&page_size=500`
  );

  const roleTypes: { [k: string]: string } = {};
  if (!isRolesLoading && roles?.results) {
    for (const r of roles.results) {
      roleTypes[r.name] = r.content_type ?? '';
    }
  }
  return <MappingFields roleTypes={roleTypes} />;
}

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
