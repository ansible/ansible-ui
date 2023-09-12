import { useNavigate } from 'react-router-dom';
import { useNavigationRoutes } from '../../framework/PageNavigation/PageNavigation';
import { AwxRoute } from './AwxRoutes';
import { useAwxNavigation } from './useAwxNavigation';

export function useGetAwxUrl() {
  const navigation = useAwxNavigation();
  const routes = useNavigationRoutes(navigation);
  return (route: AwxRoute) => routes[route];
}

export function useAwxNavigate() {
  const navigate = useNavigate();
  const getAwxUrl = useGetAwxUrl();
  return (route: AwxRoute) => navigate(getAwxUrl(route));
}
