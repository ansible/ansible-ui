import { HubNamespace } from '../../namespaces/HubNamespace';
import { useHubContext } from '../useHubContext';

/**
 * Check if the current user can sign collections based on feature flags only.
 * Use this for UI-level visibility (e.g., toolbar actions) where namespace context is not available.
 */
export const useCanSignNamespace = () => {
  const { featureFlags } = useHubContext();
  const { can_create_signatures } = featureFlags;

  return !!can_create_signatures;
};

/**
 * Build a permission checker that combines model-level, object-level, and superuser checks.
 * Mirrors the `hasPerm` pattern from ansible-hub-ui's CollectionDropdown.
 */
export function useCollectionPermissionCheck(namespace?: HubNamespace) {
  const { hasPermission, user } = useHubContext();

  return (permission: string) =>
    hasPermission(permission) ||
    namespace?.related_fields?.my_permissions?.includes(permission) ||
    !!user?.is_superuser;
}

export const useCanSignEE = () => {
  const { featureFlags } = useHubContext();
  const { container_signing } = featureFlags;

  const canSign = container_signing;

  return canSign;
};
