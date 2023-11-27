import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { useParams } from 'react-router-dom';
import {
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  PageFormTextArea,
} from '../../../framework';
import { TagIcon } from '@patternfly/react-icons';
import { Button, InputGroup, Label, LabelGroup, TextInput } from '@patternfly/react-core';
import { PageFormGroup } from '../../../framework/PageForm/Inputs/PageFormGroup';
import { useGet } from '../../common/crud/useGet';
import { HubRoute } from '../HubRoutes';
import { hubAPI, pulpAPI } from '../api/formatPath';
import { hubAPIPost } from '../api/utils';
import { ExecutionEnvironment } from './ExecutionEnvironment';
import { HubPageForm } from '../HubPageForm';
import { HubItemsResponse } from '../useHubView';
import { useState, useCallback } from 'react';

import { patchHubRequest, putHubRequest } from './../api/request';
import { PageFormAsyncSelect } from '../../../framework/PageForm/Inputs/PageFormAsyncSelect';
import { useSelectRegistrySingle } from './hooks/useRegistrySelector';
import { usePageNavigate } from '../../../framework';

import { LoadingPage } from '../../../framework/components/LoadingPage';
import { AwxError } from '../../awx/common/AwxError';

export function CreateExecutionEnvironment() {
  return <ExecutionEnvironmentForm mode="add" />;
}

export function EditExecutionEnvironment() {
  return <ExecutionEnvironmentForm mode="edit" />;
}

