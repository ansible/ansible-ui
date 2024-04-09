import { PageApp } from '../../framework';
import { PlatformMasthead } from './PlatformMasthead';
import { usePlatformNavigation } from './usePlatformNavigation';

export function PlatformApp() {
  const navigation = usePlatformNavigation();
  return (
    <PageApp
      masthead={<PlatformMasthead />}
      navigation={navigation}
      basename={process.env.ROUTE_PREFIX}
      defaultRefreshInterval={10}
    />
  );
}
