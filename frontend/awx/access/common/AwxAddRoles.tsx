import { useTranslation } from 'react-i18next';
import { PageWizard, PageWizardStep } from '../../../../framework';
import { RoleAssignmentsReviewStep } from '../../../common/access/RolesWizard/steps/RoleAssignmentsReviewStep';
import { postRequest } from '../../../common/crud/Data';
import { useAwxBulkActionDialog } from '../../common/useAwxBulkActionDialog';
import { AwxSelectResourceTypeStep } from './AwxRolesWizardSteps/AwxSelectResourceTypeStep';
import {
  AwxResourceType,
  AwxSelectResourcesStep,
} from './AwxRolesWizardSteps/AwxSelectResourcesStep';
import { AwxSelectRolesStep } from './AwxRolesWizardSteps/AwxSelectRolesStep';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxRbacRole } from '../../interfaces/AwxRbacRole';

interface WizardFormValues {
  resourceType: string;
  resources: AwxResourceType[];
  awxRoles: AwxRbacRole[];
}

interface ResourceRolePair {
  resource: AwxResourceType;
  role: AwxRbacRole;
}

interface RoleResponse {
  role_definition: number;
  content_type: string;
  object_id: number;
  user?: string;
  team?: string;
}

export function AwxAddRoles(params: { id: string; type: 'team' | 'user'; onClose: () => void }) {
  const { t } = useTranslation();
  const progressDialog = useAwxBulkActionDialog<ResourceRolePair>();

  const steps: PageWizardStep[] = [
    {
      id: 'resource-type',
      label: t('Select a resource type'),
      inputs: <AwxSelectResourceTypeStep />,
    },
    {
      id: 'resources',
      label: t('Select resources'),
      inputs: <AwxSelectResourcesStep />,
      validate: (formData, _) => {
        const { resources } = formData as { resources: AwxResourceType[] };
        if (!resources?.length) {
          throw new Error(t('Select at least one resource.'));
        }
      },
    },
    {
      id: 'roles',
      label: t('Select roles to apply'),
      inputs: <AwxSelectRolesStep fieldNameForPreviousStep="resources" />,
      validate: (formData, _) => {
        const { awxRoles } = formData as { awxRoles: AwxRbacRole[] };
        if (!awxRoles?.length) {
          throw new Error(t('Select at least one role.'));
        }
      },
    },
    { id: 'review', label: t('Review'), element: <RoleAssignmentsReviewStep /> },
  ];

  const onSubmit = (data: WizardFormValues) => {
    const { resources, awxRoles, resourceType } = data;
    const items: ResourceRolePair[] = [];
    for (const resource of resources) {
      for (const role of awxRoles) {
        items.push({ resource, role });
      }
    }
    return new Promise<void>((resolve) => {
      progressDialog({
        title: t('Add roles'),
        keyFn: ({ resource, role }) => `${resource.id}_${role.id}`,
        items,
        actionColumns: [
          { header: t('Resource name'), cell: ({ resource }) => resource.name },
          { header: t('Role'), cell: ({ role }) => role.name },
        ],
        actionFn: ({ resource, role }) => {
          const data: RoleResponse = {
            role_definition: role.id,
            content_type: resourceType,
            object_id: resource.id,
          };
          params.type === 'user' ? (data.user = params.id) : (data.team = params.id);
          return postRequest(awxAPI`/role_${params.type}_assignments/`, data);
        },
        onComplete: () => {
          resolve();
        },
        onClose: params.onClose,
      });
    });
  };

  return (
    <PageWizard<WizardFormValues>
      steps={steps}
      onSubmit={onSubmit}
      onCancel={params.onClose}
      disableGrid
    />
  );
}
