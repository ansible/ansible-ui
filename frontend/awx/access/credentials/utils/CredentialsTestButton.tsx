import { Button } from '@patternfly/react-core';
import { CredentialPluginsForm } from '../CredentialPlugins/CredentialPlugins';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';

export interface TestButtonProps {
  handleTest: (data: CredentialPluginsForm) => Promise<void>;
}

export function CredentialsTestButton(props: TestButtonProps) {
  const { t } = useTranslation();
  const {
    getValues,
    formState: { isValid },
  } = useFormContext<CredentialPluginsForm>();
  const getData = () => {
    const formData = getValues();
    void props.handleTest(formData);
  };

  return (
    <Button variant="secondary" onClick={getData} isDisabled={!isValid}>
      {t('Test')}
    </Button>
  );
}
