import { useParams } from 'react-router-dom';
import { InstancesList } from '../../instances/components/InstancesList';
import { useIGInstanceToolbarActions } from './hooks/useIGInstanceToolbarActions';

export function InstanceGroupInstances() {
  const params = useParams<{ id?: string }>();
  const { id } = params;

  return <InstancesList useToolbarActions={useIGInstanceToolbarActions} id={id} />;
}
