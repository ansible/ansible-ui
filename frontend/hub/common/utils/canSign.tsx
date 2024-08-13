import { useHubContext } from '../useHubContext';

export const useCanSignNamespace = () => {
  const { featureFlags, hasPermission } = useHubContext();
  const { can_create_signatures } = featureFlags;

  const canSign =
    can_create_signatures &&
    hasPermission('galaxy.change_namespace') &&
    hasPermission('galaxy.upload_to_namespace');

  return canSign;
};

export const useCanSignEE = () => {
  const { featureFlags, hasPermission } = useHubContext();
  const { container_signing } = featureFlags;

  const canSign = container_signing && hasPermission('container.change_containernamespace');

  return canSign;
};
