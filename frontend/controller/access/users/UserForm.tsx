/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import {
  PageForm,
  PageFormSelectOption,
  PageFormSubmitHandler,
  PageHeader,
  PageLayout,
} from '../../../../framework';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { ItemsResponse, requestGet, requestPatch, requestPost, swrOptions } from '../../../Data';
import { RouteE } from '../../../Routes';
import { Organization } from '../../interfaces/Organization';
import { User } from '../../interfaces/User';
import { getControllerError } from '../../useControllerView';
import { useSelectOrganization } from '../organizations/hooks/useSelectOrganization';

export function CreateUser() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const onSubmit: PageFormSubmitHandler<IUserInput> = async (userData, setError, setFieldError) => {
    try {
      if (userData.confirmPassword !== userData.password) {
        setFieldError('confirmPassword', { message: t('Password does not match.') });
        return false;
      }
      const newUser: Partial<User> = {
        username: userData.username,
        last_name: userData.lastName,
        first_name: userData.firstName,
        email: userData.email,
        password: userData.password,
        is_superuser: userData.userType === t('System administrator'),
        is_system_auditor: userData.userType === t('System auditor'),
      };
      const user = await requestPost<User>(
        `/api/v2/organizations/${userData.organization.toString()}/users/`,
        newUser
      );
      navigate(RouteE.UserDetails.replace(':id', user.id.toString()));
    } catch (err) {
      setError(await getControllerError(err));
    }
  };

  const onCancel = () => navigate(-1);

  return (
    <>
      <PageHeader
        title={t('Create user')}
        breadcrumbs={[{ label: t('Users'), to: RouteE.Users }, { label: t('Create user') }]}
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
  const { data: user } = useSWR<User>(`/api/v2/users/${id.toString()}/`, requestGet, swrOptions);

  const onSubmit: PageFormSubmitHandler<IUserInput> = async (userData, setError, setFieldError) => {
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
      <PageLayout>
        <PageHeader
          breadcrumbs={[{ label: t('Users'), to: RouteE.Users }, { label: t('Edit user') }]}
        />
      </PageLayout>
    );
  }

  const defaultValue: Partial<IUserInput> = {
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
    <PageLayout>
      <PageHeader
        title={t('Edit user')}
        breadcrumbs={[{ label: t('Users'), to: RouteE.Users }, { label: t('Edit user') }]}
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
  organization: string;
  password: string;
  confirmPassword: string;
  username: string;
  lastName: string | null;
  firstName: string | null;
  email: string | null;
  userType: string;
}

function UserInputs(props: { mode: 'create' | 'edit' }) {
  const { mode } = props;
  const { setValue } = useFormContext();
  const { t } = useTranslation();
  const selectOrganization = useSelectOrganization();
  return (
    <>
      <PageFormTextInput
        name="username"
        label={t('Username')}
        placeholder={t('Enter username')}
        isRequired
        maxLength={150}
        autoComplete="new-username"
        validate={(username) => {
          for (const c of username) {
            if (
              !'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890@.+-_'.includes(c)
            ) {
              return t('Username  may contain only letters, numbers, and @.+-_ characters.');
            }
          }
        }}
      />
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
        <PageFormTextInput
          label="Organization"
          name="summary_fields.organization.name"
          placeholder="Enter organization"
          selectTitle={t('Select an organization')}
          selectValue={(organization: Organization) => organization.name}
          selectOpen={selectOrganization}
          validate={async (organizationName: string) => {
            try {
              const itemsResponse = await requestGet<ItemsResponse<Organization>>(
                `/api/v2/organizations/?name=${organizationName}`
              );
              if (itemsResponse.results.length === 0) return t('Organization not found.');
              setValue('organization', itemsResponse.results[0].id);
            } catch (err) {
              if (err instanceof Error) return err.message;
              else return 'Unknown error';
            }
            return undefined;
          }}
          isRequired
        />
      )}
      <PageFormTextInput
        name="password"
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
      <PageFormTextInput
        name="firstName"
        label={t('First name')}
        placeholder={t('Enter first name')}
        maxLength={150}
      />
      <PageFormTextInput
        name="lastName"
        label={t('Last name')}
        placeholder={t('Enter last name')}
        maxLength={150}
      />
      <PageFormTextInput name="email" label={t('Email')} placeholder={t('Enter email')} />
    </>
  );
}
