import { InstanceDetailsTab } from '../instances/InstanceDetails';
import { Instance } from '../../interfaces/Instance';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { useInstanceActions } from '../instances/hooks/useInstanceActions';
import { useGetItem } from '../../../common/crud/useGet';
import { awxAPI } from '../../common/api/awx-utils';
import { SidebarHeader } from '../../resources/templates/WorkflowVisualizer/components';

export function InstanceDetailInner(props: {
  instance: Instance;
  instanceGroups: AwxItemsResponse<InstanceGroup> | undefined;
  instanceForks: number;
}) {
  const { instance, instanceGroups, instanceForks } = props;
  return (
    <InstanceDetailsTab
      numberOfColumns="single"
      instance={instance}
      instanceGroups={instanceGroups}
      instanceForks={instanceForks}
    />
  );
}

export function InstanceDetailSidebar(props: { selectedId: string; onClose: () => void }) {
  const { selectedId } = props;
  const { data: instance } = useGetItem<Instance>(awxAPI`/instances/`, selectedId);
  const { instanceGroups, instanceForks } = useInstanceActions(selectedId);

  return instance ? (
    <>
      <SidebarHeader onClose={props.onClose} title={instance.hostname} />
      <InstanceDetailInner
        instance={instance}
        instanceGroups={instanceGroups ? instanceGroups : undefined}
        instanceForks={instanceForks}
      />
    </>
  ) : null;
}
