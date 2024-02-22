import { FieldValues, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { useOptions } from '../../../common/crud/useOptions';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { AwxPageForm } from '../../common/AwxPageForm';
import { awxAPI } from '../../common/api/awx-utils';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { AwxRoute } from '../../main/AwxRoutes';
import { InventorySourceSubForm } from './InventorySourceSubForm';
import {
  InventorySource,
  InventorySourceCreate,
  InventorySourceForm,
} from '../../interfaces/InventorySource';
import { useGet } from '../../../common/crud/useGet';
import { Inventory } from '../../interfaces/Inventory';
import { useEffect, useMemo, useState } from 'react';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';

export interface SourceFields extends FieldValues {
  project: Omit<InventorySource, 'source'> & {
    source?:
      | ''
      | 'scm'
      | 'ec2'
      | 'gce'
      | 'azure_rm'
      | 'vmware'
      | 'satellite6'
      | 'openstack'
      | 'rhv'
      | 'controller'
      | 'insights'
      | null;
  };
  id: number;
}

export function CreateInventorySource() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();
  const postRequest = usePostRequest<InventorySourceCreate, InventorySource>();
  const params = useParams<{ id: string }>();
  const { data: inventory } = useGet<Inventory>(
    awxAPI`/inventories/${params.id?.toString() ?? ''}/`
  );

  const onSubmit: PageFormSubmitHandler<InventorySourceForm> = async (values) => {
    const formValues: InventorySourceCreate = {
      ...values,
      credential: values?.credentialIdPath,
      source_path: values?.source_path?.name,
      inventory: parseInt(params.id ?? ''),
      source_project: values?.source_project?.id,
    };

    const source = await postRequest(awxAPI`/inventory_sources/`, formValues);

    pageNavigate(AwxRoute.InventorySourceDetail, {
      params: { source_id: source.id, inventory_type: inventory?.type, id: params.id },
    });
  };

  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Add new source')}
        breadcrumbs={[
          { label: t('Inventories'), to: getPageUrl(AwxRoute.Inventories) },
          {
            label: `${inventory?.name}`,
            to: getPageUrl(AwxRoute.InventoryDetails, {
              params: {
                id: inventory?.id,
                inventory_type: inventory?.type,
              },
            }),
          },
          {
            label: t('Sources'),
            to: getPageUrl(AwxRoute.InventorySources, {
              params: {
                id: inventory?.id,
                inventory_type: inventory?.type,
              },
            }),
          },
          { label: t('Add') },
        ]}
      />
      <AwxPageForm
        submitText={t('Save')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={{}}
      >
        <InventorySourceInputs />
      </AwxPageForm>
    </PageLayout>
  );
}

export function EditInventorySource() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();
  const patchRequest = usePatchRequest<InventorySourceCreate, InventorySource>();
  const params = useParams<{ id: string; source_id: string }>();
  const { data: inventory } = useGet<Inventory>(
    awxAPI`/inventories/${params.id?.toString() ?? ''}/`
  );

  const { data: inventorySource } = useGet<InventorySource>(
    awxAPI`/inventory_sources/${params.source_id?.toString() ?? ''}/`
  );

  const defaultValue: InventorySourceForm = useMemo(
    () => ({
      name: inventorySource?.name,
      description: inventorySource?.description ?? '',
      source: inventorySource?.source,
      credential: inventorySource?.summary_fields?.credential?.name,
      source_project: inventorySource?.summary_fields?.source_project,
      source_path: {
        name:
          inventorySource?.source_path?.length === 0
            ? '/ (project root)'
            : inventorySource?.source_path,
      },
      verbosity: inventorySource?.verbosity,
      host_filter: inventorySource?.host_filter,
      enabled_var: inventorySource?.enabled_var,
      enabled_value: inventorySource?.enabled_value,
      overwrite: inventorySource?.overwrite,
      overwrite_vars: inventorySource?.overwrite_vars,
      update_on_launch: inventorySource?.update_on_launch,
      update_cache_timeout: inventorySource?.update_cache_timeout,
      source_vars: inventorySource?.source_vars,
    }),
    [inventorySource]
  );

  const onSubmit: PageFormSubmitHandler<InventorySourceForm> = async (values) => {
    const formValues: InventorySourceCreate = {
      ...values,
      credential: values?.credentialIdPath,
      source_path: values?.source_path?.name,
      inventory: parseInt(params.id ?? ''),
      source_project: values?.source_project?.id,
    };

    const source = await patchRequest(
      awxAPI`/inventory_sources/${params.source_id ?? ''}/`,
      formValues
    );

    pageNavigate(AwxRoute.InventorySourceDetail, {
      params: { source_id: source.id, inventory_type: inventory?.type, id: params.id },
    });
  };

  const getPageUrl = useGetPageUrl();

  if (!inventorySource) {
    return null;
  }

  return (
    <PageLayout>
      <PageHeader
        title={t('Edit source')}
        breadcrumbs={[
          { label: t('Inventories'), to: getPageUrl(AwxRoute.Inventories) },
          {
            label: `${inventory?.name}`,
            to: getPageUrl(AwxRoute.InventoryDetails, {
              params: {
                id: inventory?.id,
                inventory_type: inventory?.type,
              },
            }),
          },
          {
            label: t('Sources'),
            to: getPageUrl(AwxRoute.InventorySources, {
              params: {
                id: inventory?.id,
                inventory_type: inventory?.type,
              },
            }),
          },
          { label: t('Edit') },
        ]}
      />
      <AwxPageForm
        submitText={t('Save')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={defaultValue}
      >
        <InventorySourceInputs />
      </AwxPageForm>
    </PageLayout>
  );
}

function InventorySourceInputs() {
  const { t } = useTranslation();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/inventory_sources/`);
  const source = useWatch<InventorySourceForm>({
    name: 'source',
  });
  const formContext = useFormContext();
  const [sourceType, setSourceType] = useState(source);

  // remove the filter when mockups/functionality for file and constructed source types are ready
  const scmTypeOptions = data?.actions?.GET?.source?.choices?.filter(([value, label]) => {
    const ignoredSourceTypes = ['file', 'constructed'];
    if (!ignoredSourceTypes.includes(value)) {
      return {
        label,
        value,
      };
    }
  });

  useEffect(() => {
    formContext.clearErrors();
    if (sourceType !== source) {
      formContext.resetField('credential', { defaultValue: '' });
      formContext.resetField('source_project', { defaultValue: {} });
      formContext.resetField('source_path', { defaultValue: '' });
      setSourceType(source);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);
  return (
    <>
      <PageFormTextInput name="name" label={t('Name')} placeholder={t('Enter name')} isRequired />
      <PageFormTextInput
        label={t('Description')}
        name="description"
        placeholder={t('Enter description')}
      />
      <PageFormSelect<SourceFields>
        isRequired
        name="source"
        id="source_control_type"
        label={t('Source')}
        options={
          scmTypeOptions
            ? scmTypeOptions.map(([value, label]) => ({
                label: label,
                value: value,
              }))
            : []
        }
        placeholderText={t('Select a source')}
      />
      <InventorySourceSubForm />
    </>
  );
}
