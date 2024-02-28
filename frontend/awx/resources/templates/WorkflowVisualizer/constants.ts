import type { UnifiedJobType } from './types';

export const GRAPH_ID = 'workflow-visualizer-graph';

export const CONNECTOR_SOURCE_DROP = 'connector-src-drop';
export const CONNECTOR_TARGET_DROP = 'connector-target-drop';
export const NODE_DIAMETER = 50;
export const START_NODE_ID = 'startNode';

export const RESOURCE_TYPE: Record<UnifiedJobType, UnifiedJobType> = {
  job: 'job',
  workflow_job: 'workflow_job',
  project_update: 'project_update',
  workflow_approval: 'workflow_approval',
  inventory_update: 'inventory_update',
  system_job: 'system_job',
};
