import { LoadingPage, usePageAlertToaster, usePageNavigate } from '@ansible/ansible-ui-framework';
import { postRequest, requestPatch } from '@ansible/common-ui/crud/Data';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { Authenticator } from '../../interfaces/Authenticator';
import type { AuthenticatorPlugins } from '../../interfaces/AuthenticatorPlugin';
import { PlatformRoute } from '../../main/PlatformRoutes';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import {
  AuthenticatorForm,
  AuthenticatorFormValues,
  buildTriggers,
  formatConfiguration,
} from './components/AuthenticatorForm';
import { useProcessAutoMigrationUsersRequest } from './hooks/useProcessAutoMigrationUsersRequest';

type Errors = { [key: string]: string } | undefined;

export function CreateAuthenticator() {
  const { t } = useTranslation();
  const alertToaster = usePageAlertToaster();
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
      mappings,
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
      configuration: formatConfiguration(configuration, plugin),
    });

    try {
      const newAuthenticator = await request;
      const newAuthenticatorId = newAuthenticator.id;

      const mapRequests = mappings.map((map, index) => {
        const data = {
          name: map.name,
          map_type: map.map_type,
          revoke: map.revoke,
          order: index + 1,
          authenticator: newAuthenticatorId,
          triggers: buildTriggers(map),
          organization: ['organization', 'team', 'role'].includes(map.map_type)
            ? map.organization
            : null,
          team: ['team', 'role'].includes(map.map_type) ? map.team : null,
          role: ['organization', 'team', 'role'].includes(map.map_type) ? map.role : null,
        };
        return postRequest(gatewayAPI`/authenticator_maps/`, data);
      });
      await Promise.all(mapRequests);
      await requestPatch(gatewayAPI`/authenticators/${newAuthenticatorId.toString()}/`, {
        enabled,
      });
      if (auto_migrate_users_to) {
        await processAutoMigrationUsersRequest(newAuthenticator, auto_migrate_users_to);
      }
      pageNavigate(PlatformRoute.AuthenticatorDetails, {
        params: { id: newAuthenticatorId },
      });
    } catch (err) {
      let children: ReactNode | string | string[];
      if (err && typeof err === 'object' && 'body' in err) {
        const errorMessages = err.body as Errors;
        if (errorMessages) {
          children = Object.keys(errorMessages).map((key) => (
            <p key="key">{`${key}: ${errorMessages[key]}`}</p>
          ));
        }
      } else if (err instanceof Error && err.message) {
        children = err.message;
      }
      alertToaster.addAlert({
        variant: 'danger',
        title: t('Error saving authenticator'),
        children,
      });
    }
  };

  return <AuthenticatorForm handleSubmit={handleSubmit} plugins={plugins} />;
}
