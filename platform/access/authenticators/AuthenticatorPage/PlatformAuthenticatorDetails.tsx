import { LoadingPage, PageDetail, PageDetails, Scrollable } from '@ansible/ansible-ui-framework';
import { PageDetailCodeEditor } from '@ansible/ansible-ui-framework/PageDetails/PageDetailCodeEditor';
import { AwxItemsResponse } from '@ansible/awx-ui/common/AwxItemsResponse';
import { useGet, useGetItem } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import type { Authenticator } from '../../../interfaces/Authenticator';
import type { AuthenticatorPlugins } from '../../../interfaces/AuthenticatorPlugin';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { MigrateUsersToDetail } from '../components/MigrateUsersDetail';
import { getAuthenticatorTypeLabel } from '../getAuthenticatorTypeLabel';

type Field = {
  label: string;
  value: string;
};

type ObjField = {
  label: string;
  value: { [k: string]: string } | string[] | null;
};

export function PlatformAuthenticatorDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: authenticator } = useGetItem<Authenticator>(gatewayAPI`/authenticators`, params.id);
  const { data: legacyAuthenticators } = useGet<AwxItemsResponse<Authenticator>>(
    gatewayAPI`/authenticators/`,
    {
      auto_migrate_users_to: authenticator?.id.toString() ?? '',
    }
  );

  const { data: plugins } = useGet<AuthenticatorPlugins>(gatewayAPI`/authenticator_plugins/`);

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
    if (typeof value === 'object' || value === null) {
      objFields.push({
        label: definition?.ui_field_label || definition.name,
        value,
      });
    } else {
      const val = typeof value === 'boolean' ? (value ? t('On') : t('Off')) : value;
      fields.push({
        label: definition?.ui_field_label || definition.name,
        value: val,
      });
    }
  });
  const isLegacyAuthenticator = authenticator?.type.includes('legacy') ?? false;
  const type = getAuthenticatorTypeLabel(authenticator.type, t);
  const formatBoolean = (value: boolean) => (value ? t('On') : t('Off'));
  return (
    <Scrollable>
      <PageDetails disableScroll>
        <PageDetail label={t('Name')}>{authenticator.name}</PageDetail>
        <PageDetail label={t('Type')}>{type}</PageDetail>
        <MigrateUsersToDetail
          autoMigrateUsersTo={
            isLegacyAuthenticator
              ? authenticator.auto_migrate_users_to
              : legacyAuthenticators?.results
          }
          isLegacy={isLegacyAuthenticator}
        />
        <PageDetail label={t('Enabled')}>{formatBoolean(authenticator.enabled)}</PageDetail>
        <PageDetail label={t('Create objects')}>
          {formatBoolean(authenticator.create_objects)}
        </PageDetail>
        <PageDetail label={t('Remove users')}>
          {formatBoolean(authenticator.remove_users)}
        </PageDetail>
        {fields.map((field) => (
          <PageDetail label={field.label} key={field.label}>
            {field.value}
          </PageDetail>
        ))}
      </PageDetails>

      {objFields.length ? (
        <PageDetails numberOfColumns="single" disableScroll>
          {objFields.map((field) => {
            const isValueEmpty =
              field.value === null ||
              (Array.isArray(field.value) && field.value.length === 0) ||
              (typeof field.value === 'object' &&
                !Array.isArray(field.value) &&
                Object.keys(field.value).length === 0);
            return (
              <PageDetailCodeEditor
                isEmpty={isValueEmpty}
                isArray={Array.isArray(field.value)}
                label={field.label}
                key={field.label}
                value={!isValueEmpty ? JSON.stringify(field.value, null, 2) : ''}
              />
            );
          })}
        </PageDetails>
      ) : null}
    </Scrollable>
  );
}
