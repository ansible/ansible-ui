/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Fragment } from 'react';
import { FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import {
  PageForm,
  PageFormSelectOption,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
} from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { requestGet, requestPatch, swrOptions } from '../../../common/crud/Data';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { API_PREFIX } from '../../constants';
import { EdaGroup } from '../../interfaces/EdaGroup';
import { EdaUser } from '../../interfaces/EdaUser';
import { PageFormGroupSelect } from '../Groups/components/PageFormGroupSelect';

interface UserFields extends FieldValues {
  user: EdaUser;
  groups?: EdaGroup[];
}

export function CreateUser() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const postRequest = usePostRequest<Partial<EdaUser>, EdaUser>();

  const onSubmit: PageFormSubmitHandler<IUserInput> = async (userInput, _, setFieldError) => {
    const { user, userType, confirmPassword } = userInput;
    user.is_superuser = userType === t('System administrator');
    if (confirmPassword !== user.password) {
      setFieldError('confirmPassword', { message: t('Password does not match.') });
      return false;
    }
    const newUser = await postRequest(`${API_PREFIX}/activations/`, user);
    navigate(RouteObj.EdaUserDetails.replace(':id', newUser.id.toString()));
  };

  const onCancel = () => navigate(-1);

  return (
    <>
      <PageHeader
        title={t('Create user')}
        breadcrumbs={[{ label: t('Users'), to: RouteObj.EdaUsers }, { label: t('Create user') }]}
      />
      <PageForm
        submitText={t('Create user')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{ userType: 'Normal user' }}
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
    const { user, userType, confirmPassword } = userInput;
    user.is_superuser = userType === t('System administrator');
    if (user.password) {
      if (confirmPassword !== user.password) {
        setFieldError('confirmPassword', { message: t('Password does not match.') });
        return false;
      }
    }
    const newUser = await requestPatch<EdaUser>(`${API_PREFIX}/users/${id}/`, user);
    navigate(RouteObj.EdaUserDetails.replace(':id', newUser.id.toString()));
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
    userType: user.is_superuser ? 'System administrator' : 'Normal user',
  };
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit user')}
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
  userType: string;
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
        name="user.firstName"
        label={t('First name')}
        placeholder={t('Enter first name')}
        maxLength={150}
      />
      <PageFormTextInput
        name="user.lastName"
        label={t('Last name')}
        placeholder={t('Enter last name')}
        maxLength={150}
      />
      <PageFormTextInput name="user.email" label={t('Email')} placeholder={t('Enter email')} />
      <PageFormSelectOption
        name="userType"
        label={t('User type')}
        placeholderText={t('Select user type')}
        options={[
          {
            label: t('System administrator'),
            description: t('can edit, change, and update any inventory or automation definition'),
            value: 'System administrator',
          },
          {
            label: t('Normal user'),
            description: t(
              'has read and write access limited to the resources (such as inventory, projects, and job templates) for which that user has been granted the appropriate roles and privileges'
            ),
            value: 'Normal user',
          },
        ]}
        isRequired
      />
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
      <PageFormGroupSelect<UserFields> name="user.groups" />
    </Fragment>
  );
}
