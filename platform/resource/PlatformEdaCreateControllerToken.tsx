import { useGetPageUrl } from '@ansible/ansible-ui-framework';
import { Navigate } from 'react-router-dom';
import { PlatformRoute } from '../main/PlatformRoutes';

export function PlatformEdaCreateControllerToken() {
  const getPageUrl = useGetPageUrl();
  return <Navigate to={getPageUrl(PlatformRoute.CreateEdaControllerToken)} replace />;
}
