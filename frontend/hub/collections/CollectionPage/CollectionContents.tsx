import { useTranslation } from 'react-i18next';
import { useGet } from '../../../common/crud/useGet';
import { pulpAPI } from '../../api/formatPath';
import { useOutletContext } from 'react-router-dom';
import { CollectionVersionSearch } from '../Collection';
import { HubError } from '../../common/HubError';
import { PulpItemsResponse } from '../../usePulpView';
import { SearchInput } from '@patternfly/react-core';
import { useSearchParams } from 'react-router-dom';

export function CollectionContents() {
  const { t } = useTranslation();
  const { collection } = useOutletContext<{ collection: CollectionVersionSearch }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const keywords = searchParams.get('keywords');
  const showing = searchParams.get('showing');

  const { data, error, refresh } = useGet<PulpItemsResponse<CollectionContent>>(
    pulpAPI`/content/ansible/collection_versions/?name=${
      collection.collection_version?.name || ''
    }&namespace=${collection.collection_version?.namespace || ''}&version=${
      collection.collection_version?.version || ''
    }`
  );

  if (error || data?.results?.length == 0) {
    return <HubError error={error} handleRefresh={refresh}></HubError>;
  }

  const contents = data?.results[0].contents;

  return (
    <>
      <SearchInput
        placeholder={t('Find content')}
        value={keywords || ''}
        onChange={(value) => {
          setSearchParams((params) => {
            params.set('keywords', value?.currentTarget?.value || '');
            return params;
          });
        }}
      />
    </>
  );
}

interface CollectionContent {
  contents: { name: string; description: string; content_type: string }[];
}
