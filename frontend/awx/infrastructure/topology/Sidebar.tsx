import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { Instance } from '../../interfaces/Instance';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { InstanceDetailsTab } from '../instances/InstanceDetails';
import { useInstanceActions } from '../instances/hooks/useInstanceActions';

export function InstanceDetailInner(props: {
  instance: Instance;
  instanceGroups: AwxItemsResponse<InstanceGroup> | undefined;
  instanceForks: number;
  handleToggleInstance: (instance: Instance, isEnabled: boolean) => Promise<void>;
  handleInstanceForksSlider: (instance: Instance, value: number) => Promise<void>;
}) {
  const {
    instance,
    instanceGroups,
    instanceForks,
    handleToggleInstance,
    handleInstanceForksSlider,
  } = props;
  return (
    <InstanceDetailsTab
      numberOfColumns="single"
      instance={instance}
      instanceGroups={instanceGroups}
      handleToggleInstance={handleToggleInstance}
      instanceForks={instanceForks}
      handleInstanceForksSlider={handleInstanceForksSlider}
    />
  );
}

export function InstanceDetailSidebar(props: { selectedId: string }) {
  const { selectedId } = props;
  const {
    instance,
    instanceGroups,
    handleToggleInstance,
    handleInstanceForksSlider,
    instanceForks,
  } = useInstanceActions(selectedId);

  return instance ? (
    <InstanceDetailInner
      instance={instance}
      instanceGroups={instanceGroups ? instanceGroups : undefined}
      handleToggleInstance={handleToggleInstance}
      handleInstanceForksSlider={handleInstanceForksSlider}
      instanceForks={instanceForks}
    />
  ) : null;
}
