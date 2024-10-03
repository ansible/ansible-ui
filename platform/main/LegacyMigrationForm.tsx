import { Button, ButtonVariant, Divider, GridItem } from '@patternfly/react-core';
import { CheckCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { ReactNode, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { getPatternflyColor, PageFormTextInput } from '../../framework';
import { genericErrorAdapter } from '../../framework/PageForm/genericErrorAdapter';
import { PageFormSection } from '../../framework/PageForm/Utils/PageFormSection';
import { AwxPageForm } from '../../frontend/awx/common/AwxPageForm';
import { usePostRequest } from '../../frontend/common/crud/usePostRequest';
import { gatewayAPI } from '../utils/gateway-api-utils';
import { Account, LegacyAuth } from '../interfaces/LegacyAuth';
import { useLegacyAuth } from './LegacyAuthProvider';

interface LinkAccountRequest {
  username: string;
  password: string;
}

type ServiceType = 'controller' | 'hub' | 'eda';

const LinkButton = styled(Button)`
  align-self: flex-end;
  display: flex;
  grid-column-end: span 2;
  width: 100px;
  margin: 2rem 0;
`;

const MigrationInputs = (props: { legacyAuth: LegacyAuth }) => {
  const { t } = useTranslation();
  const { legacyAuth } = props;
  const linkAccountRequest = usePostRequest<LinkAccountRequest, LegacyAuth>();
  const { reset, getValues, setError, clearErrors } = useFormContext();
  const { refreshLegacyAuth } = useLegacyAuth();
  const [serviceAccounts, setServiceAccounts] = useState<Account[]>(legacyAuth.linked_accounts);
  const [loading, setLoading] = useState<Record<ServiceType, boolean>>({
    controller: false,
    hub: false,
    eda: false,
  });
  useEffect(() => {
    reset({
      linked_accounts: serviceAccounts,
    });
  }, [serviceAccounts, reset]);
  function getFieldName(accounts: Account[], serviceName: ServiceType): string {
    const index = accounts.findIndex((account) => account.service_type === serviceName);
    return index !== -1 ? `linked_accounts.${index}.original_username` : '';
  }

  const serviceTypeMap: Record<ServiceType, string> = {
    controller: 'Automation Controller',
    hub: 'Automation Hub',
    eda: 'Event-Driven Ansible',
  };

  const handleLinkAccount = async (service: ServiceType) => {
    const username = getValues(`${service}-username`) as string;
    const password = getValues(`${service}-password`) as string;
    if (!username) {
      setError(`${service}-username`, { message: t('Username is required') });
      clearErrors(`${service}-password`);
    }
    if (!password) {
      setError(`${service}-password`, { message: t('Password is required') });
      clearErrors(`${service}-username`);
    }
    if (username && password) {
      clearErrors(`${service}-username`);
      clearErrors(`${service}-password`);
      setLoading((prev) => ({ ...prev, [service]: true }));
      try {
        const resp = await linkAccountRequest(gatewayAPI`/legacy_auth/${service}_password/`, {
          username,
          password,
        });
        setServiceAccounts([...resp.linked_accounts]);
      } catch (error) {
        const { genericErrors, fieldErrors } = genericErrorAdapter(error);
        const fieldErrorMessage =
          fieldErrors[0]?.message ?? genericErrors[0]?.message ?? t('An unexpected error occurred');
        if (typeof fieldErrorMessage === 'string') {
          setError(`${service}-username`, { message: fieldErrorMessage });
        }
      } finally {
        setLoading((prev) => ({ ...prev, [service]: false }));
        if (legacyAuth.is_migrated) {
          refreshLegacyAuth?.();
        }
      }
    }
  };

  const linkedServices = serviceAccounts.map((account) => account.service_type);
  const unlinkedServices = (Object.keys(serviceTypeMap) as ServiceType[]).filter(
    (service) => !linkedServices.includes(service)
  );

  return (
    <>
      {serviceAccounts.map((account) => {
        const username = getFieldName(serviceAccounts, account.service_type);
        return (
          <PageFormSection
            title={t(`${serviceTypeMap[account.service_type]}`)}
            key={account.service}
          >
            <GridItem span={10}>
              <PageFormTextInput label={t('Username')} isReadOnly name={username} />
            </GridItem>
            <LinkButton
              isDisabled
              variant="link"
              icon={<CheckCircleIcon />}
              style={{ color: getPatternflyColor('green') }}
            >
              {t('Linked')}
            </LinkButton>
          </PageFormSection>
        );
      })}
      {unlinkedServices.length > 0 ? <Divider style={{ margin: '16px 0' }} /> : null}
      {unlinkedServices.map((service) => {
        const serviceName = serviceTypeMap[service];
        return (
          <PageFormSection
            title={t('Link your {{ service }} account', { service: serviceName })}
            key={service}
          >
            <GridItem span={5}>
              <PageFormTextInput label={t('Username')} name={`${service}-username`} />
            </GridItem>
            <GridItem span={5}>
              <PageFormTextInput
                label={t('Password')}
                name={`${service}-password`}
                type="password"
              />
            </GridItem>
            <LinkButton
              onClick={() => void handleLinkAccount(service)}
              value={service}
              variant={ButtonVariant.secondary}
              icon={<PlusCircleIcon />}
              isLoading={loading[service]}
              isDisabled={loading[service]}
            >
              {t('Link')}
            </LinkButton>
          </PageFormSection>
        );
      })}
    </>
  );
};

export function LegacyMigrationForm(props: { legacyAuth: LegacyAuth; footer?: ReactNode }) {
  const { legacyAuth, footer } = props;

  return (
    <AwxPageForm
      disableGrid
      onSubmit={() => Promise.resolve()}
      defaultValue={legacyAuth}
      footer={footer}
    >
      <MigrationInputs legacyAuth={legacyAuth} />
    </AwxPageForm>
  );
}
