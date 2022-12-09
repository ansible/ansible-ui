import { Static, Type } from '@sinclair/typebox';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import {
  PageBody,
  PageForm,
  PageFormSubmitHandler,
  PageHeader,
  PageLayout,
} from '../../../../framework';
import { PageFormTextArea } from '../../../../framework/PageForm/Inputs/PageFormTextArea';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { useGet } from '../../../common/useItem';
import { requestPatch, requestPost } from '../../../Data';
import { RouteE } from '../../../Routes';
import { EdaInventory } from '../../interfaces/EdaInventory';

export function EditInventory() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: inventory } = useGet<EdaInventory>(`/api/inventory/${id.toString()}`);

  const InventorySchemaType = useMemo(
    () =>
      Type.Object({
        name: Type.String(),
        description: Type.Optional(Type.String()),
        inventory: Type.Optional(Type.String()),
      }),
    []
  );

  type InventorySchema = Static<typeof InventorySchemaType>;

  const { cache } = useSWRConfig();

  const onSubmit: PageFormSubmitHandler<InventorySchema> = async (inventory, setError) => {
    try {
      if (Number.isInteger(id)) {
        inventory = await requestPatch<EdaInventory>(`/api/inventory/${id}`, inventory);
        (cache as unknown as { clear: () => void }).clear?.();
        navigate(-1);
      } else {
        const newInventory = await requestPost<EdaInventory>('/api/inventory/', inventory);
        (cache as unknown as { clear: () => void }).clear?.();
        navigate(RouteE.EdaInventoryDetails.replace(':id', newInventory.id.toString()));
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('TODO');
      }
    }
  };
  const onCancel = () => navigate(-1);

  if (Number.isInteger(id)) {
    if (!inventory) {
      return (
        <PageLayout>
          <PageHeader
            breadcrumbs={[
              { label: t('Inventories'), to: RouteE.Inventories },
              { label: t('Edit inventory') },
            ]}
          />
        </PageLayout>
      );
    } else {
      return (
        <PageLayout>
          <PageHeader
            title={t('Edit inventory')}
            breadcrumbs={[
              { label: t('Inventories'), to: RouteE.Inventories },
              { label: t('Edit inventory') },
            ]}
          />
          <PageBody>
            <PageForm
              schema={InventorySchemaType}
              submitText={t('Save inventory')}
              onSubmit={onSubmit}
              cancelText={t('Cancel')}
              onCancel={onCancel}
              defaultValue={inventory}
            >
              <PageFormTextInput
                name="name"
                label={t('Name')}
                isRequired
                placeholder={t('Enter name')}
              />
              <PageFormTextArea
                name="description"
                label={t('Description')}
                placeholder={t('Enter description')}
              />
              <PageFormTextArea
                name="inventory"
                label={t('Inventory')}
                placeholder={t('Enter inventory')}
              />
            </PageForm>
          </PageBody>
        </PageLayout>
      );
    }
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={t('Create inventory')}
          breadcrumbs={[
            { label: t('Inventories'), to: RouteE.Inventories },
            { label: t('Create inventory') },
          ]}
        />
        <PageBody>
          <PageForm
            schema={InventorySchemaType}
            submitText={t('Create inventory')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
          >
            <PageFormTextInput name="name" label={t('Name')} isRequired />
            <PageFormTextArea name="description" label={t('Description')} />
            <PageFormTextArea name="inventory" label={t('Inventory')} />
          </PageForm>
        </PageBody>
      </PageLayout>
    );
  }
}
