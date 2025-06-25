import { PageDetail, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { awxAPI } from '../../../../common/api/awx-utils';
import { InventorySource } from '../../../../interfaces/InventorySource';
import { WorkflowNode } from '../../../../interfaces/WorkflowNode';
import { AwxRoute } from '../../../../main/AwxRoutes';
import { RESOURCE_TYPE } from '../constants';
import { UnifiedJobType } from '../types';

const ResourceLink: Record<UnifiedJobType, AwxRoute> = {
  inventory_update: AwxRoute.InventorySourceDetail,
  job: AwxRoute.JobTemplateDetails,
  project_update: AwxRoute.ProjectDetails,
  system_job: AwxRoute.ManagementJobSchedules,
  workflow_approval: AwxRoute.WorkflowApprovalDetails,
  workflow_job: AwxRoute.WorkflowJobTemplateDetails,
};

export function NodeNameDetail({ nodeData }: { nodeData: WorkflowNode }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const { id, name, unified_job_type: type } = nodeData.summary_fields?.unified_job_template || {};
  let link: ReactNode;

  if (type === RESOURCE_TYPE.inventory_update) {
    link = <InventorySourceLink id={id?.toString() || ''}>{name}</InventorySourceLink>;
  } else if (type) {
    const url = getPageUrl(ResourceLink[type], {
      params: { id },
    });
    link = <Link to={url}>{name}</Link>;
  }

  return (
    <PageDetail label={t('Name')}>
      {type === RESOURCE_TYPE.workflow_approval || type === RESOURCE_TYPE.system_job ? name : link}
    </PageDetail>
  );
}

function InventorySourceLink({ id, children }: { id: string; children: ReactNode }) {
  const getPageUrl = useGetPageUrl();
  const { data: inventorySource } = useGet<InventorySource>(awxAPI`/inventory_sources/${id}/`);

  const inventoryType = inventorySource?.summary_fields?.inventory.kind || 'inventory';
  const inventoryId = inventorySource?.inventory;

  const url = getPageUrl(AwxRoute.InventorySourceDetail, {
    params: {
      source_id: inventorySource?.id,
      id: inventoryId,
      inventory_type: inventoryType,
    },
  });

  return <Link to={url}>{children}</Link>;
}
