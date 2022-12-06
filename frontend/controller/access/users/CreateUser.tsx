import { Static, Type } from '@sinclair/typebox'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { PageBody, PageForm, PageFormSubmitHandler, PageHeader } from '../../../../framework'
import {
  PageFormSchema,
  TypeSecretInput,
  TypeSelect,
  TypeTextInput,
} from '../../../../framework/PageForm/PageFormSchema'
import { ItemsResponse, requestGet, requestPost } from '../../../Data'
import { RouteE } from '../../../Routes'
import { Organization } from '../../interfaces/Organization'
import { User } from '../../interfaces/User'
import { getControllerError } from '../../useControllerView'
import { useSelectOrganization } from '../organizations/hooks/useSelectOrganization'

export function CreateUser() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const selectOrganization = useSelectOrganization()

  const CreateUserSchema = Type.Object({
    username: TypeTextInput({ title: t('Username'), maxLength: 150, autoComplete: 'new-username' }),
    organization: Type.String({
      title: t('Organization'),
      variant: 'select',
      selectTitle: 'Select an organization',
      selectValue: (organization: Organization) => organization.name,
      selectOpen: selectOrganization,
    }),
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
    password: TypeSecretInput({ title: t('Password'), autoComplete: 'new-password' }),
    confirmPassword: TypeSecretInput({
      title: t('Confirm password'),
      placeholder: t('Confirm password'),
      autoComplete: 'new-password',
    }),
    firstName: Type.Optional(TypeTextInput({ title: t('First name'), maxLength: 150 })),
    lastName: Type.Optional(TypeTextInput({ title: t('Last name'), maxLength: 150 })),
    email: Type.Optional(TypeTextInput({ title: t('Email'), format: 'email' })),
  })
  type CreateUser = Static<typeof CreateUserSchema>

  const onSubmit: PageFormSubmitHandler<CreateUser> = async (userData, setError, setFieldError) => {
    try {
      const result = await requestGet<ItemsResponse<Organization>>(
        `/api/v2/organizations/?name=${userData.organization}`
      )
      if (result.results.length === 0) {
        setFieldError('organization', { message: t('Organization not found') })
        return false
      }
      const organization = result.results[0]
      if (userData.confirmPassword !== userData.password) {
        setFieldError('confirmPassword', { message: t('Password does not match.') })
        return false
      }
      const newUser: Partial<User> = {
        username: userData.username,
        last_name: userData.lastName,
        first_name: userData.firstName,
        email: userData.email,
        password: userData.password,
        is_superuser: userData.userType === t('System administrator'),
        is_system_auditor: userData.userType === t('System auditor'),
      }
      const user = await requestPost<User>(
        `/api/v2/organizations/${organization.id.toString()}/users/`,
        newUser
      )
      navigate(RouteE.UserDetails.replace(':id', user.id.toString()))
    } catch (err) {
      setError(await getControllerError(err))
    }
  }

  const onCancel = () => navigate(-1)

  return (
    <>
      <PageHeader
        title={t('Create user')}
        breadcrumbs={[{ label: t('Users'), to: RouteE.Users }, { label: t('Create user') }]}
      />
      <PageBody>
        <PageForm
          schema={CreateUserSchema}
          submitText={t('Create user')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
          defaultValue={{ userType: t('Normal user') }}
        >
          <PageFormSchema schema={CreateUserSchema} />
        </PageForm>
      </PageBody>
    </>
  )
}
