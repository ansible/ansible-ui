import { ITableColumn } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useParams } from 'react-router';
import { Instance } from '../../../interfaces/Instance';
import { InstancesList } from '../../instances/components/InstancesList';
import { useInstancesColumns } from '../../instances/hooks/useInstancesColumns';
import { useIGInstanceRowActions } from './hooks/useIGInstanceRowActions';
import { useIGInstanceToolbarActions } from './hooks/useIGInstanceToolbarActions';
import { useInstanceGroupInstanceNameColumn } from './hooks/useInstanceGroupInstanceNameColumn';

export function InstanceGroupInstances() {
  const params = useParams<{ id?: string }>();
  const { id } = params;
  const nameColumn = useInstanceGroupInstanceNameColumn();
  const instanceColumns = useInstancesColumns();
  const instanceGroupInstanceColumns = useMemo<ITableColumn<Instance>[]>(() => {
    const columns = instanceColumns.filter((column) => column.id !== 'name');
    return [nameColumn, ...columns] as ITableColumn<Instance>[];
  }, [nameColumn, instanceColumns]);
  return (
    <InstancesList
      useToolbarActions={useIGInstanceToolbarActions}
      useRowActions={useIGInstanceRowActions}
      tableColumns={instanceGroupInstanceColumns}
      instanceGroupId={id}
    />
  );
}
