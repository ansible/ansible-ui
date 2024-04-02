import { lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { GatewayServicesProvider } from './GatewayServices';

const Main = lazy(() => import('./PlatformMain'));
document.body.innerHTML = '<div id="app"></div>';

const root = createRoot(document.getElementById('app')!);

root.render(
  // The GatewayServicesProvider provides a list of GatewayServices to the application.
  // It sits at the top of the application because it is needed by the navigation.
  // It is then initialized by the GatewayServices component after login, which fetches the list of services from the API.
  <GatewayServicesProvider>
    <Main />
  </GatewayServicesProvider>
);
