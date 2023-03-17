import { ReactElement } from 'react';
import { FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormMultiInput } from '../../../../../framework/PageForm/Inputs/PageFormMultiInput';
import { ItemsResponse, requestGet } from '../../../../common/crud/Data';
import { Credential } from '../../../interfaces/Credential';
import { useSelectCredential } from '../hooks/useSelectCredential';

export function PageFormCredentialSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: {
  name: TFieldName;
  credentialPath?: string;
  credentialIdPath?: string;
  additionalControls?: ReactElement;
  isRequired?: boolean;
}) {
  const { t } = useTranslation();
  const selectCredential = useSelectCredential();
  const { setValue } = useFormContext();
  return (
    <PageFormMultiInput<Credential, TFieldValues, TFieldName>
      {...props}
      placeholder={t('Add credentials')}
      labelHelpTitle={t('Credentials')}
      labelHelp={t(
        'Select credentials for accessing the nodes this job will be ran against. You can only select one credential of each type. For machine credentials (SSH), checking "Prompt on launch" without selecting credentials will require you to select a machine credential at run time. If you select credentials and check "Prompt on launch", the selected credential(s) become the defaults that can be updated at run time.'
      )}
      name={props.name}
      label={t('Credential')}
      selectTitle={t('Select a credential')}
      selectOpen={selectCredential}
      validate={async (credentials: Credential[]) => {
        if (!props.isRequired) {
          return;
        }
        try {
          const itemsResponse = await requestGet<ItemsResponse<Credential>>(
            `/api/v2/credentials/?name=${credentials[0].name}`
          );
          if (itemsResponse.results.length === 0) return t('Credential not found.');
          if (props.credentialPath) setValue(props.credentialPath, itemsResponse.results[0]);
          if (props.credentialIdPath) setValue(props.credentialIdPath, itemsResponse.results[0].id);
        } catch (err) {
          if (err instanceof Error) return err.message;
          else return 'Unknown error';
        }
        return undefined;
      }}
      isRequired={props.isRequired}
    />
  );
}
