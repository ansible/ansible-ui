import { Static, Type } from '@sinclair/typebox';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageForm, PageFormSubmitHandler, PageHeader, PageLayout } from '../../../../framework';
import { PageFormSchema } from '../../../../framework/PageForm/PageFormSchema';
import { useInvalidateCacheOnUnmount } from '../../../common/useInvalidateCache';
import { useGet } from '../../../common/useItem';
import { requestPatch, requestPost } from '../../../Data';
import { RouteE } from '../../../Routes';
import { EdaRole } from '../../interfaces/EdaRole';
import { API_PREFIX } from '../../constants';

export function EditRole() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: Role } = useGet<EdaRole>(`${API_PREFIX}/roles/${id.toString()}/`);

  const RoleSchemaType = useMemo(
    () =>
      Type.Object({
        name: Type.String({
          title: t('Name'),
          placeholder: t('Enter the name'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        }),
        url: Type.Optional(
          Type.String({
            title: t('URL'),
            placeholder: t('Enter the Description'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          })
        ),
      }),
    [t]
  );

  type RoleSchema = Static<typeof RoleSchemaType>;

  useInvalidateCacheOnUnmount();

  const onSubmit: PageFormSubmitHandler<RoleSchema> = async (Role, setError) => {
    try {
      if (Number.isInteger(id)) {
        Role = await requestPatch<EdaRole>(`${API_PREFIX}/roles/${id}/`, Role);
        navigate(-1);
      } else {
        const newRole = await requestPost<EdaRole>(`${API_PREFIX}/roles/`, Role);
        navigate(RouteE.EdaRoleDetails.replace(':id', newRole.id.toString()));
      }
    } catch (err) {
      setError('TODO');
    }
  };
  const onCancel = () => navigate(-1);

  if (Number.isInteger(id)) {
    if (!Role) {
      return (
        <PageLayout>
          <PageHeader
            breadcrumbs={[{ label: t('Roles'), to: RouteE.EdaRoles }, { label: t('Edit Role') }]}
          />
        </PageLayout>
      );
    } else {
      return (
        <PageLayout>
          <PageHeader
            title={t('Edit Role')}
            breadcrumbs={[{ label: t('Roles'), to: RouteE.EdaRoles }, { label: t('Edit Role') }]}
          />
          <PageForm
            schema={RoleSchemaType}
            submitText={t('Save Role')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
            defaultValue={Role}
          >
            <PageFormSchema schema={RoleSchemaType} />
          </PageForm>
        </PageLayout>
      );
    }
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={t('Create Role')}
          breadcrumbs={[{ label: t('Roles'), to: RouteE.EdaRoles }, { label: t('Create Role') }]}
        />
        <PageForm
          schema={RoleSchemaType}
          submitText={t('Create Role')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
        >
          <PageFormSchema schema={RoleSchemaType} />
        </PageForm>
      </PageLayout>
    );
  }
}
