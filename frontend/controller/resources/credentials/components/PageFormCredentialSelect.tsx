import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormTextInput } from '../../../../../framework/PageForm/Inputs/PageFormTextInput';
import { ItemsResponse, requestGet } from '../../../../Data';
import { Credential } from '../../../interfaces/Credential';
import { useSelectCredential } from '../hooks/useSelectCredential';

export function PageFormCredentialSelect(props: {
  name: string;
  credentialPath?: string;
  credentialIdPath?: string;
}) {
  const { t } = useTranslation();
  const selectCredential = useSelectCredential();
  const { setValue } = useFormContext();
  return (
    <PageFormTextInput
      name={props.name}
      label={t('Credential')}
      placeholder="Enter credential"
      selectTitle={t('Select a credential')}
      selectValue={(credential: Credential) => credential.name}
      selectOpen={selectCredential}
      validate={async (credentialName: string) => {
        try {
          const itemsResponse = await requestGet<ItemsResponse<Credential>>(
            `/api/v2/credentials/?name=${credentialName}`
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
      isRequired
    />
  );
}
