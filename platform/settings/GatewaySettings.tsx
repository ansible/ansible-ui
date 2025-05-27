import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { Page } from '@patternfly/react-core';
import { Outlet } from 'react-router-dom';
import useSWR from 'swr';
import { gatewayAPI } from '../utils/gateway-api-utils';
import { GatewaySettingsOption } from './GatewaySettingOptions';

export function GatewaySettings() {
  const optionsResponse = useOptions<{ actions: { PUT: Record<string, GatewaySettingsOption> } }>(
    gatewayAPI`/settings/all/`
  );
  const options = optionsResponse.data?.actions.PUT;

  const settingsResponse = useSWR<Record<string, unknown>>(gatewayAPI`/settings/all/`, requestGet);
  const settings = settingsResponse.data;

  if (!options || !settings) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  return (
    <Outlet context={{ options, settings, refresh: () => settingsResponse.mutate(undefined) }} />
  );
}
