import { InstanceDetailsTab } from '../instances/InstanceDetails';
import { Instance } from '../../interfaces/Instance';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { useInstanceActions } from '../instances/hooks/useInstanceActions';

export function InstanceDetailInner(props: {
  instance: Instance;
  instanceGroups: AwxItemsResponse<InstanceGroup> | undefined;
  instanceForks: number;
  handleInstanceForksSlider: (instance: Instance, value: number) => Promise<void>;
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

export function InstanceDetailSidebar(props: { selectedId: string }) {
  const { selectedId } = props;
  const { instance, instanceGroups, handleInstanceForksSlider, instanceForks } =
    useInstanceActions(selectedId);

  return instance ? (
    <InstanceDetailInner
      instance={instance}
      instanceGroups={instanceGroups ? instanceGroups : undefined}
      handleInstanceForksSlider={handleInstanceForksSlider}
      instanceForks={instanceForks}
    />
  ) : null;
}
