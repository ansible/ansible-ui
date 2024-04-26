import { useMemo } from 'react';
import { IPageAction } from '../../../../../../framework';
import { IAwxView } from '../../../../common/useAwxView';
import { Instance } from '../../../../interfaces/Instance';
import { useRunHealthCheckToolbarAction } from '../../../instances/hooks/useInstanceToolbarActions';

export function useIGInstanceToolbarActions(view: IAwxView<Instance>) {
  const healthCheckAction = useRunHealthCheckToolbarAction(view, true);

  return useMemo<IPageAction<Instance>[]>(() => {
    return [healthCheckAction];
  }, [healthCheckAction]);
}
