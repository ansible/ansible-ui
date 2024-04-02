import { useTranslation } from 'react-i18next';
import {
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
} from '../../../../framework';
import { EdaSelectRolesStep } from '../../access/roles/components/EdaSelectRolesStep';
import { EdaSelectUsersStep } from '../../access/users/components/EdaSelectUsersStep';
import { EdaRoute } from '../../main/EdaRoutes';
import { EdaProject } from '../../interfaces/EdaProject';
import { useParams } from 'react-router-dom';
import { useGet } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaUser } from '../../interfaces/EdaUser';
import { RoleAssignmentsReviewStep } from '../../../common/access/RolesWizard/steps/RoleAssignmentsReviewStep';
import { EdaRbacRole } from '../../interfaces/EdaRbacRole';

export function EdaProjectAddUsers() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string }>();
  const { data: project } = useGet<EdaProject>(edaAPI`/projects/${params.id ?? ''}/`);

  const steps: PageWizardStep[] = [
    {
      id: 'users',
      label: t('Select user(s)'),
      inputs: <EdaSelectUsersStep />,
      validate: (formData, _) => {
        const { users } = formData as { users: EdaUser[] };
        if (!users?.length) {
          throw new Error(t('Select at least one user.'));
        }
      },
    },
    {
      id: 'roles',
      label: t('Select roles to apply'),
      inputs: (
        <EdaSelectRolesStep
          contentType="project"
          fieldNameForPreviousStep="users"
          descriptionForRoleSelection={t('Choose roles to apply to {{projectName}}.', {
            projectName: project?.name,
          })}
        />
      ),
      validate: (formData, _) => {
        const { roles } = formData as { roles: EdaRbacRole[] };
        if (!roles?.length) {
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

  const onSubmit = async (/* data */) => {
    // console.log(data);
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Add roles')}
        breadcrumbs={[
          { label: t('Projects'), to: getPageUrl(EdaRoute.Projects) },
          {
            label: project?.name,
            to: getPageUrl(EdaRoute.ProjectDetails, { params: { id: project?.id } }),
          },
          {
            label: t('User Access'),
            to: getPageUrl(EdaRoute.ProjectUsers, { params: { id: project?.id } }),
          },
          { label: t('Add roles') },
        ]}
      />
      <PageWizard steps={steps} onSubmit={onSubmit} disableGrid />
    </PageLayout>
  );
}
