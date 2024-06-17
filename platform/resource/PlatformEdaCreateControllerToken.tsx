import { Navigate } from 'react-router-dom';
import { useGetPageUrl } from '../../framework';
import { PlatformRoute } from '../main/PlatformRoutes';

export function PlatformEdaCreateControllerToken() {
  const getPageUrl = useGetPageUrl();
  return <Navigate to={getPageUrl(PlatformRoute.CreateEdaControllerToken)} replace />;
}
