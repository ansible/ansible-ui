import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { Outlet } from 'react-router-dom';
import useSWR from 'swr';
import { gatewayAPI } from '../utils/gateway-api-utils';
import { GatewaySettingsOption } from './GatewaySettingOptions';

export function GatewaySettings() {
  const optionsResponse = useOptions<{
    actions: {
      GET: Record<string, GatewaySettingsOption>;
      PUT: Record<string, GatewaySettingsOption>;
    };
  }>(gatewayAPI`/settings/all/`);
  const options = optionsResponse.data?.actions;
  const hasWritePermissions = !!options?.PUT;

  const settingsResponse = useSWR<Record<string, unknown>>(gatewayAPI`/settings/all/`, requestGet);
  const settings = settingsResponse.data;

  if (!options?.GET || !settings) {
    return <LoadingState />;
  }

  return (
    <Outlet
      context={{
        options,
        settings,
        hasWritePermissions,
        refresh: () => settingsResponse.mutate(undefined),
      }}
    />
  );
}
