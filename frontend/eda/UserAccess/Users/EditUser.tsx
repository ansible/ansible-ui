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
import { PageFormSchema } from '../../../../framework/PageForm/PageFormSchema';
import { useGet } from '../../../common/useItem';
import { requestPatch, requestPost } from '../../../Data';
import { RouteE } from '../../../Routes';
import { EdaUser } from '../../interfaces/EdaUser';

export function EditUser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: User } = useGet<EdaUser>(`/api/users/${id.toString()}`);

  const UserSchemaType = useMemo(
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

  type UserSchema = Static<typeof UserSchemaType>;

  const { cache } = useSWRConfig();

  const onSubmit: PageFormSubmitHandler<UserSchema> = async (User, setError) => {
    try {
      if (Number.isInteger(id)) {
        User = await requestPatch<EdaUser>(`/api/users/${id}`, User);
        (cache as unknown as { clear: () => void }).clear?.();
        navigate(-1);
      } else {
        const newUser = await requestPost<EdaUser>('/api/users', User);
        (cache as unknown as { clear: () => void }).clear?.();
        navigate(RouteE.EdaUserDetails.replace(':id', newUser.id.toString()));
      }
    } catch (err) {
      setError('TODO');
    }
  };
  const onCancel = () => navigate(-1);

  if (Number.isInteger(id)) {
    if (!User) {
      return (
        <PageLayout>
          <PageHeader
            breadcrumbs={[{ label: t('Users'), to: RouteE.EdaUsers }, { label: t('Edit User') }]}
          />
        </PageLayout>
      );
    } else {
      return (
        <PageLayout>
          <PageHeader
            title={t('Edit User')}
            breadcrumbs={[{ label: t('Users'), to: RouteE.EdaUsers }, { label: t('Edit User') }]}
          />
          <PageBody>
            <PageForm
              schema={UserSchemaType}
              submitText={t('Save User')}
              onSubmit={onSubmit}
              cancelText={t('Cancel')}
              onCancel={onCancel}
              defaultValue={User}
            >
              <PageFormSchema schema={UserSchemaType} />
            </PageForm>
          </PageBody>
        </PageLayout>
      );
    }
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={t('Create User')}
          breadcrumbs={[{ label: t('Users'), to: RouteE.EdaUsers }, { label: t('Create User') }]}
        />
        <PageBody>
          <PageForm
            schema={UserSchemaType}
            submitText={t('Create User')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
          >
            <PageFormSchema schema={UserSchemaType} />
          </PageForm>
        </PageBody>
      </PageLayout>
    );
  }
}
