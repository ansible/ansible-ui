import { usePageNavigate } from '@ansible/ansible-ui-framework';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Instance } from '../../../interfaces/Instance';
import { AwxRoute } from '../../../main/AwxRoutes';
import { InstancesList } from '../../instances/components/InstancesList';
import { useInstancesColumns } from '../../instances/hooks/useInstancesColumns';
import { useIGInstanceRowActions } from './hooks/useIGInstanceRowActions';
import { useIGInstanceToolbarActions } from './hooks/useIGInstanceToolbarActions';

export function InstanceGroupInstances() {
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id?: string }>();
  const { id } = params;

  const onNameClick = useCallback(
    (instance: Instance) =>
      pageNavigate(AwxRoute.InstanceGroupInstanceDetails, {
        params: { id: id, instance_id: instance.id },
      }),
    [pageNavigate, id]
  );

  const tableColumns = useInstancesColumns(undefined, onNameClick);

  return (
    <InstancesList
      useToolbarActions={useIGInstanceToolbarActions}
      useRowActions={useIGInstanceRowActions}
      tableColumns={tableColumns}
      instanceGroupId={id}
    />
  );
}
