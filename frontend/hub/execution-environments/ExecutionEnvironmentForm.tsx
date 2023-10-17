import { Trans, useTranslation, TFunction } from 'react-i18next';
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
import { useGetRequest } from '../../common/crud/useGet';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { HubRoute } from '../HubRoutes';
import { appendTrailingSlash, hubAPIPut, parsePulpIDFromURL, hubAPI } from '../api/utils';
import { PulpItemsResponse } from '../usePulpView';
import { ExecutionEnvironment } from './ExecutionEnvironment';
import { PageFormSection } from '../../../framework/PageForm/Utils/PageFormSection';
import { HubPageForm } from '../HubPageForm';
import { HubItemsResponse } from '../useHubView';
import { useState, useEffect } from 'react';

export function ExecutionEnvironmentForm(props: { mode: 'add' | 'edit' }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const getPageUrl = useGetPageUrl();
  const getRequest = useGetRequest<ExecutionEnvironment>();

  const [executionEnvironment, setExecutionEnvironment] = useState<ExecutionEnvironment>(
    {} as ExecutionEnvironment
  );
  const [error, setError] = useState<string>('');
  const params = useParams<{ id?: string }>();
  const mode = props.mode;

  const notFound = t('Execution environment not found');
  const isLoading = Object.keys(executionEnvironment).length === 0 && mode == 'edit';

  useEffect(() => {
    if (props.mode == 'add') {
      return;
    }

    void (async () => {
      try {
        const name = params.id;

        const res = await getRequest(
          hubAPI`/v3/plugin/execution-environments/repositories/${name ?? ''}/`
        );
        if (!res) {
          throw new Error(notFound);
        }
        setExecutionEnvironment(res);
      } catch (error) {
        if (error) {
          setError(error.toString());
        }
      }
    })();
  }, []);

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

      {error && <AwxError error={new Error(notFound)} />}
      {!error && !isLoading && (
        <HubPageForm<ExecutionEnvironment>
          submitText={
            props.mode == 'edit' ? t('Edit Execution Environment') : t('Add Execution Environment')
          }
          onCancel={() => navigate(-1)}
          onSubmit={() => {}}
          defaultValue={executionEnvironment}
        >
          <EEInputs mode={props.mode} />
        </HubPageForm>
      )}
    </PageLayout>
  );
}

function EEInputs(props: { mode: 'add' | 'edit' }) {
  const { t } = useTranslation();
  const mode = props.mode;
  return (
    <>
      <PageFormTextInput<ExecutionEnvironment>
        name="name"
        label={t('Remote name')}
        placeholder={t('Enter a remote name')}
        isRequired
        isDisabled={mode == 'edit'}
        validate={(name: string) => validateName(name, t)}
      />

      <PageFormTextInput<ExecutionEnvironment>
        name="pulp.repository.remote.upstream_name"
        label={t('Upstream name')}
        placeholder={t('Enter a upstream name')}
        isRequired
      />
    </>
  );
}

function validateName(name: string, t: TFunction<'translation', undefined>) {
  const regex = /^([0-9A-Za-z._-]+\/)?[0-9A-Za-z._-]+$/;
  if (regex.test(name)) {
    return undefined;
  } else {
    return t(
      `Container names can only contain alphanumeric characters, ".", "_", "-" and a up to one "/".`
    );
  }
}
