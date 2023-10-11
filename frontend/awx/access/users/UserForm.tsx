/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import {
  PageFormSelect,
  PageFormSubmitHandler,
  PageHeader,
  PageLayout,
  useGetPageUrl,
} from '../../../../framework';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { RouteObj } from '../../../common/Routes';
import { requestGet, requestPatch, swrOptions } from '../../../common/crud/Data';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { AwxPageForm } from '../../AwxPageForm';
import { AwxRoute } from '../../AwxRoutes';
import { Organization } from '../../interfaces/Organization';
import { User } from '../../interfaces/User';
import { PageFormOrganizationSelect } from '../organizations/components/PageFormOrganizationSelect';
import { getOrganizationByName } from '../organizations/utils/getOrganizationByName';

export function CreateUser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const postRequest = usePostRequest<User, User>();
  const onSubmit: PageFormSubmitHandler<IUserInput> = async (
    userInput,
    setError,
    setFieldError
  ) => {
    const { user, userType, confirmPassword } = userInput;
    let organization: Organization | undefined;
    try {
      organization = await getOrganizationByName(user.summary_fields.organization.name);
      if (!organization) throw new Error(t('Organization not found.'));
      user.organization = organization.id;
    } catch {
      throw new Error(t('Organization not found.'));
    }
    user.is_superuser = userType === 'System administrator';
    user.is_system_auditor = userType === 'System auditor';
    if (confirmPassword !== user.password) {
      setFieldError('confirmPassword', { message: t('Password does not match.') });
      return false;
    }
    const newUser = await postRequest(
      `/api/v2/organizations/${user.organization.toString()}/users/`,
      user
    );
    navigate(RouteObj.UserDetails.replace(':id', newUser.id.toString()));
  };

  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  return (
    <>
      <PageHeader
        title={t('Create User')}
        breadcrumbs={[
          { label: t('Users'), to: getPageUrl(AwxRoute.Users) },
          { label: t('Create User') },
        ]}
      />
      <AwxPageForm
        submitText={t('Create user')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{ userType: 'Normal user' }}
      >
        <UserInputs mode="create" />
      </AwxPageForm>
    </>
  );
}

export function EditUser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: user } = useSWR<User>(`/api/v2/users/${id.toString()}/`, requestGet, swrOptions);

  const onSubmit: PageFormSubmitHandler<IUserInput> = async (
    userInput: IUserInput,
    setError,
    setFieldError
  ) => {
    const { user, userType, confirmPassword } = userInput;
    user.is_superuser = userType === t('System administrator');
    user.is_system_auditor = userType === t('System auditor');
    if (user.password) {
      if (confirmPassword !== user.password) {
        setFieldError('confirmPassword', { message: t('Password does not match.') });
        return false;
      }
    }
    const newUser = await requestPatch<User>(`/api/v2/users/${id}/`, user);
    navigate(RouteObj.UserDetails.replace(':id', newUser.id.toString()));
  };

  const getPageUrl = useGetPageUrl();

  const onCancel = () => navigate(-1);

  if (!user) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Users'), to: getPageUrl(AwxRoute.Users) },
            { label: t('Edit User') },
          ]}
        />
      </PageLayout>
    );
  }

  const { password, ...defaultUserValue } = user;
  const defaultValue: Partial<IUserInput> = {
    user: defaultUserValue,
    userType: user.is_superuser
      ? 'System administrator'
      : user.is_system_auditor
      ? 'System auditor'
      : 'Normal user',
  };
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit User')}
        breadcrumbs={[
          { label: t('Users'), to: getPageUrl(AwxRoute.Users) },
          { label: t('Edit User') },
        ]}
      />
      <AwxPageForm<IUserInput>
        submitText={t('Save user')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={defaultValue}
      >
        <UserInputs mode="edit" />
      </AwxPageForm>
    </PageLayout>
  );
}

interface IUserInput {
  user: User;
  userType: string;
  confirmPassword: string;
}

function UserInputs(props: { mode: 'create' | 'edit' }) {
  const { mode } = props;
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<IUserInput>
        name="user.username"
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
      <PageFormSelect<IUserInput>
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
        ]}
        isRequired
      />
      {mode === 'create' && (
        <PageFormOrganizationSelect<IUserInput> name="user.summary_fields.organization.name" />
      )}
      <PageFormSection>
        <PageFormTextInput<IUserInput>
          name="user.password"
          label={t('Password')}
          placeholder={t('Enter password')}
          type="password"
          isRequired={mode === 'create'}
        />
        <PageFormTextInput<IUserInput>
          name="confirmPassword"
          label={t('Confirm password')}
          placeholder={t('Enter password')}
          type="password"
          isRequired={mode === 'create'}
        />
      </PageFormSection>
      <PageFormTextInput<IUserInput>
        name="user.first_name"
        label={t('First name')}
        placeholder={t('Enter first name')}
        maxLength={150}
      />
      <PageFormTextInput<IUserInput>
        name="user.last_name"
        label={t('Last name')}
        placeholder={t('Enter last name')}
        maxLength={150}
      />
      <PageFormTextInput<IUserInput>
        name="user.email"
        label={t('Email')}
        placeholder={t('Enter email')}
      />
    </>
  );
}
