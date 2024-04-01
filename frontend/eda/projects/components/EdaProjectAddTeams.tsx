import { useTranslation } from 'react-i18next';
import { PageWizard, PageWizardStep } from '../../../../framework';
import { EdaSelectTeamsStep } from '../../access/teams/components/steps/EdaSelectTeamsStep';
import { EdaTeam } from '../../interfaces/EdaTeam';
import { EdaSelectRolesStep } from '../../access/roles/components/EdaSelectRolesStep';
import { useParams } from 'react-router-dom';
import { useGet } from '../../../common/crud/useGet';
import { EdaProject } from '../../interfaces/EdaProject';
import { edaAPI } from '../../common/eda-utils';

export function EdaProjectAddTeams() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: project } = useGet<EdaProject>(edaAPI`/projects/${params.id ?? ''}/`);

  const steps: PageWizardStep[] = [
    {
      id: 'teams',
      label: t('Select team(s)'),
      inputs: <EdaSelectTeamsStep />,
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
    },
    { id: 'review', label: t('Review'), element: <div>TODO</div> },
  ];

  const onSubmit = async (/* data */) => {
    // console.log(data);
  };

  return <PageWizard steps={steps} onSubmit={onSubmit} disableGrid />;
}
