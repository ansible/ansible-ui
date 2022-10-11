import { Static, Type } from '@sinclair/typebox'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { FormPageSubmitHandler, PageBody, PageForm, PageHeader } from '../../../../framework'
import { ItemsResponse, requestGet, requestPost } from '../../../Data'
import { RouteE } from '../../../Routes'
import { getControllerError } from '../../useControllerView'
import { Organization } from '../organizations/Organization'
import { useSelectOrganization } from '../organizations/useSelectOrganization'
import { User } from './User'

export function CreateUser() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const selectOrganization = useSelectOrganization()

    const CreateUserSchema = Type.Object({
        username: Type.String({
            title: t('Username'),
            placeholder: t('Enter username'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            minLength: 1,
            maxLength: 150,
            errorMessage: {
                minLength: t('Username is required'),
                maxLength: t('Username cannot contain more than 150 characters.'),
            },
        }),
        organization: Type.String({
            title: t('Organization'),
            placeholder: t('Enter the organization'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            minLength: 1,
            errorMessage: { minLength: t('Organization is required') },
            variant: 'select',
            selectTitle: 'Select an organization',
            selectValue: (organization: Organization) => organization.name,
            selectOpen: selectOrganization,
        }),
        userType: Type.String({
            title: t('User type'),
            placeholder: t('Select user type'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            enum: [t('System administrator'), t('System auditor'), t('Normal user')],
        }),
        password: Type.String({
            title: t('Password'),
            placeholder: t('Enter password'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            variant: 'secret',
            minLength: 1,
            errorMessage: {
                minLength: t('Password is required'),
            },
        }),
        confirmPassword: Type.String({
            title: t('Confirm password'),
            placeholder: t('Confirm password'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            variant: 'secret',
            minLength: 1,
            errorMessage: {
                minLength: t('Comfirmation is required'),
            },
        }),
        firstName: Type.Optional(
            Type.String({
                title: t('First name'),
                placeholder: t('Enter first name'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
                maxLength: 150,
                errorMessage: {
                    maxLength: t('First name cannot contain more than 150 characters.'),
                },
            })
        ),
        lastName: Type.Optional(
            Type.String({
                title: t('Last name'),
                placeholder: t('Enter last name'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
                maxLength: 150,
                errorMessage: {
                    maxLength: t('Last name cannot contain more than 150 characters.'),
                },
            })
        ),
        email: Type.Optional(
            Type.String({
                title: t('Email'),
                placeholder: t('Enter email'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
                format: 'email',
            })
        ),
    })
    type CreateUser = Static<typeof CreateUserSchema>

    const onSubmit: FormPageSubmitHandler<CreateUser> = async (userData, setError, setFieldError) => {
        try {
            const result = await requestGet<ItemsResponse<Organization>>(`/api/v2/organizations/?name=${userData.organization}`)
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
            const user = await requestPost<User>(`/api/v2/organizations/${organization.id.toString()}/users/`, newUser)
            navigate(RouteE.UserDetails.replace(':id', user.id.toString()))
        } catch (err) {
            setError(await getControllerError(err))
        }
    }

    const onCancel = () => navigate(-1)

    return (
        <>
            <PageHeader title={t('Create user')} breadcrumbs={[{ label: t('Users'), to: RouteE.Users }, { label: t('Create user') }]} />
            <PageBody>
                <PageForm
                    schema={CreateUserSchema}
                    submitText={t('Create user')}
                    onSubmit={onSubmit}
                    cancelText={t('Cancel')}
                    onCancel={onCancel}
                    defaultValue={{ userType: t('Normal user') }}
                />
            </PageBody>
        </>
    )
}
