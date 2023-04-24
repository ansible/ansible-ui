/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Fragment } from 'react';
import { FieldValues } from 'react-hook-form';
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
import { requestGet, requestPatch, swrOptions } from '../../../common/crud/Data';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { API_PREFIX } from '../../constants';
import { EdaUser, EdaUserIn } from '../../interfaces/EdaUser';
import { PageFormRolesSelect } from '../Roles/components/PageFormRolesSelect';
import { EdaRole } from '../../interfaces/EdaRole';

interface UserFields extends FieldValues {
  user: EdaUser;
  roles?: EdaRole[];
}

export function CreateUser() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const postRequest = usePostRequest<Partial<EdaUserIn>, EdaUser>();

  const onSubmit: PageFormSubmitHandler<IUserInput> = async (userInput, _, setFieldError) => {
    const { user, roles, confirmPassword } = userInput;
    if (confirmPassword !== user.password) {
      setFieldError('confirmPassword', { message: t('Password does not match.') });
      return false;
    }
    const newUser = await postRequest(`${API_PREFIX}/users/`, {
      ...user,
      roles: roles && roles.length > 0 ? roles.map((role) => role?.id) : [],
    });
    navigate(RouteObj.EdaUserDetails.replace(':id', newUser.id.toString()));
  };

  const onCancel = () => navigate(-1);

  return (
    <>
      <PageHeader
        title={t('Create User')}
        breadcrumbs={[{ label: t('Users'), to: RouteObj.EdaUsers }, { label: t('Create user') }]}
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

  const onSubmit: PageFormSubmitHandler<IUserInput> = async (
    userInput: IUserInput,
    _setError,
    setFieldError
  ) => {
    const { user, roles, confirmPassword } = userInput;
    if (user.password) {
      if (confirmPassword !== user.password) {
        setFieldError('confirmPassword', { message: t('Password does not match.') });
        return false;
      }
    }
    const updatedUser = await requestPatch<EdaUser>(`${API_PREFIX}/users/${id}/`, {
      ...user,
      roles: roles && roles.length > 0 ? roles.map((role) => role?.id) : [],
    });
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

  const defaultValue: Partial<IUserInput> = {
    user: user,
    roles: user.roles,
  };
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit User')}
        breadcrumbs={[{ label: t('Users'), to: RouteObj.EdaUsers }, { label: t('Edit user') }]}
      />
      <PageForm<IUserInput>
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

interface IUserInput {
  user: EdaUser;
  roles?: EdaRole[];
  confirmPassword: string;
}

function UserInputs(props: { mode: 'create' | 'edit' }) {
  const { mode } = props;
  const { t } = useTranslation();
  return (
    <Fragment>
      <PageFormTextInput
        name="user.username"
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
      <PageFormTextInput
        name="user.first_name"
        label={t('First name')}
        placeholder={t('Enter first name')}
        maxLength={150}
      />
      <PageFormTextInput
        name="user.last_name"
        label={t('Last name')}
        placeholder={t('Enter last name')}
        maxLength={150}
      />
      <PageFormTextInput name="user.email" label={t('Email')} placeholder={t('Enter email')} />
      <PageFormTextInput
        name="user.password"
        label={t('Password')}
        placeholder={t('Enter password')}
        type="password"
        autoComplete="new-password"
        isRequired={mode === 'create'}
      />
      <PageFormTextInput
        name="confirmPassword"
        label={t('Confirm password')}
        placeholder={t('Enter password')}
        type="password"
        autoComplete="new-password"
        isRequired={mode === 'create'}
      />
      <PageFormRolesSelect<UserFields> name="roles" labelHelp={t('User roles')} />
    </Fragment>
  );
}
