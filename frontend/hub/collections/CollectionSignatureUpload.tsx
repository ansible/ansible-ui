import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, useGetPageUrl } from '../../../framework';
import { PageFormFileUpload } from '../../../framework/PageForm/Inputs/PageFormFileUpload';
import { usePageNavigate } from '../../../framework/PageNavigation/usePageNavigate';
import { useGet, useGetRequest } from '../../common/crud/useGet';
import { HubPageForm } from '../HubPageForm';
import { HubRoute } from '../HubRoutes';
import { hubPostRequestFile } from '../api/request';
import { hubAPI, pulpAPI } from '../api/utils';
import { Repository } from '../repositories/Repository';
import { HubItemsResponse } from '../useHubView';
import { PulpItemsResponse } from '../usePulpView';
import { CollectionVersionSearch } from './Collection';

interface UploadData {
  file: unknown;
  repository: string;
  signed_collection: string;
}

export function CollectionSignatureUpload() {
  const { t } = useTranslation();
  const location = useLocation();
  const getPageUrl = useGetPageUrl();
  const { data } = useGet<HubItemsResponse<CollectionVersionSearch>>(
    hubAPI`/v3/plugin/ansible/search/collection-versions/?${location.search}`
  );
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
      <UploadSignatureByFile />
    </PageLayout>
  );
}

export function UploadSignatureByFile() {
  const getRequest = useGetRequest();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const { t } = useTranslation();
  const onCancel = () => navigate(-1);

  const { data } = useGet<HubItemsResponse<CollectionVersionSearch>>(
    hubAPI`/v3/plugin/ansible/search/collection-versions/?${location.search}`
  );
  let collection: CollectionVersionSearch | undefined = undefined;
  if (data && data.data && data.data.length > 0) {
    collection = data.data[0];
  }
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
