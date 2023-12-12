import { useTranslation } from 'react-i18next';
import { useGet } from '../../../common/crud/useGet';
import { pulpAPI } from '../../api/formatPath';
import { useOutletContext } from 'react-router-dom';
import { CollectionVersionSearch } from '../Collection';
import { HubError } from '../../common/HubError';
import { PulpItemsResponse } from '../../usePulpView';
import { SearchInput } from '@patternfly/react-core';
import { useSearchParams } from 'react-router-dom';
import { ToolbarItem } from '@patternfly/react-core';
import styled from 'styled-components';
import { LoadingPage } from '../../../../framework';
import { PageSection } from '@patternfly/react-core';
import { useEffect } from 'react';
import { useRef } from 'react';
import { EmptyStateNoData } from '../../../../framework/components/EmptyStateNoData';

export function CollectionContents() {
  const { t } = useTranslation();
  const { collection } = useOutletContext<{ collection: CollectionVersionSearch }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);

  const keywords = searchParams.get('keywords') || '';
  const showing = searchParams.get('showing') || 'all';

  const { data, error, refresh } = useGet<PulpItemsResponse<CollectionContentResult>>(
    pulpAPI`/content/ansible/collection_versions/?name=${
      collection.collection_version?.name || ''
    }&namespace=${collection.collection_version?.namespace || ''}&version=${
      collection.collection_version?.version || ''
    }`
  );

  useEffect(() => {
    // focus on keywords filter change - it will anyway loose focus
    searchRef?.current?.focus();
  }, [keywords]);

  const contents = data?.results[0].contents || [];
  const summary: Record<string, number> = { all: 0 };

  const toShow: CollectionContent[] = [];

  if (contents.length > 0) {
    for (const c of contents) {
      summary[c.content_type] ||= 0;

      const keywordMatch = c.name.match(keywords);
      const typeMatch = showing === 'all' ? true : c.content_type === showing;

      // count only items matching keyword
      if (keywordMatch) {
        summary[c.content_type]++;
        summary['all']++;
      }

      // show only items matching keyword + type
      if (keywordMatch && typeMatch) {
        toShow.push(c);
      }
    }
  }

  const label_style = `
    margin-right: 25px;
    text-transform: capitalize;
    font-size: 18px;
  `;

  const StyledDiv = styled.div`
    .hub-c-table-content {
      width: 100%;
    }

    .hub-c-table-content th {
      font-weight: bold;
    }

    .hub-c-toolbar__item-type-selector {
      ${label_style}
    }

    .hub-c-toolbar__item-type-selector-label {
      ${label_style}
    }

    .hub-c-toolbar__item-selected-item,
    .hub-c-toolbar__item-type-selector:hover {
      border-bottom: 2px solid var(--pf-global--link--Color);
      padding-bottom: 2px;
      margin-bottom: -4px;
      background-color: white;
      cursor: pointer;
      text-decoration: underline;
      text-decoration-color: blue; /* Sets the underline color to blue */
      text-decoration-thickness: 2px; /* Sets the thickness of the underline */
      text-underline-offset: 8px; /* Sets the space between the text and the underline */
    }
  `;

  if (error || data?.results?.length === 0) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  if (!data && !error) {
    return <LoadingPage />;
  }

  return (
    <>
      <PageSection variant="light">
        <StyledDiv>
          <SearchInput
            key="content-search-input-key"
            id="content-search-input-id"
            placeholder={t('Find content')}
            value={keywords}
            ref={searchRef}
            onChange={(value) => {
              setSearchParams((params) => {
                params.set('keywords', value?.currentTarget?.value || '');
                return params;
              });
            }}
          />
          <br />
          <span className={'hub-c-toolbar__item-type-selector-label'}>{t`Showing`}:</span>
          {Object.keys(summary).map((key) => {
            // eslint-disable-next-line i18next/no-literal-string
            let className = 'clickable hub-c-toolbar__item-type-selector';
            if (key === showing) {
              // eslint-disable-next-line i18next/no-literal-string
              className += ' hub-c-toolbar__item-selected-item ';
            }

            return (
              <ToolbarItem
                key={key}
                onClick={() =>
                  setSearchParams((params) => {
                    params.set('showing', key);
                    return params;
                  })
                }
                className={className}
              >
                {key} ({summary[key]})
              </ToolbarItem>
            );
          })}
          <br /> <br />
          <table className="hub-c-table-content pf-c-table pf-m-compact">
            <thead>
              <tr>
                <th>{t`Name`}</th>
                <th>{t`Type`}</th>
                <th>{t`Description`}</th>
              </tr>
            </thead>
            <tbody>
              {toShow.map((content, i) => (
                <tr key={i}>
                  <td>
                    {content.name}
                    {/* TODO - links and format path*/}
                  </td>
                  <td>{content.content_type}</td>
                  <td>{content.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {summary.all <= 0 && collection.repository?.name === 'community' && (
            <RenderCommunityWarningMessage />
          )}
        </StyledDiv>
      </PageSection>
    </>
  );
}

function RenderCommunityWarningMessage() {
  const { t } = useTranslation();
  return (
    <EmptyStateNoData
      title={t`Warning`}
      description={t`Community collections do not have docs nor content counts, but all content gets synchronized`}
    />
  );
}

interface CollectionContentResult {
  contents: CollectionContent[];
}

interface CollectionContent {
  name: string;
  description: string;
  content_type: string;
}
