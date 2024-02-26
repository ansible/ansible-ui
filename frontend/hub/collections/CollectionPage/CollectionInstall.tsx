import { Button, CodeBlock, CodeBlockCode, Label, Title } from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useOutletContext } from 'react-router-dom';
import {
  CopyCell,
  LoadingPage,
  PageDetail,
  PageDetails,
  useGetPageUrl,
} from '../../../../framework';
import { requestGet } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { HubError } from '../../common/HubError';
import { hubAPI, pulpAPI } from '../../common/api/formatPath';
import { useRepositoryBasePath } from '../../common/api/hub-api-utils';
import { HubRoute } from '../../main/HubRoutes';
import { CollectionVersionSearch } from '../Collection';
import { CollectionVersionsContent } from './CollectionDocumentation';
import './collection-info.css';

export function CollectionInstall() {
  const { t } = useTranslation();
  const { collection } = useOutletContext<{ collection: CollectionVersionSearch }>();
  const downloadLinkRef = React.useRef<HTMLAnchorElement>(null);
  const [showSignature, setShowSignature] = useState(false);

  const { basePath, error } = useRepositoryBasePath(
    collection.repository?.name ?? '',
    collection.repository?.pulp_href
  );
  const getPageUrl = useGetPageUrl();

  // now we are implementing standalone only, this is reminder so we dont forget
  const IS_COMMUNITY = false;

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
        {!IS_COMMUNITY ? (
          <div>
            <Trans>
              To download this collection, configure your client to connect to one of the{' '}
              <Link
                to={getPageUrl(HubRoute.CollectionDistributions, {
                  params: {
                    repository: collection.repository?.name,
                    namespace: collection.collection_version?.namespace,
                    name: collection.collection_version?.name,
                  },
                  query: { version: collection.collection_version?.version },
                })}
              >
                distributions&nbsp;
              </Link>
              of this repository.
            </Trans>
          </div>
        ) : null}

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

      <PageDetail label={t('Signature')}>
        <Button
          variant="link"
          icon={<DownloadIcon />}
          onClick={() => {
            if (!showSignature) {
              setShowSignature(true);
            } else {
              setShowSignature(false);
            }
          }}
        >
          {showSignature ? t(`Hide signature`) : t(`Show signature`)}
        </Button>
        {showSignature && <ShowSignature collection={collection} />}
      </PageDetail>

      <PageDetail label={t('Requires')}>
        {collection?.collection_version?.requires_ansible &&
          `${t('Ansible')} ${collection.collection_version?.requires_ansible}`}
      </PageDetail>

      <PageDetail>
        {content?.docs_blob?.collection_readme ? (
          <>
            <div className="hub-readme-container">
              <div
                className="pf-v5-c-content"
                dangerouslySetInnerHTML={{
                  __html: content?.docs_blob?.collection_readme.html,
                }}
              />
              <div className="hub-fade-out" />
            </div>
            <Link
              to={getPageUrl(HubRoute.CollectionDocumentation, {
                params: {
                  repository: collection.repository?.name,
                  namespace: collection.collection_version?.namespace,
                  name: collection.collection_version?.name,
                },
                query: { version: collection.collection_version?.version },
              })}
            >
              {t`Go to documentation`}
            </Link>
          </>
        ) : (
          ''
        )}
      </PageDetail>
    </PageDetails>
  );
}

function ShowSignature(props: { collection: CollectionVersionSearch }) {
  const { collection } = props;

  const { basePath, error: pathError } = useRepositoryBasePath(
    collection.repository?.name || '',
    collection.repository?.pulp_href
  );

  const namespace = collection.collection_version?.namespace || '';
  const name = collection.collection_version?.name || '';
  const version = collection.collection_version?.version || '';

  let url = '';
  if (basePath) {
    url = hubAPI`/v3/plugin/ansible/content/${basePath}/collections/index/${namespace}/${name}/versions/${version}/`;
  }

  const { data: signData, error: signError } = useGet<SignatureType>(url);

  if (pathError) {
    return <HubError error={{ name: '', message: pathError }} />;
  }

  if (signError) {
    return <HubError error={signError} />;
  }

  if ((!signData && !signError) || (!basePath && !pathError)) {
    return <LoadingPage />;
  }

  if (signData) {
    const signatures = signData.signatures;

    return (
      <>
        {signatures.map((signatureItem, idx: number) => {
          return (
            <CodeBlock key={idx}>
              <CodeBlockCode>{signatureItem.signature}</CodeBlockCode>
            </CodeBlock>
          );
        })}
      </>
    );
  }

  return <></>;
}

type SignatureType = {
  signatures: [{ signature: string }];
};
