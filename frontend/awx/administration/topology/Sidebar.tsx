import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { Instance } from '../../interfaces/Instance';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { SidebarHeader } from '../../resources/templates/WorkflowVisualizer/components';
import { useInstanceActions } from '../instances/hooks/useInstanceActions';
import { InstanceDetailsTab } from '../instances/InstanceDetails';

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
