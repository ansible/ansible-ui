import { useHubContext } from '../useHubContext';

export const useCanSignNamespace = () => {
  const { featureFlags } = useHubContext();
  const { can_create_signatures } = featureFlags;

  const canSign = can_create_signatures;

  return canSign;
};

export const useCanSignEE = () => {
  const { featureFlags } = useHubContext();
  const { container_signing } = featureFlags;

  const canSign = container_signing;

  return canSign;
};
