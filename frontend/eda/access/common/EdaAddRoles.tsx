import { PageWizard, PageWizardStep } from '@ansible/ansible-ui-framework';
import { RoleAssignmentsReviewStep } from '@ansible/common-ui/access/RolesWizard/steps/RoleAssignmentsReviewStep';
import { postRequest } from '@ansible/common-ui/crud/Data';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../common/eda-utils';
import { useEdaBulkActionDialog } from '../../common/useEdaBulkActionDialog';
import { EdaRbacRole } from '../../interfaces/EdaRbacRole';
import { EdaSelectResourceTypeStep } from '../common/EdaRolesWizardSteps/EdaSelectResourceTypeStep';
import {
  EdaResourceType,
  EdaSelectResourcesStep,
} from '../common/EdaRolesWizardSteps/EdaSelectResourcesStep';
import { EdaSelectRolesStep } from '../common/EdaRolesWizardSteps/EdaSelectRolesStep';

interface WizardFormValues {
  resourceType: string;
  resources: EdaResourceType[];
  edaRoles: EdaRbacRole[];
}

interface ResourceRolePair {
  resource: EdaResourceType;
  role: EdaRbacRole;
}

interface RoleResponse {
  role_definition: number;
  content_type: string;
  object_id: number;
  user?: string;
  team?: string;
}

export function EdaAddRoles(props: {
  id: string;
  type: 'team' | 'user';
  resourceName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const progressDialog = useEdaBulkActionDialog<ResourceRolePair>();

  const steps: PageWizardStep[] = [
    {
      id: 'resource-type',
      label: t('Select a resource type'),
      inputs: <EdaSelectResourceTypeStep />,
    },
    {
      id: 'resources',
      label: t('Select resources'),
      inputs: <EdaSelectResourcesStep userOrTeamName={props.resourceName} />,
      validate: (formData, _) => {
        const { resources } = formData as { resources: EdaResourceType[] };
        if (!resources?.length) {
          throw new Error(t('Select at least one resource.'));
        }
      },
    },
    {
      id: 'roles',
      label: t('Select roles to apply'),
      inputs: <EdaSelectRolesStep fieldNameForPreviousStep="resources" />,
      validate: (formData, _) => {
        const { edaRoles } = formData as { edaRoles: EdaRbacRole[] };
        if (!edaRoles?.length) {
          throw new Error(t('Select at least one role.'));
        }
      },
    },
    { id: 'review', label: t('Review'), element: <RoleAssignmentsReviewStep /> },
  ];

  const onSubmit = (data: WizardFormValues) => {
    const { resources, edaRoles, resourceType } = data;
    const items: ResourceRolePair[] = [];
    for (const resource of resources) {
      for (const role of edaRoles) {
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
          props.type === 'user' ? (data.user = props.id) : (data.team = props.id);
          return postRequest(edaAPI`/role_${props.type}_assignments/`, data);
        },
        onComplete: () => {
          resolve();
        },
        onClose: props.onClose,
      });
    });
  };

  return (
    <PageWizard<WizardFormValues>
      steps={steps}
      onSubmit={onSubmit}
      onCancel={props.onClose}
      disableGrid
    />
  );
}
