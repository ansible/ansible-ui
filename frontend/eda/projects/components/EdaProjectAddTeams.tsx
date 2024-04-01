import { PageWizard, PageWizardStep } from '../../../../framework';
import { EdaSelectTeamsStep } from '../../access/teams/components/steps/EdaSelectTeamsStep';

export function EdaProjectAddTeams() {
  const steps: PageWizardStep[] = [
    {
      id: 'teams',
      label: 'Select Teams',
      inputs: <EdaSelectTeamsStep />,
    },
    { id: 'review', label: 'Review', element: <div>TODO</div> },
  ];

  const onSubmit = async (/* data */) => {
    // console.log(data);
  };

  return <PageWizard steps={steps} onSubmit={onSubmit} disableGrid />;
}
