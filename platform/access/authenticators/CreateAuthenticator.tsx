import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingPage, usePageAlertToaster, usePageNavigate } from '../../../framework';
import { postRequest } from '../../../frontend/common/crud/Data';
import { requestPatch } from '../../../frontend/common/crud/Data';
import { useGet } from '../../../frontend/common/crud/useGet';
import { gatewayAPI } from '../../api/gateway-api-utils';
import type { Authenticator } from '../../interfaces/Authenticator';
import type { AuthenticatorPlugins } from '../../interfaces/AuthenticatorPlugin';
import { PlatformRoute } from '../../main/PlatformRoutes';
import {
  AuthenticatorForm,
  AuthenticatorFormValues,
  buildTriggers,
  formatConfiguration,
} from './components/AuthenticatorForm';

type Errors = { [key: string]: string } | undefined;

export function CreateAuthenticator() {
  const { t } = useTranslation();
  const alertToaster = usePageAlertToaster();
  const pageNavigate = usePageNavigate();

  const { data: plugins } = useGet<AuthenticatorPlugins>(gatewayAPI`/authenticator_plugins/`);
  if (!plugins) {
    return <LoadingPage />;
  }

  const handleSubmit = async (values: AuthenticatorFormValues) => {
    const { name, enabled, create_objects, remove_users, type, configuration, mappings } = values;
    const plugin = plugins?.authenticators.find((a) => a.type === type);
    if (!plugins || !plugin) {
      return;
    }

    const request = postRequest(gatewayAPI`/authenticators/`, {
      name,
      type,
      create_objects,
      remove_users,
      configuration: formatConfiguration(configuration, plugin),
    });

    try {
      const authenticator = await request;
      const id = (authenticator as Authenticator).id;

      const mapRequests = mappings.map((map, index) => {
        const data = {
          name: map.name,
          map_type: map.map_type,
          revoke: map.revoke,
          order: index + 1,
          authenticator: id,
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
      if (enabled) {
        await requestPatch(gatewayAPI`/authenticators/${id.toString()}/`, {
          enabled,
        });
      }
      pageNavigate(PlatformRoute.AuthenticatorDetails, {
        params: { id },
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
