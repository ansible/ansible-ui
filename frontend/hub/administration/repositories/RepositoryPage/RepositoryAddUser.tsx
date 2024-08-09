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
import { HubSelectRolesStep } from '../../../access/common/HubRoleWizardSteps/HubSelectRolesStep';
import { HubSelectUsersStep } from '../../../access/common/HubRoleWizardSteps/HubSelectUsersStep';
import { hubErrorAdapter } from '../../../common/adapters/hubErrorAdapter';
import { hubAPI, pulpAPI } from '../../../common/api/formatPath';
import { parsePulpIDFromURL } from '../../../common/api/hub-api-utils';
import { HubError } from '../../../common/HubError';
import { useHubBulkActionDialog } from '../../../common/useHubBulkActionDialog';
import { PulpItemsResponse } from '../../../common/useHubView';
import { HubRbacRole } from '../../../interfaces/expanded/HubRbacRole';
import { HubUser } from '../../../interfaces/expanded/HubUser';
import { HubRoute } from '../../../main/HubRoutes';
import { Repository } from '../Repository';

interface WizardFormValues {
  users: HubUser[];
  hubRoles: HubRbacRole[];
}

interface UserRolePair {
  user: HubUser;
  role: HubRbacRole;
}

export function RepositoryAddUsers() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const userProgressDialog = useHubBulkActionDialog<UserRolePair>();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string }>();

  const { data, error, refresh } = useGet<PulpItemsResponse<Repository>>(
    params.id ? pulpAPI`/repositories/ansible/ansible/?name=${params.id}` : ''
  );

  let repository: Repository | undefined = undefined;
  if (data && data.results && data.results.length > 0) {
    repository = data.results[0];
  }

  if (!data && !error) {
    return <LoadingPage />;
  }

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  const steps: PageWizardStep[] = [
    {
      id: 'users',
      label: t('Select user(s)'),
      inputs: (
        <HubSelectUsersStep
          descriptionForUsersSelection={t(
            'Select the user(s) that you want to give access to {{repository}}.',
            {
              repository: repository?.name,
            }
          )}
        />
      ),
      validate: (formData, _) => {
        const { users } = formData as { users: HubUser[] };
        if (!users?.length) {
          throw new Error(t('Select at least one user.'));
        }
      },
    },
    {
      id: 'roles',
      label: t('Select roles to apply'),
      inputs: (
        <HubSelectRolesStep
          contentType="ansiblerepository"
          fieldNameForPreviousStep="users"
          descriptionForRoleSelection={t('Choose roles to apply to {{repository}}.', {
            repository: repository?.name,
          })}
        />
      ),
      validate: (formData, _) => {
        const { hubRoles } = formData as { hubRoles: HubRbacRole[] };
        if (!hubRoles?.length) {
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
    const { users, hubRoles } = data;
    const items: UserRolePair[] = [];
    for (const user of users) {
      for (const role of hubRoles) {
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
          postRequest(hubAPI`/_ui/v2/role_user_assignments/`, {
            user: user.id,
            role_definition: role.id,
            content_type: 'galaxy.ansiblerepository',
            object_id: parsePulpIDFromURL(repository?.pulp_href),
          }),
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(HubRoute.RepositoryUserAccess, {
            params: { id: repository?.name },
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
          { label: t('Repositories'), to: getPageUrl(HubRoute.Repositories) },
          {
            label: repository?.name,
            to: getPageUrl(HubRoute.RepositoryDetails, { params: { id: repository?.name } }),
          },
          {
            label: t('User Access'),
            to: getPageUrl(HubRoute.RepositoryUserAccess, { params: { id: repository?.name } }),
          },
          { label: t('Add roles') },
        ]}
      />
      <PageWizard<WizardFormValues>
        errorAdapter={hubErrorAdapter}
        steps={steps}
        onSubmit={onSubmit}
        disableGrid
        onCancel={() => {
          pageNavigate(HubRoute.RepositoryUserAccess, { params: { id: repository?.name } });
        }}
      />
    </PageLayout>
  );
}
