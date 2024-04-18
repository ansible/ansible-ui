import { useMemo } from 'react';
import { IPageAction } from '../../../../../../framework';
import { IAwxView } from '../../../../common/useAwxView';
import { Instance } from '../../../../interfaces/Instance';
import { useRunHealthCheckAction } from '../../../instances/hooks/useRunHealthCheckAction';

export function useIGInstanceToolbarActions(view: IAwxView<Instance>) {
  const healthCheckAction = useRunHealthCheckAction(view, true);

  return useMemo<IPageAction<Instance>[]>(() => {
    return healthCheckAction;
  }, [healthCheckAction]);
}
