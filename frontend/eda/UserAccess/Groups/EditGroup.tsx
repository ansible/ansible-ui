import { Static, Type } from '@sinclair/typebox';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageForm, PageFormSubmitHandler, PageHeader, PageLayout } from '../../../../framework';
import { PageFormSchema } from '../../../../framework/PageForm/PageFormSchema';
import { RouteObj } from '../../../Routes';
import { requestPatch } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { useInvalidateCacheOnUnmount } from '../../../common/useInvalidateCache';
import { API_PREFIX } from '../../constants';
import { EdaGroup } from '../../interfaces/EdaGroup';

export function EditGroup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: Group } = useGet<EdaGroup>(`${API_PREFIX}/groups/${id.toString()}/`);

  const GroupSchemaType = useMemo(
    () =>
      Type.Object({
        name: Type.String({
          title: t('Name'),
          placeholder: t('Enter the name'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        }),
        url: Type.Optional(
          Type.String({
            title: t('URL'),
            placeholder: t('Enter the URL'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          })
        ),
      }),
    [t]
  );

  type GroupSchema = Static<typeof GroupSchemaType>;

  useInvalidateCacheOnUnmount();

  const postRequest = usePostRequest<Partial<EdaGroup>, EdaGroup>();

  const onSubmit: PageFormSubmitHandler<GroupSchema> = async (Group) => {
    if (Number.isInteger(id)) {
      Group = await requestPatch<EdaGroup>(`${API_PREFIX}/groups/${id}/`, Group);
      navigate(-1);
    } else {
      const newGroup = await postRequest(`${API_PREFIX}/groups/`, Group);
      navigate(RouteObj.EdaGroupDetails.replace(':id', newGroup.id.toString()));
    }
  };
  const onCancel = () => navigate(-1);

  if (Number.isInteger(id)) {
    if (!Group) {
      return (
        <PageLayout>
          <PageHeader
            breadcrumbs={[
              { label: t('Groups'), to: RouteObj.EdaGroups },
              { label: t('Edit Group') },
            ]}
          />
        </PageLayout>
      );
    } else {
      return (
        <PageLayout>
          <PageHeader
            title={t('Edit Group')}
            breadcrumbs={[
              { label: t('Groups'), to: RouteObj.EdaGroups },
              { label: t('Edit Group') },
            ]}
          />
          <PageForm
            schema={GroupSchemaType}
            submitText={t('Save group')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
            defaultValue={Group}
          >
            <PageFormSchema schema={GroupSchemaType} />
          </PageForm>
        </PageLayout>
      );
    }
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={t('Create Group')}
          breadcrumbs={[
            { label: t('Groups'), to: RouteObj.EdaGroups },
            { label: t('Create Group') },
          ]}
        />
        <PageForm
          schema={GroupSchemaType}
          submitText={t('Create group')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
        >
          <PageFormSchema schema={GroupSchemaType} />
        </PageForm>
      </PageLayout>
    );
  }
}
