import {
  PageFormSubmitHandler,
  PageFormTextArea,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageFormGroup } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormGroup';
import { LoadingPage } from '@ansible/ansible-ui-framework/components/LoadingPage';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useClearCache } from '@ansible/common-ui/useInvalidateCache/useInvalidateCache';
import { Button, InputGroup, Label, LabelGroup, TextInput } from '@patternfly/react-core';
import { TagIcon } from '@patternfly/react-icons';
import { TFunction } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { HubError } from '../common/HubError';
import { HubPageForm } from '../common/HubPageForm';
import { PageFormSingleSelectHubResource } from '../common/PageFormSingleSelectHubResource';
import { hubErrorAdapter } from '../common/adapters/hubErrorAdapter';
import { hubAPI, pulpAPI } from '../common/api/formatPath';
import { hubAPIPatch, hubAPIPost, hubAPIPut } from '../common/api/hub-api-utils';
import { HubItemsResponse } from '../common/useHubView';
import { HubRoute } from '../main/HubRoutes';
import { ExecutionEnvironment } from './ExecutionEnvironment';
import { useExecutionEnvironmentFilters } from './hooks/useExecutionEnvironmentFilters';
import { useExecutionEnvironmentsColumns } from './hooks/useExecutionEnvironmentsColumns';

export function CreateExecutionEnvironment() {
  return <ExecutionEnvironmentForm mode="add" />;
}

export function EditExecutionEnvironment() {
  return <ExecutionEnvironmentForm mode="edit" />;
}

