import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LoadingPage,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../framework';
import { PageFormFileUpload } from '../../../framework/PageForm/Inputs/PageFormFileUpload';
import { useGet, useGetRequest } from '../../common/crud/useGet';
import { Repository } from '../administration/repositories/Repository';
import { HubError } from '../common/HubError';
import { HubPageForm } from '../common/HubPageForm';
import { hubAPI, pulpAPI } from '../common/api/formatPath';
import { hubPostRequestFile } from '../common/api/request';
import { HubItemsResponse, PulpItemsResponse } from '../common/useHubView';
import { HubRoute } from '../main/HubRoutes';
import { CollectionVersionSearch } from './Collection';

interface UploadData {
  file: unknown;
  repository: string;
  signed_collection: string;
}

export function CollectionSignatureUpload() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const getPageUrl = useGetPageUrl();

  const name = searchParams.get('name') || '';
  const namespace = searchParams.get('namespace') || '';
  const repository = searchParams.get('repository') || '';
  const version = searchParams.get('version') || '';

  const { data, error, refresh } = useGet<HubItemsResponse<CollectionVersionSearch>>(
    hubAPI`/v3/plugin/ansible/search/collection-versions/?name=${name}&namespace=${namespace}&version=${version}&repository_name=${repository}`
  );

  if (error || data?.data.length === 0) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  if (!data) {
    return <LoadingPage />;
  }

  let collection: CollectionVersionSearch | undefined = undefined;
  if (data && data.data && data.data.length > 0) {
    collection = data.data[0];
  }

  return (
    <PageLayout>
      <PageHeader
        title={t('Signature upload')}
        breadcrumbs={[
          { label: t('Collections'), to: getPageUrl(HubRoute.Collections) },
          { label: collection?.collection_version?.name },
        ]}
      />
      {collection && <UploadSignatureByFile collection={collection} />}
    </PageLayout>
  );
}

export function UploadSignatureByFile(props: { collection: CollectionVersionSearch }) {
  const getRequest = useGetRequest();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const { t } = useTranslation();
  const onCancel = () => navigate(-1);

  const { collection } = props;

  const collectionID = collection?.collection_version?.pulp_href;

  async function submitData(data: UploadData) {
    const repoRes = (await getRequest(
      pulpAPI`/repositories/ansible/ansible/?pulp_label_select=pipeline=staging`
    )) as PulpItemsResponse<Repository>;

    const stagingRepo = repoRes.results[0].pulp_href;

    await hubPostRequestFile(
      pulpAPI`/content/ansible/collection_signatures/`,
      data.file as Blob,
      stagingRepo,
      collectionID
    );
    pageNavigate(HubRoute.Approvals);
  }

  return (
    <>
      <HubPageForm<UploadData>
        submitText={t('Confirm')}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        onSubmit={(data) => {
          return submitData(data);
        }}
        singleColumn={true}
      >
        <PageFormFileUpload label={t('Signature file')} name="file" isRequired />
      </HubPageForm>
    </>
  );
}
