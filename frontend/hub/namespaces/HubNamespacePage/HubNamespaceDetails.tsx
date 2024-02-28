import { useParams } from 'react-router-dom';
import { LoadingPage, PageDetails } from '../../../../framework';
import { PageDetailsFromColumns } from '../../../../framework/PageDetails/PageDetailsFromColumns';
import { useGet } from '../../../common/crud/useGet';
import { HubError } from '../../common/HubError';
import { hubAPI } from '../../common/api/formatPath';
import { HubNamespace } from '../HubNamespace';
import { useHubNamespacesColumns } from '../hooks/useHubNamespacesColumns';
import { PageMarkdownDetail } from '../../../../framework/PageForm/Inputs/PageMarkdownDetail';
import { useTranslation } from 'react-i18next';

export function HubNamespaceDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data, error, isLoading, refresh } = useGet<HubNamespace>(
    hubAPI`/_ui/v1/namespaces/${params.id}/`
  );
  const tableColumns = useHubNamespacesColumns();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  return (
    <>
      <PageDetails>
        <PageDetailsFromColumns item={data} columns={tableColumns} />
      </PageDetails>
      {data?.resources ? (
        <PageMarkdownDetail label={t('Resources')} value={data?.resources} />
      ) : null}
    </>
  );
}
