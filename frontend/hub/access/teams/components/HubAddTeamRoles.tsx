import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  ITableColumn,
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
import { hubErrorAdapter } from '../../../common/adapters/hubErrorAdapter';
import { hubAPI } from '../../../common/api/formatPath';
import { parsePulpIDFromURL } from '../../../common/api/hub-api-utils';
import { useHubBulkActionDialog } from '../../../common/useHubBulkActionDialog';
import { HubRbacRole } from '../../../interfaces/expanded/HubRbacRole';
import { HubTeam } from '../../../interfaces/expanded/HubTeam';
import { HubRoute } from '../../../main/HubRoutes';
import {
  HubResourceType,
  HubSelectResourcesStep,
} from '../../common/HubRoleWizardSteps/HubSelectResourcesStep';
import { HubSelectResourceTypeStep } from '../../common/HubRoleWizardSteps/HubSelectResourceTypeStep';
import { HubSelectRolesStep } from '../../common/HubRoleWizardSteps/HubSelectRolesStep';

type ResourceTypeWithID = { id: number | string };
type ResourceTypeWithPulpHref = { pulp_href: string };

interface WizardFormValues {
  resourceType: string;
  resources: HubResourceType[];
  hubRoles: HubRbacRole[];
}

interface ResourceRolePair {
  resource?: HubResourceType;
  role: HubRbacRole;
}

export function HubAddTeamRoles(props: Readonly<{ id?: string; teamRolesRoute?: string }>) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const progressDialog = useHubBulkActionDialog<ResourceRolePair>();

  const { data: team, isLoading } = useGet<HubTeam>(
    hubAPI`/_ui/v2/teams/${props.id || params.id || ''}/`
  );

  if (isLoading || !team) return <LoadingPage />;

  const steps: PageWizardStep[] = [
    {
      id: 'resource-type',
      label: t('Select a resource type'),
      inputs: <HubSelectResourceTypeStep />,
    },
    {
      id: 'resources',
      label: t('Select resources'),
      inputs: <HubSelectResourcesStep />,
      validate: (formData, _) => {
        const { resources } = formData as { resources: HubResourceType[] };
        if (!resources?.length) {
          throw new Error(t('Select at least one resource.'));
        }
      },
      hidden: (wizardData) => {
        const { resourceType } = wizardData as WizardFormValues;
        return !resourceType || resourceType === 'system';
      },
    },
    {
      id: 'roles',
      label: t('Select roles to apply'),
      inputs: <HubSelectRolesStep fieldNameForPreviousStep="resources" />,
      validate: (formData, _) => {
        const { hubRoles } = formData as { hubRoles: HubRbacRole[] };
        if (!hubRoles?.length) {
          throw new Error(t('Select at least one role.'));
        }
      },
    },
    { id: 'review', label: t('Review'), element: <RoleAssignmentsReviewStep /> },
  ];

  const onSubmit = (data: WizardFormValues) => {
    const { resources, hubRoles, resourceType } = data;
    const items: ResourceRolePair[] = [];
    for (const role of hubRoles) {
      if (!resources?.length) {
        items.push({ role });
      } else {
        for (const resource of resources) {
          items.push({ resource, role });
        }
      }
    }
    const actionColumns: ITableColumn<ResourceRolePair>[] =
      resourceType === 'system'
        ? [{ header: t('Role'), cell: ({ role }) => role.name }]
        : [
            {
              header: t('Resource name'),
              cell: ({ resource }) => resource?.name,
            },
            { header: t('Role'), cell: ({ role }) => role.name },
          ];

    return new Promise<void>((resolve) => {
      progressDialog({
        title: t('Add roles'),
        keyFn: ({ resource, role }) =>
          `${(resource as ResourceTypeWithID)?.id ?? parsePulpIDFromURL((resource as ResourceTypeWithPulpHref)?.pulp_href)}_${role.id}`,
        items,
        actionColumns,
        actionFn: ({ resource, role }) =>
          postRequest(hubAPI`/_ui/v2/role_team_assignments/`, {
            team: team.id,
            role_definition: role.id,
            content_type: resourceType === 'system' ? null : resourceType,
            object_id:
              resourceType !== 'system'
                ? (resource as ResourceTypeWithID).id ??
                  parsePulpIDFromURL((resource as ResourceTypeWithPulpHref)?.pulp_href)
                : undefined,
          }),
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(props.teamRolesRoute ?? HubRoute.TeamRoles, {
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
          { label: t('Teams'), to: getPageUrl(HubRoute.Teams) },
          {
            label: team?.name,
            to: getPageUrl(HubRoute.TeamDetails, { params: { id: team?.id } }),
          },
          {
            label: t('Roles'),
            to: getPageUrl(HubRoute.TeamRoles, { params: { id: team?.id } }),
          },
          { label: t('Add roles') },
        ]}
      />
      <PageWizard<WizardFormValues>
        errorAdapter={hubErrorAdapter}
        steps={steps}
        onSubmit={onSubmit}
        onCancel={() => {
          pageNavigate(props.teamRolesRoute || HubRoute.TeamRoles, { params: { id: params.id } });
        }}
        disableGrid
      />
    </PageLayout>
  );
}
