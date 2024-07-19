import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { LoadingPage, usePageAlertToaster, usePageNavigate } from '../../../framework';
import {
  postRequest,
  requestDelete,
  requestGet,
  requestPatch,
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
import { PlatformItemsResponse } from '../../interfaces/PlatformItemsResponse';
import { AwxError } from '../../../frontend/awx/common/AwxError';

type Errors = { [key: string]: string } | undefined;

export function EditAuthenticator() {
  const { t } = useTranslation();
  const alertToaster = usePageAlertToaster();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id?: string }>();

  const id = Number(params.id);
  const [mappings, setMappings] = useState<AuthenticatorMap[]>();
  const [authenticator, setAuthenticator] = useState<Authenticator>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    async function fetchData() {
      try {
        const mappingsResponse = await requestGet<PlatformItemsResponse<AuthenticatorMap>>(
          gatewayAPI`/authenticators/${id.toString()}/authenticator_maps/`
        );
        const authenticator = await requestGet<Authenticator>(
          gatewayAPI`/authenticators/${id.toString()}/`
        );
        setMappings(mappingsResponse?.results);
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

  if (!plugins || !authenticator || !mappings) {
    return <LoadingPage />;
  }

  const handleSubmit = async (values: AuthenticatorFormValues) => {
    const {
      name,
      enabled,
      create_objects,
      remove_users,
      configuration,
      mappings: newMappings,
    } = values;
    const plugin = plugins?.authenticators.find((a) => a.type === authenticator.type);
    if (!plugins || !plugin) {
      return;
    }
    const request = requestPatch(gatewayAPI`/authenticators/${id.toString()}/`, {
      name,
      create_objects,
      remove_users,
      enabled: false,
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
      if (enabled) {
        await requestPatch(gatewayAPI`/authenticators/${id.toString()}/`, {
          enabled,
        });
      }
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
