import { useTranslation } from 'react-i18next';
import {
  LoadingPage,
  PageHeader,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
} from '../../../../framework';
import { EdaSelectTeamsStep } from '../../access/teams/components/steps/EdaSelectTeamsStep';
import { EdaTeam } from '../../interfaces/EdaTeam';
import { EdaSelectRolesStep } from '../../access/roles/components/EdaSelectRolesStep';
import { useParams } from 'react-router-dom';
import { useGet } from '../../../common/crud/useGet';
import { EdaProject } from '../../interfaces/EdaProject';
import { edaAPI } from '../../common/eda-utils';
import { RoleAssignmentsReviewStep } from '../../../common/access/RolesWizard/steps/RoleAssignmentsReviewStep';
import { EdaRbacRole } from '../../interfaces/EdaRbacRole';
import { EdaRoute } from '../../main/EdaRoutes';

export function EdaProjectAddTeams() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string }>();
  const { data: project, isLoading } = useGet<EdaProject>(edaAPI`/projects/${params.id ?? ''}/`);

  if (isLoading) return <LoadingPage />;

  const steps: PageWizardStep[] = [
    {
      id: 'teams',
      label: t('Select team(s)'),
      inputs: (
        <EdaSelectTeamsStep
          descriptionForTeamsSelection={t(
            'Select the team(s) that you want to give access to {{projectName}}.',
            {
              projectName: project?.name,
            }
          )}
        />
      ),
      validate: (formData, _) => {
        const { teams } = formData as { teams: EdaTeam[] };
        if (!teams?.length) {
          throw new Error(t('Select at least one team.'));
        }
      },
    },
    {
      id: 'roles',
      label: t('Select roles to apply'),
      inputs: (
        <EdaSelectRolesStep
          contentType="project"
          fieldNameForPreviousStep="teams"
          descriptionForRoleSelection={t('Choose roles to apply to {{projectName}}.', {
            projectName: project?.name,
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

  const onSubmit = async (/* data */) => {
    // console.log(data);
  };

  return (
    <>
      <PageHeader
        title={t('Add roles')}
        breadcrumbs={[
          { label: t('Projects'), to: getPageUrl(EdaRoute.Projects) },
          {
            label: project?.name,
            to: getPageUrl(EdaRoute.ProjectDetails, { params: { id: project?.id } }),
          },
          {
            label: t('Team Access'),
            to: getPageUrl(EdaRoute.ProjectTeams, { params: { id: project?.id } }),
          },
          { label: t('Add roles') },
        ]}
      />
      <PageWizard steps={steps} onSubmit={onSubmit} disableGrid />
    </>
  );
}
