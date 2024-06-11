import { ReactElement } from 'react';
import { FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormMultiInput } from '../../../../../framework/PageForm/Inputs/PageFormMultiInput';
import { requestGet } from '../../../../common/crud/Data';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { Credential } from '../../../interfaces/Credential';
import { useMultiSelectCredential } from '../hooks/useSelectCredential';
import { PageFormSingleSelectAwxResource } from '../../../common/PageFormSingleSelectAwxResource';
import { useCredentialsColumns } from '../hooks/useCredentialsColumns';
import { useCredentialsFilters } from '../hooks/useCredentialsFilters';
import { QueryParams } from '../../../common/useAwxView';

/** @deprecated */
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
  id?: string;
  isDisabled?: string;
  isMultiple?: boolean;
  isRequired?: boolean;
  label?: string;
  labelHelp?: string;
  labelHelpTitle?: string;
  placeholder?: string;
  selectTitle?: string;
  sourceType?: string;
  queryParams?: QueryParams;
}) {
  const { t } = useTranslation();
  const multiSelectCredential = useMultiSelectCredential(
    true,
    props.credentialType,
    props?.acceptableCredentialKinds
  );

  const credentialColumns = useCredentialsColumns({ disableLinks: true });
  const credentialFilters = useCredentialsFilters();

  const { setValue } = useFormContext();
  return props.isMultiple ? (
    <PageFormMultiInput<Credential>
      {...props}
      isDisabled={props.isDisabled ? true : false}
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
    <PageFormSingleSelectAwxResource<Credential, TFieldValues, TFieldName>
      name={props.name}
      id={props.id ? props.id : 'credential'}
      label={props.label ? props.label : t('Credential')}
      placeholder={props.placeholder ? props.placeholder : t('Select credential')}
      queryPlaceholder={t('Loading credentials...')}
      queryErrorText={t('Error loading credentials')}
      isRequired={props.isRequired}
      isDisabled={props.isDisabled}
      labelHelp={props.labelHelp}
      url={awxAPI`/credentials/`}
      tableColumns={credentialColumns}
      toolbarFilters={credentialFilters}
      queryParams={props.queryParams}
    />
  );
}
