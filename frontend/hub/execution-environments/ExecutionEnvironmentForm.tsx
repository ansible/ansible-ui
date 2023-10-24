import { useTranslation, TFunction } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
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
import { AwxError } from '../../awx/common/AwxError';
import { useGetRequest } from '../../common/crud/useGet';
import { HubRoute } from '../HubRoutes';
import { hubAPI, hubAPIPost, pulpAPI } from '../api/utils';
import { ExecutionEnvironment } from './ExecutionEnvironment';
import { HubPageForm } from '../HubPageForm';
import { HubItemsResponse } from '../useHubView';
import { useState, useEffect, useCallback } from 'react';

import { patchHubRequest, putHubRequest } from './../api/request';
import { PageFormAsyncSelect } from '../../../framework/PageForm/Inputs/PageFormAsyncSelect';
import { useSelectRegistrySingle } from './hooks/useRegistrySelector';

export function ExecutionEnvironmentForm(props: { mode: 'add' | 'edit' }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const getPageUrl = useGetPageUrl();
  const getRequest = useGetRequest<ExecutionEnvironment>();
  const registryGetRequest = useGetRequest<HubItemsResponse<Registry>>();
  const singleRegistryGetRequest = useGetRequest<Registry>();

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

  const isNew = !originalData?.pulp?.repository;
  const isRemote = originalData.pulp?.repository ? !!originalData.pulp?.repository?.remote : true;

  const query = useCallback(async () => {
    const response = await registryGetRequest(
      hubAPI`/_ui/v1/execution-environments/registries?page_size=${page_size.toString()}`
    );

    return Promise.resolve({
      total: response.meta.count,
      values: response.data,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit: PageFormSubmitHandler<ExecutionEnvironmentFormProps> = async (
    formData: ExecutionEnvironmentFormProps
  ) => {
    try {
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
        await Promise.all([
          isRemote &&
            !isNew &&
            putHubRequest(
              hubAPI`/_ui/v1/execution-environments/remotes/${
                originalData.pulp?.repository?.remote?.id || ''
              }/`,
              payload
            ),

          formData.description != originalData.description &&
            patchHubRequest(
              pulpAPI`/distributions/container/container/${
                originalData.pulp?.distribution?.id || ''
              }/`,
              { description: formData.description }
            ),
        ]);
      }

      navigate(-1);
    } catch (error) {
      const text =
        mode == 'add'
          ? t('Error when adding execution environment.')
          : t('Error when saving execution environment.');
      setError(text);
    }
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

        const registry = await singleRegistryGetRequest(
          hubAPI`/_ui/v1/execution-environments/registries/${
            res.pulp?.repository?.remote?.registry || ''
          }/`
        );

        const ee = {
          name: res.name,
          upstream_name: res.pulp?.repository?.remote?.upstream_name,
          description: res.description,
          // TODO - registry initial selection not working
          registry: { id: registry?.id, name: registry?.name },
          namespace: res.namespace,
        } as ExecutionEnvironmentFormProps;

        setOriginalData(res);
        setExecutionEnvironment(ee);

        setTagsToExclude(res.pulp?.repository?.remote?.exclude_tags || []);
        setTagsToInclude(res.pulp?.repository?.remote?.include_tags || []);
      } catch (error) {
        if (error) {
          setError(notFound);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      {!isLoading && (
        <HubPageForm<ExecutionEnvironmentFormProps>
          submitText={
            props.mode == 'edit' ? t('Edit Execution Environment') : t('Add Execution Environment')
          }
          onCancel={() => navigate(-1)}
          onSubmit={onSubmit}
          defaultValue={executionEnvironment}
          singleColumn={true}
          disableSubmitOnEnter={true}
        >
          <PageFormTextInput<ExecutionEnvironmentFormProps>
            name="name"
            label={t('Name')}
            placeholder={t('Enter a execution environment name')}
            isRequired
            isDisabled={mode == 'edit' || !isRemote}
            validate={(name: string) => validateName(name, t)}
          />

          {!isRemote && (
            <PageFormTextInput<ExecutionEnvironmentFormProps>
              name="namespace"
              label={t('Namespace')}
              placeholder={t('Enter a namespace name')}
              isRequired
              isDisabled
              validate={(name: string) => validateName(name, t)}
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
            isDisabled={mode == 'add'}
          />

          {error && <AwxError error={new Error(error)} />}
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
  registry: Registry;
  namespace?: string;
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

  const label = mode == 'exclude' ? t('Add tag(s) to exclude') : t('Add tag(s) to include');
  const label2 = mode == 'exclude' ? t('Currently excluded tags') : t('Currently included tags');

  const chipGroupProps = () => {
    const count = '${remaining}'; // pf templating
    return {
      collapsedText: t(`{{count}} more`, count.toString()),
      expandedText: t(`Show Less`),
    };
  };

  const addTags = () => {
    if (tagsText == '') {
      return;
    }
    const tagsArray = tagsText.split(',');
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
