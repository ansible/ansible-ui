import { PageFormMultiInput } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormMultiInput';
import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { useSelectCredentials } from '../hooks/useSelectCredentials';

export function PageFormCredentialSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TFieldName;
  labelHelp: string;
  isRequired?: boolean;
  credentialKinds?: string[];
}) {
  const { t } = useTranslation();
  const selectCredential = useSelectCredentials(props.credentialKinds);

  return (
    <PageFormMultiInput<EdaCredential>
      {...props}
      name={props.name}
      id="credential-select"
      data-cy={'credentials-select'}
      placeholder={t('Select credentials')}
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
      getChipLabel={(item: EdaCredential) => item.name}
    />
  );
}
