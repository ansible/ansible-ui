import { useCallback } from 'react';
import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';

interface WizardData {
  resourceType?: string;
}

export function useResourceTypeWizard() {
  const { wizardData, setWizardData, setStepData } = usePageWizard();

  const handleResourceTypeSelection = useCallback(
    (resourceType: string) => {
      const currentResourceType = (wizardData as WizardData).resourceType;

      const shouldResetWizard = currentResourceType && currentResourceType !== resourceType;

      if (shouldResetWizard) {
        setWizardData({ resourceType });
        setStepData({});
      } else {
        setWizardData({ ...wizardData, resourceType });
      }
    },
    [wizardData, setWizardData, setStepData]
  );

  const handleClearSelection = useCallback(() => {
    setWizardData({ ...wizardData, resourceType: undefined });
    setStepData({});
  }, [wizardData, setWizardData, setStepData]);

  return {
    resourceType: (wizardData as WizardData).resourceType,
    handleResourceTypeSelection,
    handleClearSelection,
  };
}
