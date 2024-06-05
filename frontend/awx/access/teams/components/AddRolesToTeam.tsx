import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { RoleAssignmentsReviewStep } from '../../../../common/access/RolesWizard/steps/RoleAssignmentsReviewStep';
import { postRequest } from '../../../../common/crud/Data';
import { useGet } from '../../../../common/crud/useGet';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkActionDialog } from '../../../common/useAwxBulkActionDialog';
import { AwxRbacRole } from '../../../interfaces/AwxRbacRole';
import { Team } from '../../../interfaces/Team';
import { AwxRoute } from '../../../main/AwxRoutes';
import { AwxSelectResourceTypeStep } from '../../common/AwxRolesWizardSteps/AwxSelectResourceTypeStep';
import {
  AwxResourceType,
  AwxSelectResourcesStep,
} from '../../common/AwxRolesWizardSteps/AwxSelectResourcesStep';
import { AwxSelectRolesStep } from '../../common/AwxRolesWizardSteps/AwxSelectRolesStep';
interface WizardFormValues {
  resourceType: string;
  resources: AwxResourceType[];
  awxRoles: AwxRbacRole[];
}

interface ResourceRolePair {
  resource: AwxResourceType;
  role: AwxRbacRole;
}

export function AddRolesToTeam(props: { id?: string; teamRolesRoute?: string }) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const progressDialog = useAwxBulkActionDialog<ResourceRolePair>();
  // Use ansible_id to retrieve team
  const { data: team, isLoading } = useGet<Team>(awxAPI`/teams/${props.id || params.id || ''}/`);

  if (isLoading || !team) return <LoadingPage />;

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
        actionFn: ({ resource, role }) =>
          postRequest(awxAPI`/role_team_assignments/`, {
            team: team.id,
            role_definition: role.id,
            content_type: resourceType,
            object_id: resource.id,
          }),
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(props.teamRolesRoute || AwxRoute.TeamRoles, {
            params: { id: params.id },
          });
        },
      });
    });
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Add roles')}
        breadcrumbs={[
          { label: t('Teams'), to: getPageUrl(AwxRoute.Teams) },
          {
            label: team?.name,
            to: getPageUrl(AwxRoute.TeamDetails, { params: { id: team?.id } }),
          },
          {
            label: t('Roles'),
            to: getPageUrl(AwxRoute.TeamRoles, { params: { id: team?.id } }),
          },
          { label: t('Add roles') },
        ]}
      />
      <PageWizard<WizardFormValues>
        errorAdapter={awxErrorAdapter}
        steps={steps}
        onSubmit={onSubmit}
        onCancel={() => {
          pageNavigate(props.teamRolesRoute || AwxRoute.TeamRoles, { params: { id: params.id } });
        }}
        disableGrid
      />
    </PageLayout>
  );
}
