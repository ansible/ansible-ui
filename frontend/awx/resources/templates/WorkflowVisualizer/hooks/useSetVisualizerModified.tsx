import { useVisualizationController, useVisualizationState } from '@patternfly/react-topology';

export function useSetVisualizerModified() {
  const { modified } = useVisualizationController().getState<{ modified: boolean }>();
  const [_, setModified] = useVisualizationState<boolean>('modified', modified);
  return (isModified: boolean) => setModified(isModified);
}
