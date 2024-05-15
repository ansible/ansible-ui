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
} from '../../../../framework';
import { AwxSelectUsersStep } from '../../access/common/AwxRolesWizardSteps/AwxSelectUsersStep';
import { AwxSelectRolesStep } from '../../access/common/AwxRolesWizardSteps/AwxSelectRolesStep';
import { AwxRoute } from '../../main/AwxRoutes';
import { useGet } from '../../../common/crud/useGet';
import { awxAPI } from '../../common/api/awx-utils';
import { postRequest } from '../../../common/crud/Data';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { AwxUser } from '../../interfaces/User';
import { Role } from '../../interfaces/Role';
import { RoleAssignmentsReviewStep } from '../../../common/access/RolesWizard/steps/RoleAssignmentsReviewStep';
import { useAwxBulkActionDialog } from '../../common/useAwxBulkActionDialog';

interface WizardFormValues {
  users: AwxUser[];
  awxRoles: Role[];
}

interface UserRolePair {
  user: AwxUser;
  role: Role;
}

export function InstanceGroupAddUsers() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string }>();

  const { data: instanceGroup, isLoading } = useGet<InstanceGroup>(
    awxAPI`/instance_groups/${params.id ?? ''}/`
  );
  const userProgressDialog = useAwxBulkActionDialog<UserRolePair>();
  const pageNavigate = usePageNavigate();

  if (isLoading || !instanceGroup) return <LoadingPage />;

  const steps: PageWizardStep[] = [
    {
      id: 'users',
      label: t('Select user(s)'),
      inputs: (
        <AwxSelectUsersStep
          descriptionForUsersSelection={t(
            'Select the user(s) that you want to give access to {{instanceGroupName}}.',
            {
              instanceGroupName: instanceGroup?.name,
            }
          )}
        />
      ),
      validate: (formData, _) => {
        const { users } = formData as WizardFormValues;
        if (!users?.length) {
          throw new Error(t('Select at least one user.'));
        }
      },
    },
    {
      id: 'roles',
      label: t('Select roles to apply'),
      inputs: (
        <AwxSelectRolesStep
          contentType="instancegroup"
          fieldNameForPreviousStep="users"
          descriptionForRoleSelection={t('Choose roles to apply to {{instanceGroupName}}.', {
            instanceGroupName: instanceGroup?.name,
          })}
        />
      ),
      validate: (formData, _) => {
        const { awxRoles } = formData as WizardFormValues;
        if (!awxRoles?.length) {
          throw new Error(t('Select at least one role.'));
        }
      },
    },
    {
      id: 'review',
      label: t('Review'),
      inputs: <RoleAssignmentsReviewStep />,
    },
  ];

  const onSubmit = (data: WizardFormValues) => {
    const { users, awxRoles } = data;
    const items: UserRolePair[] = [];
    for (const user of users) {
      for (const role of awxRoles) {
        items.push({ user, role });
      }
    }
    return new Promise<void>((resolve) => {
      userProgressDialog({
        title: t('Add roles'),
        keyFn: ({ user, role }) => `${user.id}_${role.id}`,
        items,
        actionColumns: [
          { header: t('User'), cell: ({ user }) => user.username },
          { header: t('Role'), cell: ({ role }) => role.name },
        ],
        actionFn: ({ user, role }) =>
          postRequest(awxAPI`/role_user_assignments/`, {
            user: user.id,
            role_definition: role.id,
            content_type: 'instancegroup',
            object_id: instanceGroup.id,
          }),
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          const instanceType = instanceGroup.is_container_group
            ? 'container-group'
            : 'instance-group';
          pageNavigate(AwxRoute.InstanceGroupUserAccess, {
            params: { id: instanceGroup.id.toString(), instanceType },
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
          { label: t('Instance groups'), to: getPageUrl(AwxRoute.InstanceGroups) },
          {
            label: instanceGroup?.name,
            to: getPageUrl(AwxRoute.InstanceGroupDetails, {
              params: {
                id: instanceGroup?.id,
                instanceType: instanceGroup?.is_container_group
                  ? 'container-group'
                  : 'instance-group',
              },
            }),
          },
          {
            label: t('User access'),
            to: getPageUrl(AwxRoute.InstanceGroupUserAccess, {
              params: {
                id: instanceGroup?.id,
                instanceType: instanceGroup?.is_container_group
                  ? 'container-group'
                  : 'instance-group',
              },
            }),
          },
          { label: t('Add roles') },
        ]}
      />
      <PageWizard<WizardFormValues>
        steps={steps}
        onSubmit={onSubmit}
        disableGrid
        onCancel={() => {
          pageNavigate(AwxRoute.InstanceGroupUserAccess, { params: { id: instanceGroup?.id } });
        }}
      />
    </PageLayout>
  );
}
