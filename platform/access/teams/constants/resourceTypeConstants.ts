export const SERVICE_DISPLAY_NAMES = {
  awx: 'Automation Execution',
  eda: 'Automation Decisions',
  galaxy: 'Automation Content',
} as const;

export const ALLOWED_GALAXY_TYPES = [
  'galaxy.ansiblerepository',
  'galaxy.collectionremote',
  'galaxy.containernamespace',
  'galaxy.namespace',
  'system',
] as const;

export const ALLOWED_EDA_TYPES = [
  'eda.activation',
  'eda.edacredential',
  'eda.project',
  'eda.eventstream',
  'eda.decisionenvironment',
] as const;

export const EXCLUDED_SERVICES = ['shared'] as const;

export type ServiceType = keyof typeof SERVICE_DISPLAY_NAMES;
