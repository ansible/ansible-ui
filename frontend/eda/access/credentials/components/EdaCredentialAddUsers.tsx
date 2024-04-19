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
import { EdaSelectUsersStep } from '../../../access/common/EdaRolesWizardSteps/EdaSelectUsersStep';
import { EdaSelectRolesStep } from '../../../access/common/EdaRolesWizardSteps/EdaSelectRolesStep';
import { EdaRoute } from '../../../main/EdaRoutes';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { useGet } from '../../../../common/crud/useGet';
import { edaAPI } from '../../../common/eda-utils';
import { postRequest } from '../../../../common/crud/Data';
import { EdaUser } from '../../../interfaces/EdaUser';
import { RoleAssignmentsReviewStep } from '../../../../common/access/RolesWizard/steps/RoleAssignmentsReviewStep';
import { EdaRbacRole } from '../../../interfaces/EdaRbacRole';
import { useEdaBulkActionDialog } from '../../../common/useEdaBulkActionDialog';

interface WizardFormValues {
  users: EdaUser[];
  edaRoles: EdaRbacRole[];
}

interface UserRolePair {
  user: EdaUser;
  role: EdaRbacRole;
}

export function EdaCredentialAddUsers() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string }>();

  const { data: credential, isLoading } = useGet<EdaCredential>(
    edaAPI`/eda-credentials/${params.id ?? ''}/`
  );
  const userProgressDialog = useEdaBulkActionDialog<UserRolePair>();
  const pageNavigate = usePageNavigate();

  if (isLoading || !credential) return <LoadingPage />;

  const steps: PageWizardStep[] = [
    {
      id: 'users',
      label: t('Select user(s)'),
      inputs: (
        <EdaSelectUsersStep
          descriptionForUsersSelection={t(
            'Select the user(s) that you want to give access to {{credentialName}}.',
            {
              credentialName: credential?.name,
            }
          )}
        />
      ),
      validate: (formData, _) => {
        const { users } = formData as { users: EdaUser[] };
        if (!users?.length) {
          throw new Error(t('Select at least one user.'));
        }
      },
    },
    {
      id: 'edaRoles',
      label: t('Select roles to apply'),
      inputs: (
        <EdaSelectRolesStep
          contentType="edacredential"
          fieldNameForPreviousStep="users"
          descriptionForRoleSelection={t('Choose roles to apply to {{credentialName}}.', {
            credentialName: credential?.name,
          })}
        />
      ),
      validate: (formData, _) => {
        const { edaRoles } = formData as { edaRoles: EdaRbacRole[] };
        if (!edaRoles?.length) {
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
    const { users, edaRoles } = data;
    const items: UserRolePair[] = [];
    for (const user of users) {
      for (const role of edaRoles) {
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
          postRequest(edaAPI`/role_user_assignments/`, {
            user: user.id,
            role_definition: role.id,
            content_type: 'eda.edacredential',
            object_id: credential.id,
          }),
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(EdaRoute.CredentialUserAccess, {
            params: { id: credential.id.toString() },
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
          { label: t('Credentials'), to: getPageUrl(EdaRoute.Credentials) },
          {
            label: credential?.name,
            to: getPageUrl(EdaRoute.CredentialDetails, { params: { id: credential?.id } }),
          },
          {
            label: t('User Access'),
            to: getPageUrl(EdaRoute.CredentialUserAccess, { params: { id: credential?.id } }),
          },
          { label: t('Add roles') },
        ]}
      />
      <PageWizard<WizardFormValues>
        steps={steps}
        onSubmit={onSubmit}
        disableGrid
        onCancel={() => {
          pageNavigate(EdaRoute.CredentialUserAccess, { params: { id: credential?.id } });
        }}
      />
    </PageLayout>
  );
}
