import { Button, PageSection } from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { CopyCell, LoadingPage, PageDetail, PageDetails, Scrollable } from '../../../../framework';
import { requestGet } from '../../../common/crud/Data';
import { HubError } from '../../common/HubError';
import { hubAPI } from '../../common/api/formatPath';
import { useRepositoryBasePath } from '../../common/api/hub-api-utils';
import { CollectionVersionSearch } from '../Collection';
import { Label } from '@patternfly/react-core';
import { Title } from '@patternfly/react-core';
import { useGet } from '../../../common/crud/useGet';
import { pulpAPI } from '../../common/api/formatPath';
import { CollectionVersionsContent } from './CollectionDocumentation';

export function CollectionInstall() {
  const { t } = useTranslation();
  const { collection } = useOutletContext<{ collection: CollectionVersionSearch }>();
  const downloadLinkRef = React.useRef<HTMLAnchorElement>(null);
  const { basePath, error } = useRepositoryBasePath(
    collection.repository?.name ?? '',
    collection.repository?.pulp_href
  );

  const { data: contentResults, error: contentError } = useGet<CollectionVersionsContent>(
    pulpAPI`/content/ansible/collection_versions/?namespace=${
      collection?.collection_version?.namespace || ''
    }&name=${collection?.collection_version?.name || ''}&version=${
      collection?.collection_version?.version || ''
    }&offset=0&limit=1`
  );

  const content = contentResults?.results[0];

  if ((!basePath && !error) || (!content && !contentError)) {
    <LoadingPage breadcrumbs tabs />;
  }

  if (error) {
    return <HubError error={new Error(error)} />;
  }

  if (contentError) {
    return <HubError error={contentError} />;
  }

  async function Download(
    basePath: string,
    collection: CollectionVersionSearch | undefined,
    downloadLinkRef: React.RefObject<HTMLAnchorElement>
  ) {
    const downloadURL = await requestGet<{ download_url: string }>(
      hubAPI`/v3/plugin/ansible/content/${basePath}/collections/index/${
        collection?.collection_version?.namespace || ''
      }/${collection?.collection_version?.name || ''}/versions/${
        collection?.collection_version?.version || ''
      }/`
    );
    if (downloadLinkRef.current) {
      downloadLinkRef.current.href = downloadURL.download_url;
      downloadLinkRef.current.click();
    }
  }

  return (
    <Scrollable>
      <PageSection variant="light">
        <PageDetails numberOfColumns={'single'}>
          <PageDetail>{collection.collection_version?.description}</PageDetail>

          <PageDetail>
            {collection.collection_version?.tags?.map((tag, i) => (
              <Label key={i} variant="outline">
                {tag?.name}
              </Label>
            ))}
          </PageDetail>

          <Title headingLevel="h2">{t('Install')}</Title>
          <PageDetail label={t('License')}>
            {content?.license ? content?.license.join(', ') : ''}
          </PageDetail>
          <PageDetail label={t('Installation')}>
            <CopyCell
              text={`ansible-galaxy collection install ${
                collection?.collection_version?.namespace ?? ''
              }.${collection?.collection_version?.name ?? ''}`}
            />

            <PageDetail>
              {t(
                `Note: Installing collection with ansible-galaxy is only supported in ansible 2.13.9+`
              )}
            </PageDetail>
          </PageDetail>

          <PageDetail label={t('Download')}>
            <a href="/#" ref={downloadLinkRef} style={{ display: 'none' }}>
              {t(`Link`)}
            </a>
            <Button
              variant="link"
              icon={<DownloadIcon />}
              onClick={() => {
                void Download(basePath, collection, downloadLinkRef);
              }}
            >
              {t(`Download tarball`)}
            </Button>
          </PageDetail>
          <PageDetail label={t('Requires')}>
            {collection?.collection_version?.require_ansible &&
              `${t('Ansible')} ${collection.collection_version?.require_ansible}`}
          </PageDetail>
        </PageDetails>
      </PageSection>
    </Scrollable>
  );
}
