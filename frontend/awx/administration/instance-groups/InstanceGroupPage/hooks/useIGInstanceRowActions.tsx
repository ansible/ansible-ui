import { useMemo } from 'react';
import { IPageAction } from '../../../../../../framework';
import { Instance } from '../../../../interfaces/Instance';
import { useRunHealthCheckRowAction } from '../../../instances/hooks/useRunHealthCheckRowAction';
import { useToggleInstanceRowAction } from '../../../instances/hooks/useToggleInstanceRowAction';

export function useIGInstanceRowActions(onComplete: (instances: Instance[]) => void) {
  const toggleInstanceRowAction: IPageAction<Instance> = useToggleInstanceRowAction(onComplete);
  const healthCheckRowAction: IPageAction<Instance> = useRunHealthCheckRowAction(onComplete);

  return useMemo<IPageAction<Instance>[]>(
    () => [toggleInstanceRowAction, healthCheckRowAction],
    [toggleInstanceRowAction, healthCheckRowAction]
  );
}
