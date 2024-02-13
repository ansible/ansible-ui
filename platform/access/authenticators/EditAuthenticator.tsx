import { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { LoadingPage, usePageAlertToaster, usePageNavigate } from '../../../framework';
import {
  postRequest,
  requestGet,
  requestPatch,
  swrOptions,
} from '../../../frontend/common/crud/Data';
import { useGet } from '../../../frontend/common/crud/useGet';
import { PlatformRoute } from '../../main/PlatformRoutes';
import { gatewayAPI } from '../../api/gateway-api-utils';
import {
  AuthenticatorForm,
  formatConfiguration,
  buildTriggers,
  AuthenticatorFormValues,
} from './components/AuthenticatorForm';
import { AuthenticatorPlugins } from '../../interfaces/AuthenticatorPlugin';
import { Authenticator } from '../../interfaces/Authenticator';
import { AuthenticatorMap } from '../../interfaces/AuthenticatorMap';

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
    gatewayAPI`/authenticators/${id.toString()}/authenticator_maps`,
    requestGet,
    swrOptions
  );
  const mappings = mappingsResponse?.results;

  const { data: plugins } = useGet<AuthenticatorPlugins>(gatewayAPI`/authenticator_plugins`);
  if (!plugins || !authenticator || !mappings) {
    return <LoadingPage />;
  }

  const handleSubmit = async (values: AuthenticatorFormValues) => {
    const { name, type, configuration, mappings } = values;
    const plugin = plugins?.authenticators.find((a) => a.type === type);
    if (!plugins || !plugin) {
      return;
    }
    const request = requestPatch(gatewayAPI`/authenticators/${id.toString()}`, {
      name,
      type,
      configuration: formatConfiguration(configuration, plugin),
    });

    try {
      const authenticator = await request;

      const mapRequests = mappings.map((map, index) => {
        const data = {
          name: map.name,
          map_type: map.map_type,
          revoke: map.revoke,
          order: index + 1,
          authenticator: (authenticator as Authenticator).id,
          triggers: buildTriggers(map),
          organization: ['organization', 'team'].includes(map.map_type)
            ? map.organization?.name
            : null,
          team: ['team'].includes(map.map_type) ? map.team?.name : null,
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
