import { PageWizard, PageWizardStep } from '../../../../../framework';
import { AwxSelectUsersStep } from '../../users/components/steps/SelectAwxUsersStep';

export function AddOrganizationUsers() {
  const steps: PageWizardStep[] = [
    {
      id: 'user',
      label: 'Select User',
      inputs: <AwxSelectUsersStep />,
    },
    { id: 'review', label: 'Review', element: <div>hi</div> },
  ];

  const onSubmit = (data) => {
    console.log(data);
  };

  return <PageWizard steps={steps} onSubmit={onSubmit} disableGrid />;
}
