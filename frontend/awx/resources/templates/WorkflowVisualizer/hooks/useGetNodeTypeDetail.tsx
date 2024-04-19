import { useTranslation } from 'react-i18next';
import { UnifiedJobType } from '../types';

export function useGetNodeTypeDetail(type?: UnifiedJobType) {
  const { t } = useTranslation();
  const typeMapping = {
    job: t('Job Template'),
    workflow_job: t('Workflow Job Template'),
    project_update: t('Project '),
    inventory_update: t('Inventory Source'),
    workflow_approval: t('Workflow Approval'),
    system_job: t('System Job Template'),
  };
  if (!type) return null;
  return typeMapping[type];
}
