import { useTranslation } from 'react-i18next';
import { useGet } from '../../../common/crud/useGet';
import { pulpAPI } from '../../common/api/formatPath';
import { useOutletContext } from 'react-router-dom';
import { CollectionVersionSearch } from '../Collection';
import { HubError } from '../../common/HubError';
import { PulpItemsResponse } from '../../common/useHubView';
import { SearchInput } from '@patternfly/react-core';
import { useSearchParams } from 'react-router-dom';
import { ToolbarItem } from '@patternfly/react-core';
import styled from 'styled-components';
import { LoadingPage, PageTable } from '../../../../framework';
import { PageSection } from '@patternfly/react-core';
import { useEffect } from 'react';
import { useRef } from 'react';
import { EmptyStateNoData } from '../../../../framework/components/EmptyStateNoData';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { ITableColumn } from '../../../../framework';

export function CollectionContents() {
  const { t } = useTranslation();
  const { collection } = useOutletContext<{ collection: CollectionVersionSearch }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const tableColumns = useTableColumns();
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

  if (error || data?.results?.length === 0) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  if (!data && !error) {
    return <LoadingPage />;
  }

  return (
    <>
      <PageSection variant="light">
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
        <StyledToolbarItem isSelected={false} isLabel={true}>
          {t`Showing`}
        </StyledToolbarItem>
        {Object.keys(summary).map((key) => {
          return (
            <StyledToolbarItem
              key={key}
              onClick={() =>
                setSearchParams((params) => {
                  params.set('showing', key);
                  return params;
                })
              }
              isSelected={key === showing}
            >
              {key} ({summary[key]})
            </StyledToolbarItem>
          );
        })}
        <br /> <br />
        <PageTable<CollectionContent>
          keyFn={(item) => item.name + '_' + item.content_type}
          tableColumns={tableColumns}
          pageItems={toShow}
          itemCount={toShow.length}
          page={1}
          perPage={toShow.length}
          setPage={() => {}}
          setPerPage={() => {}}
          errorStateTitle=""
          emptyStateTitle={t`No content available`}
          disablePagination={true}
          compact={true}
        />
        {summary.all <= 0 && collection.repository?.name === 'community' && (
          <RenderCommunityWarningMessage />
        )}
      </PageSection>
    </>
  );
}

function useTableColumns() {
  const { t } = useTranslation();

  return useMemo<ITableColumn<CollectionContent>[]>(
    () => [
      {
        header: t('Name'),
        cell: (item) => <Link to={returnPath()}>{item.name}</Link>,
      },
      {
        header: t('Type'),
        type: 'text',
        value: (item) => item.content_type,
      },
      {
        header: t('Description'),
        type: 'description',
        value: (item) => item.description,
      },
    ],
    [t]
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

function returnPath() {
  // TODO - this is maybe not correct, without documentation tab working, we cant be sure those paths are leading to right places
  // TODO - this is not handling insights well right now probably, but insights is still not discussed
  let path = window.location.origin + window.location.pathname;
  path = path.replace('/contents', '/documentation');

  // TODO - this will work when documentation will be finished
  //path += `/${content.content_type}/${content.name}/`;
  return path;
}

interface CollectionContentResult {
  contents: CollectionContent[];
}

interface CollectionContent {
  name: string;
  description: string;
  content_type: string;
}

const hoverOrSelected = `
    border-bottom: 2px solid var(--pf-global--link--Color);
    padding-bottom: 2px;
    margin-bottom: -4px;
    cursor: pointer;
    text-decoration: underline;
    text-decoration-color: blue; /* Sets the underline color to blue */
    text-decoration-thickness: 2px; /* Sets the thickness of the underline */
    text-underline-offset: 8px; /* Sets the space between the text and the underline */
`;

const StyledToolbarItem = styled(ToolbarItem)<{ isSelected: boolean; isLabel?: boolean }>`
  margin-right: 25px;
  text-transform: capitalize;
  font-size: 16px;
  &:hover {
    ${(props) => !props.isLabel && hoverOrSelected}
  }
  ${(props) => props.isSelected && !props.isLabel && hoverOrSelected}
`;
