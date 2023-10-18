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
  PageFormTextArea,
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
import {
  appendTrailingSlash,
  hubAPIPut,
  parsePulpIDFromURL,
  hubAPI,
  hubAPIPost,
} from '../api/utils';
import { PulpItemsResponse } from '../usePulpView';
import { ExecutionEnvironment } from './ExecutionEnvironment';
import { PageFormSection } from '../../../framework/PageForm/Utils/PageFormSection';
import { HubPageForm } from '../HubPageForm';
import { HubItemsResponse } from '../useHubView';
import { useState, useEffect, useCallback } from 'react';

import { putHubRequest } from './../api/request';
import { postHubRequest } from '../api/request';
import { PageFormAsyncSelect } from '../../../framework/PageForm/Inputs/PageFormAsyncSelect';
import { string } from 'yaml/dist/schema/common/string';
import { useSelectRegistrySingle } from './hooks/useRegistrySelector';
import { toolbarSingleSelectBrowseAdapter } from '../../../framework/PageToolbar/PageToolbarFilters/ToolbarAsyncSingleSelectFilter';

export function ExecutionEnvironmentForm(props: { mode: 'add' | 'edit' }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const getPageUrl = useGetPageUrl();
  const getRequest = useGetRequest<ExecutionEnvironment>();

  const [executionEnvironment, setExecutionEnvironment] = useState<ExecutionEnvironmentFormProps>(
    {} as ExecutionEnvironmentFormProps
  );

  const [originalData, setOriginalData] = useState<ExecutionEnvironment>(
    {} as ExecutionEnvironment
  );

  const [error, setError] = useState<string>('');
  const params = useParams<{ id?: string }>();
  const mode = props.mode;

  const notFound = t('Execution environment not found');
  const isLoading = Object.keys(executionEnvironment).length === 0 && mode == 'edit';

  const onSubmit: PageFormSubmitHandler<ExecutionEnvironmentFormProps> = async (
    data: ExecutionEnvironmentFormProps
  ) => {
    const payload = { ...data };

    const registry = data.registry as Registry;
    payload.registry = registry?.id;

    if (mode == 'add') {
      delete data.description;
    }

    // TODO - handle distribution
    if (mode == 'add') {
      await hubAPIPost<ExecutionEnvironmentFormProps>(
        hubAPI`/_ui/v1/execution-environments/remotes/`,
        payload
      );
    } else {
      await postHubRequest(
        hubAPI`/_ui/v1/execution-environments/remotes/${
          originalData.pulp?.repository?.remote?.id || ''
        }`,
        payload
      );
    }

    navigate(-1);
  };

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

        const ee = {
          name: res.name,
          upstream_name: res.pulp?.repository?.remote?.upstream_name,
          description: res.description,
        } as ExecutionEnvironmentFormProps;
        setOriginalData(res);
        setExecutionEnvironment(ee);
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
        <HubPageForm<ExecutionEnvironmentFormProps>
          submitText={
            props.mode == 'edit' ? t('Edit Execution Environment') : t('Add Execution Environment')
          }
          onCancel={() => navigate(-1)}
          onSubmit={(data) => {
            onSubmit(data);
          }}
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
  const getRequest = useGetRequest<HubItemsResponse<Registry>>();

  const selectRegistrySingle = useSelectRegistrySingle();

  const registrySelector = toolbarSingleSelectBrowseAdapter<Registry>(
    selectRegistrySingle.onBrowse,
    (item) => item.name,
    (name) => {
      return { name };
    }
  );

  const page_size = 50;

  const query = useCallback(async () => {
    const response = await getRequest(
      hubAPI`/_ui/v1/execution-environments/registries?page_size=${page_size.toString()}`
    );

    return Promise.resolve({
      total: response.meta.count,
      values: response.data,
    });
  }, []);

  return (
    <>
      <PageFormTextInput<ExecutionEnvironmentFormProps>
        name="name"
        label={t('Name')}
        placeholder={t('Enter a execution environment name')}
        isRequired
        isDisabled={mode == 'edit'}
        validate={(name: string) => validateName(name, t)}
      />

      <PageFormTextInput<ExecutionEnvironmentFormProps>
        name="upstream_name"
        label={t('Upstream name')}
        placeholder={t('Enter a upstream name')}
        isRequired
      />

      <PageFormAsyncSelect<ExecutionEnvironmentFormProps>
        name="registry"
        label={t('Registry')}
        placeholder={t('Select registry')}
        query={query}
        loadingPlaceholder={t('Loading registry...')}
        loadingErrorText={t('Error loading registry')}
        limit={page_size}
        valueToString={(value) => value.name}
        openSelectDialog={registrySelector}
        isRequired
      />

      <PageFormTextArea<ExecutionEnvironmentFormProps>
        name="description"
        label={t('Description')}
        placeholder={t('Enter a description')}
        isDisabled={mode == 'add'}
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

type ExecutionEnvironmentFormProps = {
  name: string;
  upstream_name: string;
  description?: string;
  registry: string | Registry;
};

type Registry = {
  id: string;
  name: string;
};
