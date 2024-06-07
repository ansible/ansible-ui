import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { LoadingPage, usePageAlertToaster, usePageNavigate } from '../../../framework';
import {
  postRequest,
  requestDelete,
  requestGet,
  requestPatch,
  swrOptions,
} from '../../../frontend/common/crud/Data';
import { useGet } from '../../../frontend/common/crud/useGet';
import { gatewayAPI } from '../../api/gateway-api-utils';
import { Authenticator } from '../../interfaces/Authenticator';
import { AuthenticatorMap } from '../../interfaces/AuthenticatorMap';
import { AuthenticatorPlugins } from '../../interfaces/AuthenticatorPlugin';
import { PlatformRoute } from '../../main/PlatformRoutes';
import {
  AuthenticatorForm,
  AuthenticatorFormValues,
  buildTriggers,
  formatConfiguration,
} from './components/AuthenticatorForm';

type Errors = { [key: string]: string } | undefined;

export function EditAuthenticator() {
  const { t } = useTranslation();
  const alertToaster = usePageAlertToaster();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id?: string }>();

  const id = Number(params.id);
  const { data: authenticator } = useSWR<Authenticator>(
    gatewayAPI`/authenticators/${id.toString()}/`,
    requestGet,
    swrOptions
  );
  const { data: mappingsResponse } = useSWR<{ results: AuthenticatorMap[] }>(
    gatewayAPI`/authenticators/${id.toString()}/authenticator_maps/`,
    requestGet,
    swrOptions
  );
  const mappings = mappingsResponse?.results;

  const { data: plugins } = useGet<AuthenticatorPlugins>(gatewayAPI`/authenticator_plugins/`);
  if (!plugins || !authenticator || !mappings) {
    return <LoadingPage />;
  }

  const handleSubmit = async (values: AuthenticatorFormValues) => {
    const { name, configuration, mappings: newMappings } = values;
    const plugin = plugins?.authenticators.find((a) => a.type === authenticator.type);
    if (!plugins || !plugin) {
      return;
    }
    const request = requestPatch(gatewayAPI`/authenticators/${id.toString()}/`, {
      name,
      configuration: formatConfiguration(configuration, plugin),
    });

    try {
      const authenticator = await request;

      const controller = new AbortController();
      const deleteRequests = mappings.map((map) => {
        return requestDelete(
          gatewayAPI`/authenticator_maps/${map.id.toString()}/`,
          controller.signal
        );
      });
      await Promise.all(deleteRequests);
      const mapRequests = newMappings.map((map, index) => {
        const data = {
          name: map.name,
          map_type: map.map_type,
          revoke: map.revoke,
          order: index + 1,
          authenticator: (authenticator as Authenticator).id,
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
      pageNavigate(PlatformRoute.AuthenticatorDetails, {
        params: { id: (authenticator as Authenticator).id },
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

  return (
    <AuthenticatorForm
      handleSubmit={handleSubmit}
      plugins={plugins}
      authenticator={authenticator}
      mappings={mappings}
    />
  );
}
