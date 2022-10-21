import { Static, Type } from '@sinclair/typebox'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import useSWR from 'swr'
import { FormPageSubmitHandler, PageBody, PageForm, PageHeader } from '../../../../framework'
import { requestGet, requestPatch, swrOptions } from '../../../Data'
import { RouteE } from '../../../Routes'
import { getControllerError } from '../../useControllerView'
import { User } from './User'

export function EditUser() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const params = useParams<{ id?: string }>()
    const id = Number(params.id)

    const { data: user } = useSWR<User>(
        Number.isInteger(id) ? `/api/v2/users/${id.toString()}/` : undefined,
        requestGet,
        swrOptions
    )

    const EditUserSchema = Type.Object({
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
        userType: Type.String({
            title: t('User type'),
            placeholder: t('Select user type'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            enum: [t('System administrator'), t('System auditor'), t('Normal user')],
            variant: 'select',
            options: [
                {
                    label: t('System administrator'),
                    description: t(
                        'can edit, change, and update any inventory or automation definition'
                    ),
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
        password: Type.Optional(
            Type.String({
                title: t('Password'),
                placeholder: t('Enter password'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
                variant: 'secret',
            })
        ),
        confirmPassword: Type.Optional(
            Type.String({
                title: t('Confirm password'),
                placeholder: t('Confirm password'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
                variant: 'secret',
            })
        ),
        firstName: Type.Optional(
            Type.String({
                title: t('First name'),
                placeholder: t('Enter first name'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
                maxLength: 150,
                errorMessage: {
                    maxLength: t('First name cannot contain more than 150 characters.'),
                },
                section: 'Details',
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
                section: 'Details',
            })
        ),
        email: Type.Optional(
            Type.String({
                title: t('Email'),
                placeholder: t('Enter email'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
                format: 'email',
                section: 'Details',
            })
        ),
    })
    type EditUser = Static<typeof EditUserSchema>

    const onSubmit: FormPageSubmitHandler<EditUser> = async (userData, setError, setFieldError) => {
        try {
            if (user) {
                user.username = userData.username
                user.first_name = userData.firstName
                user.last_name = userData.lastName
                user.email = userData.email
                user.is_superuser = userData.userType === t('System administrator')
                user.is_system_auditor = userData.userType === t('System auditor')
                if (userData.password) {
                    if (userData.confirmPassword !== userData.password) {
                        setFieldError('confirmPassword', { message: t('Password does not match.') })
                        return false
                    }
                    user.password = userData.password
                }
                const newUser = await requestPatch<User>(`/api/v2/users/${id}/`, user)
                navigate(RouteE.UserDetails.replace(':id', newUser.id.toString()))
            }
        } catch (err) {
            setError(await getControllerError(err))
        }
    }

    const onCancel = () => navigate(-1)

    if (!user) {
        return (
            <>
                <PageHeader
                    breadcrumbs={[
                        { label: t('Users'), to: RouteE.Users },
                        { label: t('Edit user') },
                    ]}
                />
            </>
        )
    } else {
        const defaultValue: EditUser = {
            username: user.username,
            lastName: user.last_name,
            firstName: user.first_name,
            email: user.email,
            userType: user.is_superuser
                ? t('System administrator')
                : user.is_system_auditor
                ? t('System auditor')
                : t('Normal user'),
        }
        return (
            <>
                <PageHeader
                    title={t('Edit user')}
                    breadcrumbs={[
                        { label: t('Users'), to: RouteE.Users },
                        { label: t('Edit user') },
                    ]}
                />
                <PageBody>
                    <PageForm
                        schema={EditUserSchema}
                        submitText={t('Save user')}
                        onSubmit={onSubmit}
                        cancelText={t('Cancel')}
                        onCancel={onCancel}
                        defaultValue={defaultValue}
                    />
                </PageBody>
            </>
        )
    }
}