function ExecutionEnvironmentForm(props: Readonly<{ mode: 'add' | 'edit' }>) {
  const page_size = 50;
  const { t } = useTranslation();
  const navigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const mode = props.mode;
  const params = useParams<{ id?: string }>();
  const { clearCacheByKey } = useClearCache();

  const columns = useExecutionEnvironmentsColumns({
    disableLinks: true,
  });
  const filters = useExecutionEnvironmentFilters();

  const [tagsToInclude, setTagsToInclude] = useState<string[]>([]);
  const [tagsToExclude, setTagsToExclude] = useState<string[]>([]);
  const [tagsSet, setTagsSet] = useState<boolean>(false);

  const registry = useGet<HubItemsResponse<Registry>>(
    hubAPI`/_ui/v1/execution-environments/registries/?limit=${page_size}`
  );

  const eeUrl =
    mode === 'edit' && params?.id
      ? hubAPI`/v3/plugin/execution-environments/repositories/${params?.id}/`
      : '';

  const executionEnvironment = useGet<ExecutionEnvironment>(eeUrl);

  const singleRegistryUrl =
    mode === 'edit' && executionEnvironment.data?.pulp?.repository?.remote?.registry
      ? hubAPI`/_ui/v1/execution-environments/registries/${executionEnvironment.data?.pulp?.repository?.remote?.registry}/`
      : '';

  const singleRegistry = useGet<Registry>(singleRegistryUrl);

  const isNew = !executionEnvironment.data?.pulp?.repository;
  const isRemote = executionEnvironment.data?.pulp?.repository
    ? !!executionEnvironment.data?.pulp?.repository?.remote
    : true;

  const isLoading =
    (!executionEnvironment.data || (isRemote && singleRegistryUrl && !singleRegistry.data)) &&
    mode === 'edit';

  if (mode === 'edit' && !tagsSet && isLoading === false) {
    setTagsSet(true);
    setTagsToExclude(executionEnvironment.data?.pulp?.repository?.remote?.exclude_tags || []);
    setTagsToInclude(executionEnvironment.data?.pulp?.repository?.remote?.include_tags || []);
  }

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
      if (isRemote && !isNew) {
        await hubAPIPut<ExecutionEnvironment>(
          hubAPI`/_ui/v1/execution-environments/remotes/${
            executionEnvironment.data?.pulp?.repository?.remote?.id ?? ''
          }/`,
          payload
        );
        clearCacheByKey(hubAPI`/_ui/v1/execution-environments/remotes/`);
      }

      if (formData.description !== executionEnvironment.data?.description) {
        await hubAPIPatch(
          pulpAPI`/distributions/container/container/${
            executionEnvironment.data?.pulp?.distribution?.id ?? ''
          }/`,
          { description: formData.description ?? null }
        );
        clearCacheByKey(pulpAPI`/distributions/container/container/`);
      }
    }

    void navigate(HubRoute.ExecutionEnvironments);
  };

  const defaultFormValue = {
    name: executionEnvironment.data?.name,
    upstream_name: executionEnvironment.data?.pulp?.repository?.remote?.upstream_name,
    description: executionEnvironment.data?.description,
    registry: { id: singleRegistry.data?.id, name: singleRegistry.data?.name },
    namespace: executionEnvironment.data?.namespace,
  };

  if (isLoading) return <LoadingPage breadcrumbs tabs />;
  if (registry.error) return <HubError error={registry.error} handleRefresh={registry.refresh} />;
  if (executionEnvironment.error)
    return (
      <HubError error={executionEnvironment.error} handleRefresh={executionEnvironment.refresh} />
    );
  if (singleRegistry.error)
    return <HubError error={singleRegistry.error} handleRefresh={singleRegistry.refresh} />;

  return (
    <PageLayout>
      <PageHeader
        title={
          props.mode === 'edit'
            ? t('Edit {{executionenvironmentName}}', {
                executionenvironmentName: executionEnvironment.data?.name,
              })
            : t('Create execution environment')
        }
        breadcrumbs={
          props.mode === 'edit'
            ? [
                {
                  label: t('Execution Environments'),
                  to: getPageUrl(HubRoute.ExecutionEnvironments),
                },
                {
                  label: t('Edit {{executionenvironmentName}}', {
                    executionenvironmentName: executionEnvironment.data?.name,
                  }),
                },
              ]
            : [
                {
                  label: t('Execution Environments'),
                  to: getPageUrl(HubRoute.ExecutionEnvironments),
                },
                { label: t('Create execution environment') },
              ]
        }
      />

      {!isLoading && (
        <HubPageForm<ExecutionEnvironmentFormProps>
          submitText={
            props.mode === 'edit'
              ? t('Save execution environment')
              : t('Create execution environment')
          }
          onCancel={() => void navigate(HubRoute.ExecutionEnvironments)}
          onSubmit={onSubmit}
          defaultValue={defaultFormValue}
          singleColumn={true}
          disableSubmitOnEnter={true}
          errorAdapter={(error) => hubErrorAdapter(error, { base_path: 'name' })}
        >
          <PageFormTextInput<ExecutionEnvironmentFormProps>
            name="name"
            label={t('Name')}
            placeholder={t('Enter execution environment name')}
            isRequired
            isDisabled={mode === 'edit' || !isRemote}
            validate={(name: string) => validateName(name, t)}
          />

          {!isRemote && (
            <PageFormTextInput<ExecutionEnvironmentFormProps>
              name="namespace.name"
              label={t('Namespace')}
              placeholder={t('Enter namespace name')}
              isDisabled
            />
          )}

          {!isNew && (
            <PageFormTextArea<ExecutionEnvironmentFormProps>
              name="description"
              label={t('Description')}
              placeholder={t('Enter description')}
            />
          )}

          {isRemote && (
            <>
              <PageFormTextInput<ExecutionEnvironmentFormProps>
                name="upstream_name"
                label={t('Upstream name')}
                placeholder={t('Enter upstream name')}
                isRequired
              />
              <PageFormSingleSelectHubResource<ExecutionEnvironment>
                name="registry"
                label={t('Registry')}
                placeholder={t('Select registry')}
                queryPlaceholder={t('Loading registry...')}
                queryErrorText={t('Error loading registry')}
                isRequired={true}
                url={hubAPI`/_ui/v1/execution-environments/registries/`}
                tableColumns={columns}
                toolbarFilters={filters}
              />
              <TagsSelector tags={tagsToInclude} setTags={setTagsToInclude} mode={'include'} />
              <TagsSelector tags={tagsToExclude} setTags={setTagsToExclude} mode={'exclude'} />
            </>
          )}
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

export type PayloadDataType = {
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

function TagsSelector(
  props: Readonly<{
    tags: string[];
    setTags: (tags: string[]) => void;
    mode: 'exclude' | 'include';
  }>
) {
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
    // Use string methods only to avoid regex complexity (SonarCloud S5852)
    const tagsArray = tagsText
      .split(',')
      .flatMap((tag) => tag.trim().split(' '))
      .map((tag) => tag.trim())
      .filter(Boolean);
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
