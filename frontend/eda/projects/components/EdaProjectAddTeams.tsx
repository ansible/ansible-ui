import { PageWizard, PageWizardStep } from '../../../../framework';
import { SelectEdaTeamsStep } from '../../access/teams/components/steps/SelectEdaTeamsStep';

export function EdaProjectAddTeams() {
  const steps: PageWizardStep[] = [
    {
      id: 'teams',
      label: 'Select Teams',
      inputs: <SelectEdaTeamsStep />,
    },
    { id: 'review', label: 'Review', element: <div>TODO</div> },
  ];

  const onSubmit = async (/* data */) => {
    // console.log(data);
  };

  return <PageWizard steps={steps} onSubmit={onSubmit} disableGrid />;
}
