import { Chip, ChipGroup, Divider } from '@patternfly/react-core';
import { PageFormInventorySelect } from '../../../resources/inventories/components/PageFormInventorySelect';
import { PageFormHidden } from '../../../../../framework/PageForm/Utils/PageFormHidden';
import { Inventory } from '../../../interfaces/Inventory';
import { PageFormSelect, PageWizardStep, compareStrings } from '../../../../../framework';
import { useTranslation } from 'react-i18next';
import { useGet } from '../../../../common/crud/useGet';
import { CredentialType } from '../../../interfaces/CredentialType';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { PageFormSingleSelect } from '../../../../../framework/PageForm/Inputs/PageFormSingleSelect';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { PageFormMultiSelect } from '../../../../../framework/PageForm/Inputs/PageFormMultiSelect';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { SetStateAction, useEffect } from 'react';
import { ScheduleFormWizard } from '../types';
import { useWatch } from 'react-hook-form';
import { PromptFormValues, WizardFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import { PageFormCredentialSelect } from '../../../access/credentials/components/PageFormCredentialSelect';

export function PromptInputs(props: { onError: (err: Error) => void; }) {
  const { t } = useTranslation();
  const credentialCategories =
    useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/credential_types/`)?.data?.actions?.GET
      ?.kind?.choices ?? [];
  const itemsResponse = useGet<AwxItemsResponse<CredentialType>>(
    awxAPI`/credential_types/?page=1&page_size=200`
  );

  const { wizardData, setStepData, stepData } = usePageWizard() as {
    wizardData;
    stepData;
    setStepData: React.Dispatch<SetStateAction<Record<string, object>>>;
  };
  const promptForm = useWatch<{ prompt: PromptFormValues }>({ name: 'prompt' });

  useEffect(() => {
    setStepData((prev) => ({
      ...prev,
      nodePromptsStep: {
        prompt: promptForm,
      },
    }));
    console.log(promptForm);
  }, [promptForm, setStepData]);
  console.log(wizardData);
  return (
    <>
      <PageFormInventorySelect name="scheduleInventory" isRequired />
      <Divider />
      <PageFormHidden watch="scheduleInventory" hidden={(v: Inventory) => v?.id === undefined}>
        <PageFormCredentialSelect<WizardFormValues>
          name='credentials'
          label={t('Credentials')}
          placeholder={t('Add credentials')}
          labelHelp={t(
            'Select credentials for accessing the nodes this job will be ran against. You can only select one credential of each type. For machine credentials (SSH), checking "Prompt on launch" without selecting credentials will require you to select a machine credential at run time. If you select credentials and check "Prompt on launch", the selected credential(s) become the defaults that can be updated at run time.'
          )}
          isMultiple
        />
      </PageFormHidden>
      <Divider />
    </>
  );
}
