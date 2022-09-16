import { Static, Type } from '@sinclair/typebox'
import { useHistory } from 'react-router-dom'
import { PageBody, PageHeader } from '../../../../framework'
import { useTranslation } from '../../../../framework/components/useTranslation'
import { FormPageSubmitHandler, PageForm } from '../../../common/FormPage'
import { ItemsResponse, requestGet, requestPost } from '../../../Data'
import { RouteE } from '../../../route'
import { getControllerError } from '../../useControllerView'
import { Organization } from '../organizations/Organization'
import { User } from './User'

export function CreateUser() {
    const { t } = useTranslation()
    const history = useHistory()

    const CreateUserSchema = Type.Object({
        username: Type.String({
            title: t('Username'),
            placeholder: t('Enter username'),
            minLength: 1,
            maxLength: 150,
            errorMessage: {
                minLength: t('Username is required'),
                maxLength: t('Username cannot contain more than 150 characters.'),
            },
        }),
        organization: Type.String({
            title: t('Organization'),
            placeholder: t('Enter the organization'),
            minLength: 1,
            errorMessage: { minLength: t('Organization is required') },
            variant: 'select',
        }),
        userType: Type.String({
            title: t('User type'),
            placeholder: t('Select user type'),
            enum: [t('System administrator'), t('System auditor'), t('Normal user')],
        }),
        password: Type.String({
            title: t('Password'),
            placeholder: t('Enter password'),
            variant: 'secret',
            minLength: 1,
            errorMessage: {
                minLength: t('Password is required'),
            },
        }),
        confirmPassword: Type.String({
            title: t('Confirm password'),
            placeholder: t('Confirm password'),
            variant: 'secret',
            minLength: 1,
            errorMessage: {
                minLength: t('Comfirmation is required'),
            },
        }),
        firstName: Type.Optional(
            Type.String({
                title: t('First name'),
                placeholder: t('Enter first name'),
                maxLength: 150,
                errorMessage: {
                    maxLength: t('First name cannot contain more than 150 characters.'),
                },
            })
        ),
        lastName: Type.Optional(
            Type.String({
                title: t('Last name'),
                placeholder: t('Enter last name'),
                maxLength: 150,
                errorMessage: {
                    maxLength: t('Last name cannot contain more than 150 characters.'),
                },
            })
        ),
        email: Type.Optional(
            Type.String({
                title: t('Email'),
                placeholder: t('Enter email'),
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
            const newUser: Partial<User> = {
                username: userData.username,
                last_name: userData.lastName,
                first_name: userData.firstName,
                email: userData.email,
                password: userData.password,
                is_superuser: userData.userType === t('System Administrator'),
                is_system_auditor: userData.userType === t('System Auditor'),
            }
            const user = await requestPost<User>(`/api/v2/organizations/${organization.id.toString()}/users/`, newUser)
            history.push(RouteE.UserDetails.replace(':id', user.id.toString()))
        } catch (err) {
            setError(await getControllerError(err))
        }
    }

    const onCancel = () => history.goBack()

    return (
        <>
            <PageHeader title={t('Create User')} breadcrumbs={[{ label: t('Users'), to: RouteE.Users }, { label: t('Create User') }]} />
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
