import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  PageForm,
  PageFormSelectOption,
  PageFormSubmitHandler,
  PageHeader,
} from '../../../../framework';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { ItemsResponse, requestGet, requestPost } from '../../../Data';
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
        <UserInputs />
      </PageForm>
    </>
  );
}

interface IUserInput {
  organization: string;
  password: string;
  confirmPassword: string;
  username: string;
  lastName: string;
  firstName: string;
  email: string;
  userType: string;
}

function UserInputs() {
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
      <PageFormTextInput
        name="password"
        label={t('Password')}
        placeholder={t('Enter password')}
        type="password"
        autoComplete="new-password"
        isRequired
      />
      <PageFormTextInput
        name="confirmPassword"
        label={t('Confirm password')}
        placeholder={t('Enter password')}
        type="password"
        autoComplete="new-password"
        isRequired
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
