import { IPageAction } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { Instance } from '../../../../interfaces/Instance';
import {
  useRunHealthCheckRowAction,
  useToggleInstanceRowAction,
} from '../../../instances/hooks/useInstanceRowActions';

export function useIGInstanceRowActions(onComplete: (instances: Instance[]) => void) {
  const toggleInstanceRowAction: IPageAction<Instance> = useToggleInstanceRowAction(onComplete);
  const healthCheckRowAction: IPageAction<Instance> = useRunHealthCheckRowAction(onComplete, false);

  return useMemo<IPageAction<Instance>[]>(
    () => [toggleInstanceRowAction, healthCheckRowAction],
    [toggleInstanceRowAction, healthCheckRowAction]
  );
}
