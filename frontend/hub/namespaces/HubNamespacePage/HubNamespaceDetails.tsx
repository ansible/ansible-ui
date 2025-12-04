import { LoadingPage, PageDetail, PageDetails } from '@ansible/ansible-ui-framework';
import { PageDetailKeyValueList } from '@ansible/ansible-ui-framework/PageDetails/PageDetailKeyValueList';
import { PageMarkdownDetail } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageMarkdownDetail';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { ExternalLink } from '../../common/ExternalLink';
import { HubError } from '../../common/HubError';
import { hubAPI } from '../../common/api/formatPath';
import { HubNamespace } from '../HubNamespace';

function useNamespaceDetails(id: string) {
  return useGet<HubNamespace>(hubAPI`/_ui/v1/namespaces/${id}/`);
}

export function HubNamespaceDetails() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: namespace, error, isLoading, refresh } = useNamespaceDetails(id as string);

  if (error) return <HubError error={error} handleRefresh={refresh} />;
  if (isLoading || !namespace) return <LoadingPage />;

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
            <ExternalLink
              data-cy={`item-value-${item.value}`}
              data-testid={`item-value-${item.value}`}
              href={item.value}
            >
              {item.value}{' '}
            </ExternalLink>
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
