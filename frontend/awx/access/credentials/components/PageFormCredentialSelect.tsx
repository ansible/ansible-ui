import { ReactElement, ReactNode } from 'react';
import { FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormTextInput } from '../../../../../framework';
import { PageFormMultiInput } from '../../../../../framework/PageForm/Inputs/PageFormMultiInput';
import { requestGet } from '../../../../common/crud/Data';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { Credential } from '../../../interfaces/Credential';
import { useMultiSelectCredential, useSingleSelectCredential } from '../hooks/useSelectCredential';

export function PageFormCredentialSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TFieldName;
  acceptableCredentialKinds?: string[];
  additionalControls?: ReactElement;
  credentialIdPath?: string;
  credentialPath?: string;
  credentialType?: number;
  isDisabled?: boolean;
  isMultiple?: boolean;
  isRequired?: boolean;
  label?: string;
  labelHelp?: string | string[] | ReactNode;
  labelHelpTitle?: string;
  placeholder?: string;
  selectTitle?: string;
  sourceType?: string;
}) {
  const { t } = useTranslation();
  const multiSelectCredential = useMultiSelectCredential(
    true,
    props.credentialType,
    props?.acceptableCredentialKinds
  );
  const singleSelectCredential = useSingleSelectCredential(
    props.credentialType,
    props.selectTitle,
    props.sourceType
  );
  const { setValue } = useFormContext();
  return props.isMultiple ? (
    <PageFormMultiInput<Credential>
      {...props}
      placeholder={props.placeholder ? props.placeholder : t('Add credentials')}
      name={props.name}
      id="credential-select"
      label={props.label ? props.label : t('Credential')}
      selectTitle={props.selectTitle ? props.selectTitle : t('Select credentials')}
      selectOpen={multiSelectCredential}
      validate={async (credentials: Credential[]) => {
        if (!props.isRequired) {
          return;
        }
        try {
          const itemsResponse = await requestGet<AwxItemsResponse<Credential>>(
            awxAPI`/credentials/?name=${credentials[0].name}`
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
  ) : (
    <PageFormTextInput<TFieldValues, TFieldName, Credential>
      {...props}
      placeholder={props.placeholder ? props.placeholder : t('Add credential')}
      name={props.name}
      id="credential-select"
      label={props.label ? props.label : t('Credential')}
      selectTitle={props.selectTitle ? props.selectTitle : t('Select a credential')}
      selectOpen={singleSelectCredential}
      selectValue={(credential: Credential) => {
        if (props.credentialPath) setValue(props.credentialPath, credential);
        if (props.credentialIdPath) setValue(props.credentialIdPath, credential.id);
        return credential.name;
      }}
      validate={async (credentialName: string) => {
        if (!credentialName) {
          return;
        }
        try {
          const itemsResponse = await requestGet<AwxItemsResponse<Credential>>(
            props.credentialType
              ? awxAPI`/credentials/?name=${credentialName}&credential_type=${props.credentialType.toString()}`
              : awxAPI`/credentials/?name=${credentialName}`
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
