import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete, requestGet } from '../../../../common/crud/Data';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { Inventory } from '../../../interfaces/Inventory';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { Organization } from '../../../interfaces/Organization';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { useInstanceGroupsColumns } from './useInstanceGroupColumns';

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
  const bulkAction = useAwxBulkConfirmation<InstanceGroup>();
  const cannotDeleteInstanceGroup = (instanceGroup: InstanceGroup) => {
    return instanceGroup?.summary_fields?.user_capabilities?.delete
      ? undefined
      : t('The instance group cannot be deleted due to insufficient permission.');
  };
  const buildAlertPrompts = useCallback(
    async (instanceGroups: InstanceGroup[], undeletableInstanceGroups: InstanceGroup[]) => {
      let alertPrompts: string[] = [];

      /**
       * If multiple instance groups are selected for deletion, display a general alert
       * message that deleting instance groups could impact resources that rely on them
       */
      if (instanceGroups.length > 1) {
        alertPrompts = [
          t('Deleting instance groups could impact other resources that rely on them.', {
            count: instanceGroups.length - undeletableInstanceGroups.length,
          }),
        ];
      }
      // Indicate alert message for instance groups that are undeletable due to insufficient permissions
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
      /**
       * If the deletion is invoked on a single instance group, check if it has related
       * resources and display the count of the related resources in the alert message
       */
      if (instanceGroups.length === 1 && !undeletableInstanceGroups.length) {
        const isInstanceGroupBeingUsed = await checkIfInstanceGroupIsBeingUsed(instanceGroups[0]);
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

      return alertPrompts;
    },
    [t]
  );

  const deleteInstanceGroups = async (instanceGroups: InstanceGroup[]) => {
    const undeletableInstanceGroups = instanceGroups.filter(cannotDeleteInstanceGroup);
    const alertPrompts = await buildAlertPrompts(instanceGroups, undeletableInstanceGroups);

    bulkAction({
      title: t('Permanently delete instance groups', { count: instanceGroups.length }),
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
