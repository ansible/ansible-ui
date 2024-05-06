import { useTranslation } from 'react-i18next';
import { UnifiedJobType } from '../types';

export function useGetNodeTypeDetail(type?: UnifiedJobType) {
  const { t } = useTranslation();
  const typeMapping = {
    job: t('Job template'),
    workflow_job: t('Workflow job template'),
    project_update: t('Project'),
    inventory_update: t('Inventory source'),
    workflow_approval: t('Workflow approval'),
    system_job: t('Management job'),
  };
  if (!type) return null;
  return typeMapping[type];
}
