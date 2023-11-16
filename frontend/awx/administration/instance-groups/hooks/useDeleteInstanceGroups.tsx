import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete, requestGet } from '../../../../common/crud/Data';
import { awxAPI } from '../../../api/awx-utils';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { useInstanceGroupsColumns } from './useInstanceGroupColumns';
import { Organization } from '../../../interfaces/Organization';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { Inventory } from '../../../interfaces/Inventory';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';

async function checkIfInstanceGroupIsBeingUsed(instanceGroup: InstanceGroup) {
  const relatedOrganizationsData = await requestGet<AwxItemsResponse<Organization>>(
    awxAPI`/organizations/?instance_groups=${instanceGroup.id.toString()}`
  );
  const relatedInventoriesData = await requestGet<AwxItemsResponse<Inventory>>(
    awxAPI`/inventories/?instance_groups=${instanceGroup.id.toString()}`
  );
  const relatedTemplatesData = await requestGet<
    AwxItemsResponse<JobTemplate | WorkflowJobTemplate>
  >(awxAPI`/unified_job_templates/?instance_groups=${instanceGroup.id.toString()}`);

  return {
    totalResourceCount:
      relatedOrganizationsData?.count + relatedTemplatesData?.count + relatedInventoriesData?.count,
    relatedOrganizationsCount: relatedOrganizationsData?.count ?? 0,
    relatedInventoriesCount: relatedInventoriesData?.count ?? 0,
    relatedTemplatesCount: relatedTemplatesData?.count ?? 0,
  };
}

export function useDeleteInstanceGroups(onComplete: (instanceGroups: InstanceGroup[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useInstanceGroupsColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useBulkConfirmation<InstanceGroup>();
  const cannotDeleteInstanceGroup = (instanceGroup: InstanceGroup) => {
    return instanceGroup?.summary_fields?.user_capabilities?.delete
      ? undefined
      : t('The instance group cannot be deleted due to insufficient permission.');
  };

  const deleteInstanceGroups = async (instanceGroups: InstanceGroup[]) => {
    const undeletableInstanceGroups = instanceGroups.filter(cannotDeleteInstanceGroup);
    const isInstanceGroupBeingUsed = await checkIfInstanceGroupIsBeingUsed(instanceGroups[0]);

    let alertPrompts: string[] = [];
    if (instanceGroups.length > 1) {
      alertPrompts = [
        t('Deleting instance groups could impact other resources that rely on them.', {
          count: instanceGroups.length - undeletableInstanceGroups.length,
        }),
      ];
    }
    if (undeletableInstanceGroups.length > 0) {
      alertPrompts.push(
        t(
          '{{count}} of the selected instance groups cannot be deleted due to insufficient permission.',
          {
            count: undeletableInstanceGroups.length,
          }
        )
      );
    }
    if (instanceGroups.length === 1 && !undeletableInstanceGroups.length) {
      if (isInstanceGroupBeingUsed?.totalResourceCount > 0) {
        let relatedResourceMessage = t(
          'This instance group is currently being used by other resources: '
        );
        if (isInstanceGroupBeingUsed.relatedTemplatesCount > 0) {
          if (
            isInstanceGroupBeingUsed.totalResourceCount -
              isInstanceGroupBeingUsed.relatedTemplatesCount >
            0
          ) {
            relatedResourceMessage += t('{{count}} templates, ', {
              count: isInstanceGroupBeingUsed.relatedTemplatesCount,
            });
          } else {
            relatedResourceMessage += t('{{count}} templates', {
              count: isInstanceGroupBeingUsed.relatedTemplatesCount,
            });
          }
        }
        if (isInstanceGroupBeingUsed.relatedOrganizationsCount > 0) {
          if (isInstanceGroupBeingUsed.relatedInventoriesCount > 0) {
            relatedResourceMessage += t('{{count}} organizations, ', {
              count: isInstanceGroupBeingUsed.relatedOrganizationsCount,
            });
          } else {
            relatedResourceMessage += t('{{count}} organizations', {
              count: isInstanceGroupBeingUsed.relatedOrganizationsCount,
            });
          }
        }
        if (isInstanceGroupBeingUsed.relatedInventoriesCount > 0) {
          relatedResourceMessage += t('{{count}} inventories', {
            count: isInstanceGroupBeingUsed.relatedInventoriesCount,
          });
        }
        alertPrompts = [relatedResourceMessage];
      }
    }

    bulkAction({
      title:
        instanceGroups.length === 1
          ? t('Permanently delete instance group')
          : t('Permanently delete instance groups'),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} instance groups.', {
        count: instanceGroups.length - undeletableInstanceGroups.length,
      }),
      actionButtonText: t('Delete instance group', {
        count: instanceGroups.length - undeletableInstanceGroups.length,
      }),
      items: instanceGroups.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (instanceGroup: InstanceGroup, signal) =>
        requestDelete(awxAPI`/instance_groups/${instanceGroup.id.toString()}/`, signal),
      alertPrompts,
      isItemNonActionable: cannotDeleteInstanceGroup,
    });
  };
  return deleteInstanceGroups;
}
