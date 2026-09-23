import type { LaunchConfiguration } from '../../../../interfaces/LaunchConfiguration';
import type { AllResources } from '../types';

export type LaunchConfigLoadResult = {
  launch_config: LaunchConfiguration | null;
  resource: AllResources;
  resourceId: number;
};

type LaunchConfigLoadKey = `${string}:${number}`;

const pendingLoads = new Map<LaunchConfigLoadKey, Promise<LaunchConfigLoadResult | undefined>>();

function getLaunchConfigLoadKey(nodeType: string, resourceId: number): LaunchConfigLoadKey {
  return `${nodeType}:${resourceId}`;
}

export function registerLaunchConfigLoad(
  nodeType: string,
  resourceId: number,
  promise: Promise<LaunchConfigLoadResult | undefined>
): void {
  const key = getLaunchConfigLoadKey(nodeType, resourceId);
  pendingLoads.set(key, promise);
  void promise.finally(() => {
    if (pendingLoads.get(key) === promise) {
      pendingLoads.delete(key);
    }
  });
}

export function awaitLaunchConfigLoad(
  nodeType: string,
  resourceId: number
): Promise<LaunchConfigLoadResult | undefined> {
  return (
    pendingLoads.get(getLaunchConfigLoadKey(nodeType, resourceId)) ?? Promise.resolve(undefined)
  );
}
