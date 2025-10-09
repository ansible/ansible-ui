import { LoadingPage, usePageNavigate } from '@ansible/ansible-ui-framework';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { requestGet, requestPatch } from '@ansible/common-ui/crud/Data';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Authenticator } from '../../interfaces/Authenticator';
import { AuthenticatorPlugins } from '../../interfaces/AuthenticatorPlugin';
import { PlatformRoute } from '../../main/PlatformRoutes';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import {
  AuthenticatorForm,
  AuthenticatorFormValues,
  formatConfiguration,
} from './components/AuthenticatorForm';
import { useProcessAutoMigrationUsersRequest } from './hooks/useProcessAutoMigrationUsersRequest';

export function EditAuthenticator() {
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id?: string }>();
  const processAutoMigrationUsersRequest = useProcessAutoMigrationUsersRequest();

  const id = Number(params.id);
  const [authenticator, setAuthenticator] = useState<Authenticator>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    async function fetchData() {
      try {
        const authenticator = await requestGet<Authenticator>(
          gatewayAPI`/authenticators/${id.toString()}/`
        );
        setAuthenticator(authenticator);
      } catch (error) {
        const errorObj = new Error(String(error));
        setError(errorObj);
      }
    }
    void fetchData();
  }, [id]);

  const { data: plugins } = useGet<AuthenticatorPlugins>(gatewayAPI`/authenticator_plugins/`);

  if (error) {
    //Using AwxError component but there is no AWX specific logic
    //this component can also be used for gateway without issue
    return <AwxError error={error} />;
  }

  if (!plugins || !authenticator) {
    return <LoadingPage />;
  }

  const handleSubmit = async (values: AuthenticatorFormValues) => {
    const { auto_migrate_users_to, name, enabled, create_objects, remove_users, configuration } =
      values;
    const plugin = plugins?.authenticators.find((a) => a.type === authenticator.type);
    if (!plugins || !plugin) {
      return;
    }

    const request = requestPatch<
      Authenticator,
      Omit<AuthenticatorFormValues, 'type' | 'mappings' | 'auto_migrate_users_to' | 'order'>
    >(gatewayAPI`/authenticators/${id.toString()}/`, {
      name,
      create_objects,
      remove_users,
      enabled,
      configuration: formatConfiguration(configuration, plugin),
    });
    const updatedAuthenticator = await request;

    await processAutoMigrationUsersRequest(updatedAuthenticator, auto_migrate_users_to);

    pageNavigate(PlatformRoute.AuthenticatorDetails, {
      params: { id: updatedAuthenticator.id },
    });
  };

  return (
    <AuthenticatorForm
      handleSubmit={handleSubmit}
      plugins={plugins}
      authenticator={authenticator}
    />
  );
}
