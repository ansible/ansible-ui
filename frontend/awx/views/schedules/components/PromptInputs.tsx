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
import { PromptFormValues } from '../../../resources/templates/WorkflowVisualizer/types';

export function PromptInputs(props: { onError: (err: Error) => void; }) {
  const { t } = useTranslation();
  const credentialCategories =
    useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/credential_types/`)?.data?.actions?.GET
      ?.kind?.choices ?? [];
  const itemsResponse = useGet<AwxItemsResponse<CredentialType>>(
    awxAPI`/credential_types/?page=1&page_size=200`
  );

  const { wizardData, setStepData, stepData } = usePageWizard() as {
    wizardData: ScheduleFormWizard;
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

  return (
    <>
      <PageFormInventorySelect name="scheduleInventory" isRequired />
      <br />
      <Divider />
      <PageFormHidden watch="scheduleInventory" hidden={(v: Inventory) => v?.id === undefined}>
        <PageFormSingleSelect<CredentialType>
          name="credentialCategories"
          label={t('Credential categories')}
          placeholderText={t('Select credential category')}
          
          options={
            credentialCategories
              .sort((l, r) => compareStrings(l[1], r[1]))
              .map((credentialType) => ({
                label: credentialType[1],
                value: credentialType[0],
              })) ?? []
          }
          isRequired
        />
        <PageFormHidden
          watch="credentialCategories"
          hidden={(v: CredentialType) => v === undefined}
        >
          <PageFormMultiSelect<CredentialType>
            name="credential"
            label={t('Machine')}
            placeholderText={t('Select machine')}
            options={
              itemsResponse?.data?.results
                .filter((v) => v.kind === 'ssh')
                .sort((l, r) => compareStrings(l.name, r.name))
                .map((credentialType) => ({
                  label: credentialType.name,
                  value: credentialType.id,
                })) ?? []
            }
            isRequired
          />
        </PageFormHidden>
        <PageFormHidden watch="credential" hidden={(v: Credential) => v?.id === undefined}>
          {/* <ChipGroup categoryName={} >
            <Chip  />
          </ChipGroup> */}
        </PageFormHidden>
      </PageFormHidden>
      <Divider />
    </>
  );
}
