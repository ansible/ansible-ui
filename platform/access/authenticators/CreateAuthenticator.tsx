import { LoadingPage, usePageNavigate } from '@ansible/ansible-ui-framework';
import { postRequest } from '@ansible/common-ui/crud/Data';
import { useGet } from '@ansible/common-ui/crud/useGet';
import type { Authenticator } from '../../interfaces/Authenticator';
import type { AuthenticatorPlugins } from '../../interfaces/AuthenticatorPlugin';
import { PlatformRoute } from '../../main/PlatformRoutes';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import {
  AuthenticatorForm,
  AuthenticatorFormValues,
  formatConfiguration,
} from './components/AuthenticatorForm';
import { useProcessAutoMigrationUsersRequest } from './hooks/useProcessAutoMigrationUsersRequest';

export function CreateAuthenticator() {
  const pageNavigate = usePageNavigate();
  const processAutoMigrationUsersRequest = useProcessAutoMigrationUsersRequest();
  const { data: plugins } = useGet<AuthenticatorPlugins>(gatewayAPI`/authenticator_plugins/`);
  if (!plugins) {
    return <LoadingPage />;
  }

  const handleSubmit = async (values: AuthenticatorFormValues) => {
    const {
      auto_migrate_users_to,
      name,
      enabled = false,
      create_objects,
      remove_users,
      type,
      configuration,
    } = values;
    const plugin = plugins?.authenticators.find((a) => a.type === type);
    if (!plugins || !plugin) {
      return;
    }

    const request = postRequest<Authenticator>(gatewayAPI`/authenticators/`, {
      name,
      type,
      create_objects,
      remove_users,
      enabled,
      configuration: formatConfiguration(configuration, plugin),
    });

    const newAuthenticator = await request;
    const newAuthenticatorId = newAuthenticator.id;
    if (auto_migrate_users_to) {
      await processAutoMigrationUsersRequest(newAuthenticator, auto_migrate_users_to);
    }
    pageNavigate(PlatformRoute.AuthenticatorDetails, {
      params: { id: newAuthenticatorId },
    });
  };

  return <AuthenticatorForm handleSubmit={handleSubmit} plugins={plugins} />;
}
