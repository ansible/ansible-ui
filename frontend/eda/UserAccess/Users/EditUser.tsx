/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import {
  PageForm,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
} from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { requestGet, swrOptions } from '../../../common/crud/Data';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { API_PREFIX } from '../../constants';
import { EdaRoleRef } from '../../interfaces/EdaRole';
import { EdaUser, EdaUserCreateUpdate } from '../../interfaces/EdaUser';
import { PageFormRolesSelect } from '../Roles/components/PageFormRolesSelect';

type UserInput = Omit<EdaUserCreateUpdate, 'roles'> & {
  roles?: EdaRoleRef[];
  confirmPassword: string;
};

export function CreateUser() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const postRequest = usePostRequest<Partial<EdaUserCreateUpdate>, EdaUser>();

  const onSubmit: PageFormSubmitHandler<UserInput> = async (userInput, _, setFieldError) => {
    const { roles, confirmPassword, ...user } = userInput;
    if (confirmPassword !== user.password) {
      setFieldError('confirmPassword', { message: t('Password does not match.') });
      return false;
    }
    const createUser: EdaUserCreateUpdate = {
      ...user,
      roles: roles?.map((role) => role.name) ?? [],
    };
    const newUser = await postRequest(`${API_PREFIX}/users/`, createUser);
    navigate(RouteObj.EdaUserDetails.replace(':id', newUser.id.toString()));
  };

  const onCancel = () => navigate(-1);

  return (
    <>
      <PageHeader
        title={t('Create User')}
        breadcrumbs={[{ label: t('Users'), to: RouteObj.EdaUsers }, { label: t('Create User') }]}
      />
      <PageForm
        submitText={t('Create user')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
      >
        <UserInputs mode="create" />
      </PageForm>
    </>
  );
}

export function EditUser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: user } = useSWR<EdaUser>(
    `${API_PREFIX}/users/${id.toString()}/`,
    requestGet,
    swrOptions
  );

  const patchRequest = usePatchRequest<Partial<EdaUserCreateUpdate>, EdaUser>();

  const onSubmit: PageFormSubmitHandler<UserInput> = async (
    userInput: UserInput,
    _setError,
    setFieldError
  ) => {
    const { roles, confirmPassword, ...user } = userInput;
    if (user.password) {
      if (confirmPassword !== user.password) {
        setFieldError('confirmPassword', { message: t('Password does not match.') });
        return false;
      }
    }
    const editUser: EdaUserCreateUpdate = { ...user, roles: roles?.map((role) => role.name) ?? [] };
    const updatedUser = await patchRequest(`${API_PREFIX}/users/${id}/`, editUser);
    navigate(RouteObj.EdaUserDetails.replace(':id', updatedUser.id.toString()));
  };

  const onCancel = () => navigate(-1);

  if (!user) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[{ label: t('Users'), to: RouteObj.EdaUsers }, { label: t('Edit user') }]}
        />
      </PageLayout>
    );
  }

  const defaultValue: Partial<UserInput> = {
    ...user,
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Edit User')}
        breadcrumbs={[{ label: t('Users'), to: RouteObj.EdaUsers }, { label: t('Edit User') }]}
      />
      <PageForm<UserInput>
        submitText={t('Save user')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={defaultValue}
      >
        <UserInputs mode="edit" />
      </PageForm>
    </PageLayout>
  );
}

function UserInputs(props: { mode: 'create' | 'edit' }) {
  const { mode } = props;
  const { t } = useTranslation();
  return (
    <Fragment>
      <PageFormTextInput<UserInput>
        name="username"
        label={t('Username')}
        placeholder={t('Enter username')}
        isRequired
        maxLength={150}
        autoComplete="new-username"
        validate={(username: string) => {
          for (const c of username) {
            if (
              !'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890@.+-_'.includes(c)
            ) {
              return t('Username may contain only letters, numbers, and @.+-_ characters.');
            }
          }
        }}
      />
      <PageFormTextInput<UserInput>
        name="first_name"
        label={t('First name')}
        placeholder={t('Enter first name')}
        maxLength={150}
      />
      <PageFormTextInput<UserInput>
        name="last_name"
        label={t('Last name')}
        placeholder={t('Enter last name')}
        maxLength={150}
      />
      <PageFormTextInput<UserInput>
        name="email"
        label={t('Email')}
        placeholder={t('Enter email')}
      />
      <PageFormTextInput<UserInput>
        name="password"
        label={t('Password')}
        placeholder={t('Enter password')}
        type="password"
        autoComplete="new-password"
        isRequired={mode === 'create'}
      />
      <PageFormTextInput<UserInput>
        name="confirmPassword"
        label={t('Confirm password')}
        placeholder={t('Enter password')}
        type="password"
        autoComplete="new-password"
        isRequired={mode === 'create'}
      />
      <PageFormRolesSelect<UserInput> name="roles" labelHelp={t('User roles')} />
    </Fragment>
  );
}
