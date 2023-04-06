/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout, PageTab, PageTabs } from '../../../../../framework';
import { useGetItem } from '../../../../common/crud/useGetItem';
import { RouteObj } from '../../../../Routes';
import { Credential } from '../../../interfaces/Credential';
import { useCredentialActions } from '../hooks/useCredentialActions';
import { CredentialDetails } from './CredentialDetails';

export function CredentialPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const { data: credential } = useGetItem<Credential>('/api/v2/credentials', params.id);
  const actions = useCredentialActions({
    onDeleted: () => navigate(RouteObj.Credentials),
  });
  return (
    <PageLayout>
      <PageHeader
        title={credential?.name}
        breadcrumbs={[
          { label: t('Credentials'), to: RouteObj.Credentials },
          { label: credential?.name },
        ]}
        headerActions={
          <PageActions<Credential>
            actions={actions}
            position={DropdownPosition.right}
            selectedItem={credential}
          />
        }
      />
      <PageTabs loading={!credential}>
        <PageTab label={t('Details')}>
          <CredentialDetails credential={credential!} />
        </PageTab>
      </PageTabs>
    </PageLayout>
  );
}
