/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { EdaPageForm } from '../../common/EdaPageForm';
import { edaAPI } from '../../common/eda-utils';
import { EdaCurrentUserUpdate, EdaUser, EdaUserCreateUpdate } from '../../interfaces/EdaUser';
import { EdaRoute } from '../../main/EdaRoutes';
import { PageFormSingleSelect } from '../../../../framework/PageForm/Inputs/PageFormSingleSelect';

type UserInput = EdaUserCreateUpdate & {
  userType: string;
  confirmPassword: string;
};

type CurrentUserInput = EdaCurrentUserUpdate & {
  userType: string;
  confirmPassword: string;
};

const UserType = {
  SystemAdministrator: 'System administrator',
  NormalUser: 'Normal user',
};

export function CreateUser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<EdaUserCreateUpdate, EdaUser>();
  const onSubmit: PageFormSubmitHandler<UserInput> = async (userInput, _, setFieldError) => {
    const { confirmPassword, userType, ...user } = userInput;
    user.is_superuser = userType === UserType.SystemAdministrator;
    if (confirmPassword !== user.password) {
      setFieldError('confirmPassword', { message: t('Password does not match.') });
      return false;
    }
    const createUser: EdaUserCreateUpdate = {
      ...user,
    };
    const newUser = await postRequest(edaAPI`/users/`, createUser);
    pageNavigate(EdaRoute.UserPage, { params: { id: newUser.id } });
  };

  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  return (
    <>
      <PageHeader
        title={t('Create User')}
        breadcrumbs={[
          { label: t('Users'), to: getPageUrl(EdaRoute.Users) },
          { label: t('Create User') },
        ]}
      />
      <EdaPageForm<UserInput>
        submitText={t('Create user')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{ userType: UserType.NormalUser }}
      >
        <UserInputs mode="create" />
      </EdaPageForm>
    </>
  );
}

export function EditCurrentUser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const { data: user } = useGet<EdaUser>(edaAPI`/users/me/`);
  const patchRequest = usePatchRequest<EdaCurrentUserUpdate, EdaUser>();
  const onSubmit: PageFormSubmitHandler<UserInput> = async (
    userInput: CurrentUserInput,
    _setError,
    setFieldError
  ) => {
    const { confirmPassword, ...user } = userInput;
    if (user.password) {
      if (confirmPassword !== user.password) {
        setFieldError('confirmPassword', { message: t('Password does not match.') });
        return false;
      }
    }
    const editUser: EdaCurrentUserUpdate = { ...user };
    const updatedUser = await patchRequest(edaAPI`/users/me/`, editUser);
    pageNavigate(EdaRoute.MyPage, { params: { id: updatedUser.id } });
  };

  const onCancel = () => navigate(-1);
  if (!user) {
    return (
      <PageLayout>
        <PageHeader breadcrumbs={[{ label: t('Edit user') }]} />
      </PageLayout>
    );
  }
  const editUser: EdaCurrentUserUpdate = { ...user };
  return (
    <PageLayout>
      <PageHeader
        title={`${t('Edit')} ${user?.username || t('User')}`}
        breadcrumbs={[{ label: `${t('Edit user')}` }]}
      />
      <EdaPageForm<UserInput>
        submitText={t('Save user')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={editUser}
      >
        <CurrentUserInputs />
      </EdaPageForm>
    </PageLayout>
  );
}

export function EditUser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: user } = useGet<EdaUser>(edaAPI`/users/${id.toString()}/`);
  const patchRequest = usePatchRequest<EdaUserCreateUpdate, EdaUser>();
  const onSubmit: PageFormSubmitHandler<UserInput> = async (
    userInput: UserInput,
    _setError,
    setFieldError
  ) => {
    const { confirmPassword, userType, ...user } = userInput;
    user.is_superuser = userType === UserType.SystemAdministrator;
    if (user.password) {
      if (confirmPassword !== user.password) {
        setFieldError('confirmPassword', { message: t('Password does not match.') });
        return false;
      }
    }
    const editUser: EdaUserCreateUpdate = { ...user };
    const updatedUser = await patchRequest(edaAPI`/users/${id.toString()}/`, editUser);
    pageNavigate(EdaRoute.UserPage, { params: { id: updatedUser.id } });
  };

  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  if (!user) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Users'), to: getPageUrl(EdaRoute.Users) },
            { label: t('Edit user') },
          ]}
        />
      </PageLayout>
    );
  }
  const defaultValue: Partial<UserInput> = {
    ...user,
    userType: user.is_superuser ? UserType.SystemAdministrator : UserType.NormalUser,
  };
  return (
    <PageLayout>
      <PageHeader
        title={`${t('Edit')} ${user?.username || t('User')}`}
        breadcrumbs={[
          { label: t('Users'), to: getPageUrl(EdaRoute.Users) },
          { label: `${t('Edit')} ${user?.username || t('Credential')}` },
        ]}
      />
      <EdaPageForm<UserInput>
        submitText={t('Save user')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={defaultValue}
      >
        <UserInputs mode="edit" />
      </EdaPageForm>
    </PageLayout>
  );
}
function CurrentUserInputs() {
  const { t } = useTranslation();
  return (
    <Fragment>
      <PageFormTextInput<CurrentUserInput>
        name="first_name"
        label={t('First name')}
        placeholder={t('Enter first name')}
        maxLength={150}
      />
      <PageFormTextInput<CurrentUserInput>
        name="last_name"
        label={t('Last name')}
        placeholder={t('Enter last name')}
        maxLength={150}
      />
      <PageFormTextInput<CurrentUserInput>
        name="email"
        label={t('Email')}
        placeholder={t('Enter email')}
      />
      <PageFormTextInput<CurrentUserInput>
        name="password"
        label={t('Password')}
        placeholder={t('Enter password')}
        type="password"
      />
      <PageFormTextInput<CurrentUserInput>
        name="confirmPassword"
        label={t('Confirm password')}
        placeholder={t('Enter password')}
        type="password"
      />
    </Fragment>
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
      <PageFormSingleSelect<UserInput>
        name="userType"
        label={t('User type')}
        placeholder={t('Select user type')}
        options={[
          {
            label: t('System administrator'),
            description: t('can edit, change, and update any inventory or automation definition'),
            value: UserType.SystemAdministrator,
          },
          {
            label: t('Normal user'),
            description: t(
              'has read and write access limited to the resources (such as inventory, projects, and job templates) for which that user has been granted the appropriate roles and privileges'
            ),
            value: UserType.NormalUser,
          },
        ]}
        isRequired
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
        isRequired={mode === 'create'}
      />
      <PageFormTextInput<UserInput>
        name="confirmPassword"
        label={t('Confirm password')}
        placeholder={t('Enter password')}
        type="password"
        isRequired={mode === 'create'}
      />
    </Fragment>
  );
}
