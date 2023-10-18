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
import { TagIcon } from '@patternfly/react-icons';
import {
  Button,
  InputGroup,
  Label,
  LabelGroup,
  Modal,
  Spinner,
  TextInput,
} from '@patternfly/react-core';
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
  const registryGetRequest = useGetRequest<HubItemsResponse<Registry>>();

  const [executionEnvironment, setExecutionEnvironment] = useState<ExecutionEnvironmentFormProps>(
    {} as ExecutionEnvironmentFormProps
  );
  const [originalData, setOriginalData] = useState<ExecutionEnvironment>(
    {} as ExecutionEnvironment
  );
  const [error, setError] = useState<string>('');
  const [tagsToInclude, setTagsToInclude] = useState<string[]>([]);
  const [tagsToExclude, setTagsToExclude] = useState<string[]>([]);

  const params = useParams<{ id?: string }>();
  const mode = props.mode;

  const notFound = t('Execution environment not found');
  const isLoading = Object.keys(executionEnvironment).length === 0 && mode == 'edit';

  const selectRegistrySingle = useSelectRegistrySingle();

  const registrySelector = selectRegistrySingle.onBrowse;

  const page_size = 50;

  const query = useCallback(async () => {
    const response = await registryGetRequest(
      hubAPI`/_ui/v1/execution-environments/registries?page_size=${page_size.toString()}`
    );

    return Promise.resolve({
      total: response.meta.count,
      values: response.data,
    });
  }, []);

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

          <TagsSelector tags={tagsToInclude} setTags={setTagsToInclude} mode={'include'} />

          <TagsSelector tags={tagsToExclude} setTags={setTagsToExclude} mode={'exclude'} />

          <PageFormTextArea<ExecutionEnvironmentFormProps>
            name="description"
            label={t('Description')}
            placeholder={t('Enter a description')}
            isDisabled={mode == 'add'}
          />
        </HubPageForm>
      )}
    </PageLayout>
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

function TagsSelector(props: {
  tags: string[];
  setTags: (tags: string[]) => void;
  mode: 'exclude' | 'include';
}) {
  const [tagsText, setTagsText] = useState<string>('');
  const { tags, setTags, mode } = props;
  const { t } = useTranslation();

  const label = mode == 'exclude' ? t('Add tag(s) to exclude') : t('Add tag(s) to include');
  const label2 = mode == 'exclude' ? t('Currently excluded tags') : t('Currently included tags');

  const chipGroupProps = () => {
    const count = '${remaining}'; // pf templating
    return {
      collapsedText: t(`{{count}} more`, count.toString()),
      expandedText: t(`Show Less`),
    };
  };

  return (
    <PageFormGroup label={label}>
      <InputGroup>
        <TextInput
          type="text"
          id={`addTags-${mode}`}
          value={tagsText}
          onChange={(val) => {
            setTagsText(val?.currentTarget?.value || '');
          }}
          onKeyUp={(e) => {
            // l10n: don't translate
            /*if (e.key === 'Enter') {
                        this.addTags(addTagsInclude, 'includeTags');
                      }*/
          }}
        />
        <Button
          variant="secondary"
          onClick={() => {
            const tagsArray = tagsText.split(',');
            const uniqueArray = [...new Set([...tags, ...tagsArray])];

            setTags(uniqueArray);
            setTagsText('');
          }}
        >
          {t`Add`}
        </Button>
      </InputGroup>

      {label2}
      <LabelGroup {...chipGroupProps()} id={`remove-tag-${mode}`} defaultIsOpen={true}>
        {tags.map((tag) => (
          <Label icon={<TagIcon />} onClose={() => setTags(tags.filter((t) => t != tag))} key={tag}>
            {tag}
          </Label>
        ))}
      </LabelGroup>
    </PageFormGroup>
  );
}
