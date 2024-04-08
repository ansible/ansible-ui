import { PageApp } from '../../../framework/PageNavigation/PageApp';
import { EdaMasthead } from './EdaMasthead';
import { useEdaNavigation } from './useEdaNavigation';

export function EdaApp() {
  const navigation = useEdaNavigation();
  return (
    <PageApp
      masthead={<EdaMasthead />}
      navigation={navigation}
      basename={process.env.ROUTE_PREFIX}
      defaultRefreshInterval={10}
    />
  );
}
