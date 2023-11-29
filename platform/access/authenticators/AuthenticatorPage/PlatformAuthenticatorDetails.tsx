import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageDetails, PageDetail, LoadingPage } from '../../../../framework';
import { useGet, useGetItem } from '../../../../frontend/common/crud/useGet';
import { PageDetailCodeEditor } from '../../../../framework/PageDetails/PageDetailCodeEditor';
import type { Authenticator } from '../../../interfaces/Authenticator';
import type { AuthenticatorPlugins } from '../../../interfaces/AuthenticatorPlugin';

type Field = {
  label: string;
  value: string;
};
type ObjField = {
  label: string;
  value: { [k: string]: string } | string[];
};

export function PlatformAuthenticatorDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: authenticator } = useGetItem<Authenticator>(
    `/api/gateway/v1/authenticators`,
    params.id
  );
  const { data: plugins } = useGet<AuthenticatorPlugins>(`/api/gateway/v1/authenticator_plugins`);

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

  return (
    <>
      <PageDetails>
        <PageDetail label={t('Name')}>{authenticator.name}</PageDetail>
        <PageDetail label={t('Type')}>{authenticator.type}</PageDetail>
        {fields.map((field) => (
          <PageDetail label={field.label} key={field.label}>
            {field.value}
          </PageDetail>
        ))}
      </PageDetails>
      <PageDetails numberOfColumns="single">
        {objFields.map((field) => (
          <PageDetailCodeEditor
            label={field.label}
            key={field.label}
            value={JSON.stringify(field.value, null, 2)}
          />
        ))}
      </PageDetails>
    </>
  );
}
