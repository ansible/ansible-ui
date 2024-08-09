import { useTranslation } from 'react-i18next';
import { HubRbacRole } from '../../../interfaces/expanded/HubRbacRole';
import {
  HubResourceType,
  HubSelectResourcesStep,
} from '../../common/HubRoleWizardSteps/HubSelectResourcesStep';
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
import { useHubBulkActionDialog } from '../../../common/useHubBulkActionDialog';
import { hubAPI } from '../../../common/api/formatPath';
import { useGet } from '../../../../common/crud/useGet';
import { HubUser } from '../../../interfaces/expanded/HubUser';
import { HubSelectResourceTypeStep } from '../../common/HubRoleWizardSteps/HubSelectResourceTypeStep';
import { HubSelectRolesStep } from '../../common/HubRoleWizardSteps/HubSelectRolesStep';
import { RoleAssignmentsReviewStep } from '../../../../common/access/RolesWizard/steps/RoleAssignmentsReviewStep';
import { parsePulpIDFromURL } from '../../../common/api/hub-api-utils';
import { postRequest } from '../../../../common/crud/Data';
import { HubRoute } from '../../../main/HubRoutes';
import { hubErrorAdapter } from '../../../common/adapters/hubErrorAdapter';

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

export function HubAddUserRoles(props: { id?: string; userRolesRoute?: string }) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const progressDialog = useHubBulkActionDialog<ResourceRolePair>();

  const { data: user, isLoading } = useGet<HubUser>(
    hubAPI`/_ui/v2/users/${props.id || params.id || ''}/`
  );

  if (isLoading || !user) return <LoadingPage />;

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
        return resourceType === 'system';
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
          postRequest(hubAPI`/_ui/v2/role_user_assignments/`, {
            user: user.id,
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
          pageNavigate(props.userRolesRoute || HubRoute.UserRoles, {
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
          { label: t('Users'), to: getPageUrl(HubRoute.Users) },
          {
            label: user?.username,
            to: getPageUrl(HubRoute.UserDetails, { params: { id: user?.id } }),
          },
          {
            label: t('Roles'),
            to: getPageUrl(HubRoute.UserRoles, { params: { id: user?.id } }),
          },
          { label: t('Add roles') },
        ]}
      />
      <PageWizard<WizardFormValues>
        errorAdapter={hubErrorAdapter}
        steps={steps}
        onSubmit={onSubmit}
        onCancel={() => {
          pageNavigate(props.userRolesRoute || HubRoute.UserRoles, { params: { id: params.id } });
        }}
        disableGrid
      />
    </PageLayout>
  );
}
