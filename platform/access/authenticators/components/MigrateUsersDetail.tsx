import { PageDetail, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { AuthenticatorFormValues } from './AuthenticatorForm';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { Authenticator } from '../../../interfaces/Authenticator';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { Label, LabelGroup } from '@patternfly/react-core';
import { PlatformRoute } from '../../../main/PlatformRoutes';

export function MigrateUsersToDetail(
  props: Readonly<{
    autoMigrateUsersTo?: AuthenticatorFormValues['auto_migrate_users_to'];
    isLegacy: boolean;
  }>
) {
  const { autoMigrateUsersTo, isLegacy } = props;
  const getPageUrl = useGetPageUrl();
  const { t } = useTranslation();

  const [gatewayAuth, setGatewayAuth] = useState<Authenticator | null>();
  useEffect(() => {
    const fetchData = async () => {
      if (typeof autoMigrateUsersTo !== 'number') return;
      const response = await requestGet<Authenticator>(
        gatewayAPI`/authenticators/${autoMigrateUsersTo.toString()}/`
      );
      setGatewayAuth(response);
    };

    void fetchData();
  }, [autoMigrateUsersTo]);
  if (autoMigrateUsersTo === undefined || autoMigrateUsersTo === null) return null;
  if (isLegacy || typeof autoMigrateUsersTo === 'number') {
    return (
      <PageDetail label={t('Automatically migrate legacy users to')}>
        <Label
          href={getPageUrl(PlatformRoute.AuthenticatorDetails, {
            params: { id: autoMigrateUsersTo.toString() },
          })}
          key={autoMigrateUsersTo.toString()}
        >
          {gatewayAuth?.name}
        </Label>
      </PageDetail>
    );
  } else if (autoMigrateUsersTo.length) {
    return (
      <PageDetail label={t('Automatically migrate legacy users from')}>
        <LabelGroup>
          {autoMigrateUsersTo.map((auth) => (
            <Label
              href={getPageUrl(PlatformRoute.AuthenticatorDetails, {
                params: { id: auth.id },
              })}
              key={auth.id}
            >
              {auth?.name}
            </Label>
          ))}
        </LabelGroup>
      </PageDetail>
    );
  }
}
