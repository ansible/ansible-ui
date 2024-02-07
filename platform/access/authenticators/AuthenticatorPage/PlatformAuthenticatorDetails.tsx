import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Divider, TextContent, Text, TextVariants } from '@patternfly/react-core';
import styled from 'styled-components';
import { PageDetails, PageDetail, LoadingPage, Scrollable } from '../../../../framework';
import { useGet, useGetItem } from '../../../../frontend/common/crud/useGet';
import { PageDetailCodeEditor } from '../../../../framework/PageDetails/PageDetailCodeEditor';
import type { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import type { Authenticator } from '../../../interfaces/Authenticator';
import type { AuthenticatorPlugins } from '../../../interfaces/AuthenticatorPlugin';
import type { AuthenticatorMap } from '../../../interfaces/AuthenticatorMap';

type Field = {
  label: string;
  value: string;
};
type ObjField = {
  label: string;
  value: { [k: string]: string } | string[];
};

const Section = styled(TextContent)`
  padding-inline: 24px;
`;

const SubHeading = styled(Text)`
  margin-block: 24px;
`;

export function PlatformAuthenticatorDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: authenticator } = useGetItem<Authenticator>(
    `/api/gateway/v1/authenticators`,
    params.id
  );
  const { data: plugins } = useGet<AuthenticatorPlugins>(`/api/gateway/v1/authenticator_plugins`);
  const mapsResponse = useGet<PlatformItemsResponse<AuthenticatorMap>>(
    `/api/gateway/v1/authenticator_maps?authenticator=${params.id}`
  );
  const maps = mapsResponse?.data?.results || [];

  if (!authenticator || !plugins) {
    return <LoadingPage />;
  }

  const schema =
    plugins.authenticators.find((plugin) => plugin.type === authenticator.type)
      ?.configuration_schema || [];

  const fields: Field[] = [];
  const objFields: ObjField[] = [];
  Object.keys(authenticator.configuration).forEach((key) => {
    const value = authenticator.configuration[key];
    const definition = schema.find((field) => field.name === key);
    if (!definition) {
      return;
    }
    if (typeof value === 'object') {
      objFields.push({
        label: definition?.ui_field_label || definition.name,
        value,
      });
    } else {
      const val = typeof value === 'boolean' ? (value ? 'On' : 'Off') : value;
      fields.push({
        label: definition?.ui_field_label || definition.name,
        value: val,
      });
    }
  });

  const typeLabels: { [k: string]: string } = {
    local: t('Local'),
    ldap: t('LDAP'),
    saml: t('SAML'),
    keycloak: t('Keycloak'),
  };
  const typeKey = authenticator.type.split('.').pop();
  const type = typeKey ? typeLabels[typeKey] ?? typeKey : authenticator.type;

  return (
    <Scrollable>
      <PageDetails>
        <PageDetail label={t('Name')}>{authenticator.name}</PageDetail>
        <PageDetail label={t('Type')}>{type}</PageDetail>
        {fields.map((field) => (
          <PageDetail label={field.label} key={field.label}>
            {field.value}
          </PageDetail>
        ))}
      </PageDetails>
      {objFields.length ? (
        <PageDetails numberOfColumns="single">
          {objFields.map((field) => (
            <PageDetailCodeEditor
              label={field.label}
              key={field.label}
              value={JSON.stringify(field.value, null, 2)}
            />
          ))}
        </PageDetails>
      ) : null}
      {maps && maps.length ? (
        <>
          <Section>
            <Divider />
            <SubHeading component={TextVariants.h3}>{t('Mapping')}</SubHeading>
          </Section>
          <PageDetails numberOfColumns="single">
            {maps.map((map) => (
              <PageDetail label={map.name} key={map.name}>
                {map.ui_summary || t('{{mapType}} map', { mapType: map.map_type })}
              </PageDetail>
            ))}
          </PageDetails>
        </>
      ) : null}
    </Scrollable>
  );
}
