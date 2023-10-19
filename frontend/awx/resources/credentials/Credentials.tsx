import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout } from '../../../../framework';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import { useAwxConfig } from '../../common/useAwxConfig';
import getDocsBaseUrl from '../../common/util/getDocsBaseUrl';
import { CredentialsList } from '../../resources/common/CredentialsList';
import { awxAPI } from '../../api/awx-utils';

export function Credentials() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('AWX');
  usePersistentFilters('credentials');
  const config = useAwxConfig();

  return (
    <PageLayout>
      <PageHeader
        title={t('Credentials')}
        titleHelpTitle={t('Credential')}
        titleHelp={t(
          `Credentials are utilized by {{product}} for authentication when launching jobs against machines, synchronizing with inventory sources, and importing project content from a version control system. You can grant users and teams the ability to use these credentials, without actually exposing the credential to the user. If you have a user move to a different team or leave the organization, you don’t have to re-key all of your systems just because that credential was available in {{product}}.`,
          { product }
        )}
        titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/credentials.html`}
        description={t(
          `Credentials are utilized by {{product}} for authentication when launching jobs against machines, synchronizing with inventory sources, and importing project content from a version control system.`,
          { product }
        )}
      />
      <CredentialsList url={awxAPI`/credentials/`} />
    </PageLayout>
  );
}
