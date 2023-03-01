/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout, PageTab, PageTabs } from '../../../../../framework';
import { useItem } from '../../../../common/useItem';
import { RouteObj } from '../../../../Routes';
import { Credential } from '../../../interfaces/Credential';
import { CredentialAccess } from './CredentialAccess';
import { CredentialDetails } from './CredentialDetails';

export function CredentialPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const credential = useItem<Credential>('/api/v2/credentials', params.id ?? '0');
  // const itemActions = useTeamActions({ onTeamsDeleted: () => navigate(RouteObj.Teams) });
  // const viewActivityStreamAction = useViewActivityStream('team');
  // const pageActions = [...viewActivityStreamAction, ...itemActions];

  return (
    <PageLayout>
      <PageHeader
        title={credential?.name}
        breadcrumbs={[
          { label: t('Credentials'), to: RouteObj.Credentials },
          { label: credential?.name },
        ]}
      />
      <PageTabs loading={!credential}>
        <PageTab label={t('Details')}>
          <CredentialDetails credential={credential!} />
        </PageTab>
        <PageTab label={t('Access')}>
          <CredentialAccess credential={credential!} />
        </PageTab>
      </PageTabs>
    </PageLayout>
  );
}
