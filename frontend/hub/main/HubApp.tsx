import { PageApp } from '@ansible/ansible-ui-framework';
import { HubMasthead } from './HubMasthead';
import { useHubNavigation } from './useHubNavigation';

export function HubApp() {
  const navigation = useHubNavigation();
  return (
    <PageApp
      masthead={<HubMasthead />}
      navigation={navigation}
      basename={process.env.ROUTE_PREFIX}
    />
  );
}
