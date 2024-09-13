import { useTranslation } from 'react-i18next';
import { PageFormTextInput } from '../../../../../framework';
import { RemoteFormProps } from '../RemoteForm';

export function MiscAdvancedRemoteInputs() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<RemoteFormProps>
        name="download_concurrency"
        label={t('Download concurrency')}
        type="number"
        placeholder={t('Download concurrency')}
        labelHelp={t('Total number of simultaneous connections.')}
      />
      <PageFormTextInput<RemoteFormProps>
        name="rate_limit"
        label={t('Rate limit')}
        type="number"
        placeholder={t('Rate limit')}
        labelHelp={t('Limits total download rate in requests per second.')}
      />
    </>
  );
}
