import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { LoadingPage, PageDetail, PageDetails } from '../../../../framework';
import { PageDetailKeyValueList } from '../../../../framework/PageDetails/PageDetailKeyValueList';
import { useGet } from '../../../common/crud/useGet';
import { HubError } from '../../common/HubError';
import { hubAPI } from '../../common/api/formatPath';
import { HubNamespace } from '../HubNamespace';
import { PageMarkdownDetail } from '../../../../framework/PageForm/Inputs/PageMarkdownDetail';

function useNamespaceDetails(id: string) {
  return useGet<HubNamespace>(hubAPI`/_ui/v1/my-namespaces/${id}/`);
}

export function HubNamespaceDetails() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: namespace, error, isLoading, refresh } = useNamespaceDetails(id as string);

  if (isLoading || !namespace) {
    return <LoadingPage />;
  }

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  const keyValuePairs = namespace.links.map((link) => ({
    key: link.name,
    value: link.url,
  }));

  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{namespace?.name}</PageDetail>
      <PageDetail label={t('Description')}>{namespace?.description}</PageDetail>
      <PageDetail label={t('Company')}>{namespace?.company}</PageDetail>
      <PageDetail label={t('Logo URL')}>{namespace?.avatar_url}</PageDetail>

      {namespace?.links && namespace.links.length > 0 ? (
        <PageDetailKeyValueList
          valueColumn={t('Link URL')}
          keyColumn={t('Link text')}
          title={t('Useful links')}
          renderValue={(item) => (
            <a
              data-cy={`item-value-${item.value}`}
              href={item.value}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.value}
            </a>
          )}
          keyValue={keyValuePairs || []}
        />
      ) : null}
      {namespace?.resources ? (
        <PageMarkdownDetail label={t('Resources')} value={namespace.resources} />
      ) : null}
    </PageDetails>
  );
}
