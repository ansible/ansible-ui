/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Static, Type } from '@sinclair/typebox';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { PageBody, PageForm, PageFormSubmitHandler, PageHeader } from '../../../../framework';
import {
  PageFormSchema,
  TypeSecretInput,
  TypeSelect,
  TypeTextInput,
} from '../../../../framework/PageForm/PageFormSchema';
import { requestGet, requestPatch, swrOptions } from '../../../Data';
import { RouteE } from '../../../Routes';
import { User } from '../../interfaces/User';
import { getControllerError } from '../../useControllerView';

export function EditUser() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const params = useParams<{ id?: string }>();
  const id = Number(params.id);

  const { data: user } = useSWR<User>(
    Number.isInteger(id) ? `/api/v2/users/${id.toString()}/` : undefined,
    requestGet,
    swrOptions
  );

  const EditUserSchema = Type.Object({
    username: TypeTextInput({ title: t('Username'), maxLength: 150, autoComplete: 'new-username' }),
    userType: TypeSelect({
      title: t('User type'),
      options: [
        {
          label: t('System administrator'),
          description: t('can edit, change, and update any inventory or automation definition'),
          value: 'System administrator',
        },
        {
          label: t('System auditor'),
          description: t(
            'can see all aspects of the systems automation, but has no permission to run or change automation'
          ),
          value: 'System auditor',
        },
        {
          label: t('Normal user'),
          description: t(
            'has read and write access limited to the resources (such as inventory, projects, and job templates) for which that user has been granted the appropriate roles and privileges'
          ),
          value: 'Normal user',
        },
      ],
    }),
    password: Type.Optional(
      TypeSecretInput({ title: t('Password'), autoComplete: 'new-password' })
    ),
    confirmPassword: Type.Optional(
      TypeSecretInput({
        title: t('Confirm password'),
        placeholder: t('Confirm password'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        autoComplete: 'new-password',
      })
    ),
    firstName: Type.Optional(TypeTextInput({ title: t('First name'), maxLength: 150 })),
    lastName: Type.Optional(TypeTextInput({ title: t('Last name'), maxLength: 150 })),
    email: Type.Optional(TypeTextInput({ title: t('Email'), format: 'email' })),
  });
  type EditUser = Static<typeof EditUserSchema>;

  const onSubmit: PageFormSubmitHandler<EditUser> = async (userData, setError, setFieldError) => {
    try {
      if (user) {
        user.username = userData.username;
        user.first_name = userData.firstName!;
        user.last_name = userData.lastName!;
        user.email = userData.email!;
        user.is_superuser = userData.userType === t('System administrator');
        user.is_system_auditor = userData.userType === t('System auditor');
        if (userData.password) {
          if (userData.confirmPassword !== userData.password) {
            setFieldError('confirmPassword', { message: t('Password does not match.') });
            return false;
          }
          user.password = userData.password!;
        }
        const newUser = await requestPatch<User>(`/api/v2/users/${id}/`, user);
        navigate(RouteE.UserDetails.replace(':id', newUser.id.toString()));
      }
    } catch (err) {
      setError(await getControllerError(err));
    }
  };

  const onCancel = () => navigate(-1);

  if (!user) {
    return (
      <>
        <PageHeader
          breadcrumbs={[{ label: t('Users'), to: RouteE.Users }, { label: t('Edit user') }]}
        />
      </>
    );
  } else {
    const defaultValue: EditUser = {
      username: user.username,
      lastName: user.last_name,
      firstName: user.first_name,
      email: user.email,
      userType: user.is_superuser
        ? 'System administrator'
        : user.is_system_auditor
        ? 'System auditor'
        : 'Normal user',
    };
    return (
      <>
        <PageHeader
          title={t('Edit user')}
          breadcrumbs={[{ label: t('Users'), to: RouteE.Users }, { label: t('Edit user') }]}
        />
        <PageBody>
          <PageForm
            schema={EditUserSchema}
            submitText={t('Save user')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
            defaultValue={defaultValue}
          >
            <PageFormSchema schema={EditUserSchema} />
          </PageForm>
        </PageBody>
      </>
    );
  }
}
