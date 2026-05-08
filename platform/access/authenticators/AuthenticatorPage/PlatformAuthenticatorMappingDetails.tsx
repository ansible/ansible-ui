import {
  PageDetail,
  PageDetails,
  PageDetailsFromColumns,
  PageLayout,
} from '@ansible/ansible-ui-framework';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { Divider, Label, LabelGroup } from '@patternfly/react-core';
import { t } from 'i18next';
import React from 'react';
import { useParams } from 'react-router-dom';
import { AuthenticatorMap, AuthenticatorMapType } from '../../../interfaces/AuthenticatorMap';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useMappingColumns } from '../hooks/useMappingColumns';

interface MapBase {
  map_type: AuthenticatorMapType;
  name: string;
  revoke: boolean;
  order?: number;
  organization?: string;
  team?: PlatformTeam;
  role?: string;
}
interface MapAttributes extends MapBase {
  trigger: 'attributes';
  conditional: 'or' | 'and';
  attributes: {
    [key: string]: {
      contains?: string;
      equals?: string;
      matches?: string;
      ends_with?: string;
      in?: string;
    };
  };
}
interface MapGroups extends MapBase {
  trigger: 'groups';
  conditional: 'or' | 'and';
  groups: { name: string }[];
}

interface Attribute {
  attribute: string;
  comparison: 'contains' | 'matches' | 'ends_with' | 'equals' | 'in';
  value: string;
}

interface Group {
  name: string;
}
interface Groups {
  has_or?: Group[];
  has_and?: Group[];
}

function parseAttributes(triggersString: string): Attribute[] {
  const parsed = JSON.parse(triggersString) as MapAttributes;
  const attributes = parsed.attributes;
  const attributeList: Attribute[] = [];

  for (const key in attributes) {
    if (attributes[key] && key !== 'join_condition') {
      const condition = attributes[key] as {
        contains?: string;
        equals?: string;
        matches?: string;
        ends_with?: string;
        in?: string;
      };
      let comparison: Attribute['comparison'] | undefined;
      let value: string | undefined;
      if (condition.contains) {
        comparison = 'contains';
        value = condition.contains;
      } else if (condition.equals) {
        comparison = 'equals';
        value = condition.equals;
      } else if (condition.matches) {
        comparison = 'matches';
        value = condition.matches;
      } else if (condition.ends_with) {
        comparison = 'ends_with';
        value = condition.ends_with;
      } else if (condition.in) {
        comparison = 'in';
        value = condition.in;
      }
      if (comparison !== undefined && value !== undefined) {
        attributeList.push({
          attribute: key,
          comparison: comparison,
          value: value,
        });
      }
    }
  }
  return attributeList;
}

function parseGroups(triggersString: string): Group[] {
  const parsed = JSON.parse(triggersString) as MapGroups;
  const groups = parsed.groups as Groups;
  const groupsList: Group[] = [];

  if (!groups) {
    return [];
  }

  if (groups.has_or !== undefined) {
    groups.has_or.forEach((group) => groupsList.push(group));
  } else if (groups.has_and !== undefined) {
    groups.has_and.forEach((group) => groupsList.push(group));
  }
  return groupsList;
}

export function PlatformAuthenticatorMappingDetails() {
  const params = useParams<{ map_id: string; id: string }>();
  const map_id = params.map_id;
  const { data: mapping } = useGetItem<AuthenticatorMap>(gatewayAPI`/authenticator_maps/`, map_id);

  if (!mapping) {
    return null;
  }

  return (
    <PlatformAuthenticatorMappingDetailsInner
      mapping={mapping}
    ></PlatformAuthenticatorMappingDetailsInner>
  );
}

function AttributesSubsection(props: Readonly<{ mapping: AuthenticatorMap }>) {
  const attributes = parseAttributes(JSON.stringify(props.mapping.triggers));
  const attributeDetails: React.ReactNode[] = [];
  attributes.forEach((attribute) => {
    attributeDetails.push(
      <PageDetail
        id={attribute.attribute + '-name'}
        label={t('Attribute')}
      >{`${attribute.attribute}`}</PageDetail>
    );
    attributeDetails.push(
      <PageDetail
        id={attribute.attribute + '-comparison'}
        label={t('Comparison')}
      >{`${attribute.comparison}`}</PageDetail>
    );
    attributeDetails.push(
      <PageDetail
        id={attribute.attribute + '-value'}
        label={t('Value')}
      >{`${attribute.value}`}</PageDetail>
    );
  });
  return (
    <>
      <PageDetail fullWidth>
        <Divider />
      </PageDetail>
      <PageDetail fullWidth label={t('Rule condition details')}>
        {' '}
      </PageDetail>
      {attributeDetails}
    </>
  );
}

function GroupsSubsection(props: Readonly<{ mapping: AuthenticatorMap }>) {
  const groups = parseGroups(JSON.stringify(props.mapping.triggers));
  const groupDetails: React.ReactNode[] = [];

  groups.forEach((group) => {
    if (typeof group === 'string') {
      groupDetails.push(<Label key={group}>{group}</Label>);
    }
  });
  return (
    <>
      <PageDetail fullWidth>
        <Divider />
      </PageDetail>
      <PageDetail fullWidth label={t('Rule condition details')}>
        {' '}
      </PageDetail>
      <PageDetail id={'groups'} label={t('Groups')}>
        <LabelGroup>{groupDetails}</LabelGroup>
      </PageDetail>
    </>
  );
}

export function PlatformAuthenticatorMappingDetailsInner(
  props: Readonly<{ mapping: AuthenticatorMap }>
) {
  const mapping = props.mapping;
  const columns = useMappingColumns();

  return (
    <PageLayout>
      <PageDetails>
        <PageDetailsFromColumns columns={columns} item={mapping}></PageDetailsFromColumns>
        {'attributes' in mapping.triggers ? (
          <AttributesSubsection mapping={mapping}></AttributesSubsection>
        ) : (
          ''
        )}
        {'groups' in mapping.triggers ? (
          <GroupsSubsection mapping={mapping}></GroupsSubsection>
        ) : (
          ''
        )}
      </PageDetails>
    </PageLayout>
  );
}
