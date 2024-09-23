import { Button, GridItem } from '@patternfly/react-core';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageFormTextInput } from '../../framework';
import { PageFormSection } from '../../framework/PageForm/Utils/PageFormSection';
import { AwxPageForm } from '../../frontend/awx/common/AwxPageForm';
import { usePostRequest } from '../../frontend/common/crud/usePostRequest';
import { Account, LegacyAuth } from '../interfaces/LegacyAuth';
import { gatewayAPI } from '../utils/gateway-api-utils';
import { useLegacyAuth } from './LegacyAuthProvider';
import { usePlatformActiveUser } from './PlatformActiveUserProvider';

interface CreateAAPUserRequest {
  new_username: string | undefined;
  aap_password?: string;
}

interface CreateLDAPUserRequest {
  linked_accounts: Account[];
}

const CreateUserInputs = (props: { legacyAuth: LegacyAuth; isLDAPAccount: boolean }) => {
  const { t } = useTranslation();
  const { setValue } = useFormContext();
  const { legacyAuth, isLDAPAccount } = props;

  useEffect(() => {
    if (legacyAuth.needs_rename) {
      setValue('new_username', '');
    } else {
      setValue('new_username', legacyAuth.username);
    }
  }, [legacyAuth.needs_rename, legacyAuth.username, setValue]);

  return !isLDAPAccount ? (
    <PageFormSection singleColumn>
      {legacyAuth.allow_rename && (
        <GridItem span={8}>
          <PageFormTextInput<LegacyAuth>
            label={t('Username')}
            name="new_username"
            isRequired={legacyAuth.needs_rename}
          />
        </GridItem>
      )}
      {legacyAuth.allow_aap_password && (
        <GridItem span={8}>
          <PageFormTextInput<LegacyAuth>
            label={t('Password')}
            name="aap_password"
            type="password"
            isRequired={legacyAuth.needs_aap_password}
          />
        </GridItem>
      )}
    </PageFormSection>
  ) : null;
};

export function CreateAAPUserForm(props: {
  legacyAuth: LegacyAuth;
  setShowCreateUserForm: (value: boolean) => void;
  isLDAPAccount: boolean;
}) {
  const { t } = useTranslation();
  const { legacyAuth, setShowCreateUserForm, isLDAPAccount } = props;
  const navigate = useNavigate();
  const { refreshActivePlatformUser } = usePlatformActiveUser();
  const { refreshLegacyAuth } = useLegacyAuth();

  const createAAPUserRequest = usePostRequest<
    CreateAAPUserRequest | CreateLDAPUserRequest,
    LegacyAuth
  >();
  const handleSubmit = async (formValues: LegacyAuth) => {
    await createAAPUserRequest(
      gatewayAPI`/legacy_auth/finalize/`,
      isLDAPAccount
        ? { linked_accounts: formValues.linked_accounts }
        : {
            new_username: formValues.new_username,
            aap_password: formValues.aap_password,
          }
    );
    setShowCreateUserForm(false);
    refreshActivePlatformUser?.();
    refreshLegacyAuth?.();
    navigate(`/`);
  };

  return (
    <AwxPageForm<LegacyAuth>
      onSubmit={handleSubmit}
      submitText={t('Submit')}
      defaultValue={legacyAuth}
      disableGrid
      additionalActions={
        <Button
          variant="link"
          onClick={() => {
            setShowCreateUserForm(false);
          }}
        >
          {t('Back')}
        </Button>
      }
    >
      <CreateUserInputs legacyAuth={legacyAuth} isLDAPAccount={isLDAPAccount} />
    </AwxPageForm>
  );
}
