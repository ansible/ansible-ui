import { PageApp } from '@ansible/ansible-ui-framework';
import { AwxMasthead } from './AwxMasthead';
import { useAwxNavigation } from './useAwxNavigation';

export function AwxApp() {
  const navigation = useAwxNavigation();
  return (
    <PageApp
      masthead={<AwxMasthead />}
      navigation={navigation}
      basename={process.env.ROUTE_PREFIX}
    />
  );
}
