import { useMemo } from 'react';
import { IPageAction } from '../../../../../framework';
import { Instance } from '../../../interfaces/Instance';
import { useRunHealthCheckRowAction } from './useRunHealthCheckRowAction';
import { useToggleInstanceRowAction } from './useToggleInstanceRowAction';
import { useEditInstanceRowAction } from './useEditInstanceRowAction';

export function useInstanceRowActions(onComplete: (instances: Instance[]) => void) {
  const toggleInstanceRowAction: IPageAction<Instance> = useToggleInstanceRowAction(onComplete);
  const healthCheckRowAction: IPageAction<Instance> = useRunHealthCheckRowAction(onComplete);
  const editInstanceRowAction: IPageAction<Instance> = useEditInstanceRowAction();

  return useMemo<IPageAction<Instance>[]>(
    () => [toggleInstanceRowAction, healthCheckRowAction, editInstanceRowAction],
    [toggleInstanceRowAction, healthCheckRowAction, editInstanceRowAction]
  );
}
