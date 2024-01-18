import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormMultiInput } from '../../../../../framework/PageForm/Inputs/PageFormMultiInput';
import { useSelectCredentials } from '../hooks/useSelectCredentials';
import { EdaCredential } from '../../../../eda/interfaces/EdaCredential';

export function PageFormCredentialSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: { name: TFieldName; labelHelp: string; isRequired?: boolean }) {
  const { t } = useTranslation();
  const selectCredential = useSelectCredentials(true);

  return (
    <PageFormMultiInput<EdaCredential, TFieldValues, TFieldName>
      {...props}
      name={props.name}
      id="credential-select"
      placeholder={t('Add credentials')}
      labelHelpTitle={t('Credentials')}
      labelHelp={props.labelHelp}
      label={t('Credential')}
      selectTitle={t('Select a credential')}
      selectOpen={selectCredential}
      validate={(credentials: EdaCredential[]) => {
        if (props.isRequired && credentials.length === 0) {
          return t('Credential is required.');
        }
        return undefined;
      }}
      isRequired={props.isRequired}
    />
  );
}