function ExecutionEnvironmentForm(props: { mode: 'add' | 'edit' }) {
  const page_size = 50;
  const { t } = useTranslation();
  const navigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const mode = props.mode;
  const params = useParams<{ id?: string }>();

  const [tagsToInclude, setTagsToInclude] = useState<string[]>([]);
  const [tagsToExclude, setTagsToExclude] = useState<string[]>([]);
  const [tagsSet, setTagsSet] = useState<boolean>(false);

  const registry = useGet<HubItemsResponse<Registry>>(
    hubAPI`/_ui/v1/execution-environments/registries?page_size=${page_size.toString()}`
  );

  const eeUrl =
    mode === 'edit' && params?.id
      ? hubAPI`/v3/plugin/execution-environments/repositories/${params?.id}/`
      : '';

  const executionEnvironment = useGet<ExecutionEnvironment>(eeUrl);

  const singleRegistryUrl =
    mode === 'edit' &&
    executionEnvironment.data &&
    executionEnvironment.data?.pulp?.repository?.remote?.registry
      ? hubAPI`/_ui/v1/execution-environments/registries/${executionEnvironment.data?.pulp?.repository?.remote?.registry}/`
      : '';

  const singleRegistry = useGet<Registry>(singleRegistryUrl);

  const isLoading = (!executionEnvironment.data || !singleRegistry.data) && mode === 'edit';

  if (mode === 'edit' && !tagsSet && isLoading === false) {
    setTagsSet(true);
    setTagsToExclude(executionEnvironment.data?.pulp?.repository?.remote?.exclude_tags || []);
    setTagsToInclude(executionEnvironment.data?.pulp?.repository?.remote?.include_tags || []);
  }

  const selectRegistrySingle = useSelectRegistrySingle();
  const registrySelector = selectRegistrySingle.onBrowse;

  const isNew = !executionEnvironment.data?.pulp?.repository;
  const isRemote = executionEnvironment.data?.pulp?.repository
    ? !!executionEnvironment.data?.pulp?.repository?.remote
    : true;

  const query = useCallback(() => {
    return Promise.resolve({
      total: registry?.data?.meta?.count || 0,
      values: registry?.data?.data || [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registry.data]);

  const onSubmit: PageFormSubmitHandler<ExecutionEnvironmentFormProps> = async (
    formData: ExecutionEnvironmentFormProps
  ) => {
    const payload: PayloadDataType = {
      exclude_tags: tagsToExclude,
      include_tags: tagsToInclude,
      name: formData.name,
      upstream_name: formData.upstream_name,
      registry: formData.registry?.id || '',
    };

    if (isRemote && isNew) {
      await hubAPIPost<ExecutionEnvironmentFormProps>(
        hubAPI`/_ui/v1/execution-environments/remotes/`,
        payload
      );
    } else {
      const promises = [];

      if (isRemote && !isNew) {
        promises.push(
          putHubRequest(
            hubAPI`/_ui/v1/execution-environments/remotes/${
              executionEnvironment.data?.pulp?.repository?.remote?.id || ''
            }/`,
            payload
          )
        );
      }

      if (formData.description !== executionEnvironment.data?.description) {
        promises.push(
          patchHubRequest(
            pulpAPI`/distributions/container/container/${
              executionEnvironment.data?.pulp?.distribution?.id || ''
            }/`,
            { description: formData.description }
          )
        );
      }
      await Promise.all([promises]);
    }

    navigate(HubRoute.ExecutionEnvironments);
  };

  const defaultFormValue = {
    name: executionEnvironment.data?.name,
    upstream_name: executionEnvironment.data?.pulp?.repository?.remote?.upstream_name,
    description: executionEnvironment.data?.description,
    registry: { id: singleRegistry.data?.id, name: singleRegistry.data?.name },
    namespace: executionEnvironment.data?.namespace,
  };

  if (isLoading) return <LoadingPage breadcrumbs tabs />;
  if (registry.error) return <AwxError error={registry.error} handleRefresh={registry.refresh} />;
  if (executionEnvironment.error)
    return (
      <AwxError error={executionEnvironment.error} handleRefresh={executionEnvironment.refresh} />
    );
  if (singleRegistry.error)
    return <AwxError error={singleRegistry.error} handleRefresh={singleRegistry.refresh} />;

  return (
    <PageLayout>
      <PageHeader
        title={
          props.mode === 'edit' ? t('Edit Execution Environment') : t('Add Execution Environment')
        }
        breadcrumbs={[
          { label: t('Execution Environments'), to: getPageUrl(HubRoute.ExecutionEnvironments) },
          { label: t(' Execution Environment') },
        ]}
      />

      {!isLoading && (
        <HubPageForm<ExecutionEnvironmentFormProps>
          submitText={
            props.mode === 'edit' ? t('Edit Execution Environment') : t('Add Execution Environment')
          }
          onCancel={() => navigate(HubRoute.ExecutionEnvironments)}
          onSubmit={onSubmit}
          defaultValue={defaultFormValue}
          singleColumn={true}
          disableSubmitOnEnter={true}
        >
          <PageFormTextInput<ExecutionEnvironmentFormProps>
            name="name"
            label={t('Name')}
            placeholder={t('Enter a execution environment name')}
            isRequired
            isDisabled={mode === 'edit' || !isRemote}
            validate={(name: string) => validateName(name, t)}
          />

          {!isRemote && (
            <PageFormTextInput<ExecutionEnvironmentFormProps>
              name="namespace.name"
              label={t('Namespace')}
              placeholder={t('Enter a namespace name')}
              isDisabled
            />
          )}

          {isRemote && (
            <>
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
                valueToString={(value: ExecutionEnvironment) => value.name}
                openSelectDialog={registrySelector}
                isRequired
              />

              <TagsSelector tags={tagsToInclude} setTags={setTagsToInclude} mode={'include'} />
              <TagsSelector tags={tagsToExclude} setTags={setTagsToExclude} mode={'exclude'} />
            </>
          )}

          <PageFormTextArea<ExecutionEnvironmentFormProps>
            name="description"
            label={t('Description')}
            placeholder={t('Enter a description')}
            isDisabled={mode === 'add'}
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
      `Container names can only contain alphanumeric characters, ".", "_", "-" and up to one "/".`
    );
  }
}

type ExecutionEnvironmentFormProps = {
  name: string;
  upstream_name: string;
  description?: string;
  registry: Registry;
  namespace?: { name: string };
};

type PayloadDataType = {
  include_tags?: string[];
  exclude_tags?: string[];
  name: string;
  upstream_name: string;
  registry: string;
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

  const label = mode === 'exclude' ? t('Add tag(s) to exclude') : t('Add tag(s) to include');
  const label2 = mode === 'exclude' ? t('Currently excluded tags') : t('Currently included tags');

  const chipGroupProps = () => {
    const count = '${remaining}'; // pf templating
    return {
      collapsedText: t(`{{count}} more`, count.toString()),
      expandedText: t(`Show Less`),
    };
  };

  const addTags = () => {
    if (tagsText === '' || !tagsText.trim().length) {
      return;
    }
    const tagsArray = tagsText.split(/\s+|\s*,\s*/).filter(Boolean);
    const uniqueArray = [...new Set([...tags, ...tagsArray])];
    setTags(uniqueArray);
    setTagsText('');
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
            if (e.key === 'Enter') {
              addTags();
            }
          }}
        />
        <Button
          variant="secondary"
          onClick={() => {
            addTags();
          }}
        >
          {t`Add`}
        </Button>
      </InputGroup>

      <div>{label2}</div>
      <LabelGroup
        {...chipGroupProps()}
        id={`remove-tag-${mode}`}
        defaultIsOpen={true}
        numLabels={5}
      >
        {tags.map((tag) => (
          <Label
            icon={<TagIcon />}
            onClose={() => setTags(tags.filter((t) => t !== tag))}
            key={tag}
          >
            {tag}
          </Label>
        ))}
      </LabelGroup>
    </PageFormGroup>
  );
}
