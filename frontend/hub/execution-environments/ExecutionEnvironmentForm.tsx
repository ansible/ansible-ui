import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  PageFormCheckbox,
  PageFormDataEditor,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
} from '../../../framework';
import { PageFormFileUpload } from '../../../framework/PageForm/Inputs/PageFormFileUpload';
import { PageFormGroup } from '../../../framework/PageForm/Inputs/PageFormGroup';
import { PageFormExpandableSection } from '../../../framework/PageForm/PageFormExpandableSection';
import { LoadingPage } from '../../../framework/components/LoadingPage';
import { AwxError } from '../../awx/common/AwxError';
import { useGet } from '../../common/crud/useGet';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { HubRoute } from '../HubRoutes';
import { appendTrailingSlash, hubAPIPut, parsePulpIDFromURL, pulpAPI } from '../api/utils';
import { PulpItemsResponse } from '../usePulpView';
import { ExecutionEnvironment } from './ExecutionEnvironment';
import { PageFormSection } from '../../../framework/PageForm/Utils/PageFormSection';
import { HubPageForm } from '../HubPageForm';

export function ExecutionEnvironmentForm(props: { mode: 'add' | 'edit' }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getPageUrl = useGetPageUrl();

  /*
  const params = useParams<{ id?: string }>();
  const name = params.id;
  const { data, error, refresh } = useGet<PulpItemsResponse<RemoteFormProps>>(
    pulpAPI`/remotes/ansible/collection/?name=${name ?? ''}`
  );


  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!data) return <LoadingPage breadcrumbs tabs />;

  const remote = data.results[0];
*/
  /*
  const handleRefresh = () => {
    // Navigate back when remote is not found
    if (!error && !remote) {
      navigate(-1);
    }
  };*/

  /*
  if (data && data.count === 0 && !error && !remote) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Remotes'), to: getPageUrl(HubRoute.Remotes) },
            { label: t('Edit Remote') },
          ]}
        />
        <AwxError error={new Error(t('Remote not found'))} handleRefresh={handleRefresh} />
      </PageLayout>
    );
  }*/

  return (
    <PageLayout>
      <PageHeader
        title={
          props.mode == 'edit' ? t('Edit Execution Environment') : t('Add Execution Environment')
        }
        breadcrumbs={[
          { label: t('Execution Environments'), to: getPageUrl(HubRoute.ExecutionEnvironments) },
          { label: t(' Execution Environment') },
        ]}
      />
      <HubPageForm<ExecutionEnvironment>
        submitText={
          props.mode == 'edit' ? t('Edit Execution Environment') : t('Add Execution Environment')
        }
        onCancel={() => navigate(-1)}
        onSubmit={() => {}}
      >
        <EEInputs />
      </HubPageForm>
    </PageLayout>
  );
}

function EEInputs() {
  const { t } = useTranslation();
  return <></>;
}
