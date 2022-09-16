import { Static, Type } from '@sinclair/typebox'
import { HTTPError } from 'ky'
import { useHistory, useParams } from 'react-router-dom'
import useSWR from 'swr'
import { PageBody, PageHeader } from '../../../../framework'
import { useTranslation } from '../../../../framework/components/useTranslation'
import { FormPageSubmitHandler, PageForm } from '../../../common/FormPage'
import { ItemsResponse, requestGet, requestPatch, requestPost } from '../../../Data'
import { RouteE } from '../../../route'
import { Organization } from '../organizations/Organization'
import { User } from './User'

export function EditUser() {
    const { t } = useTranslation()
    const history = useHistory()

    const params = useParams<{ id?: string }>()
    const id = Number(params.id)

    const { data: user } = useSWR<User>(Number.isInteger(id) ? `/api/v2/users/${id.toString()}/` : undefined, requestGet)

    const EditUserSchema = Type.Object({
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
        userType: Type.String({
            title: t('User type'),
            placeholder: t('Select user type'),
            enum: [t('Admin'), t('two'), t('three')],
        }),
        password: Type.Optional(
            Type.String({
                title: t('Password'),
                placeholder: t('Enter password'),
                variant: 'secret',
            })
        ),
        confirmPassword: Type.Optional(
            Type.String({
                title: t('Confirm password'),
                placeholder: t('Confirm password'),
                variant: 'secret',
            })
        ),
        firstName: Type.Optional(
            Type.String({
                title: t('First name'),
                placeholder: t('Enter first name'),
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
                placeholder: t('Enter last name'),
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
                placeholder: t('Enter email'),
                format: 'email',
                section: 'Details',
            })
        ),
    })
    type EditUser = Static<typeof EditUserSchema>

    const CreateUserSchema = Type.Intersect([
        Type.Omit(EditUserSchema, ['password', 'confirmPassword']),
        Type.Object({
            password: Type.String({
                title: t('Password'),
                placeholder: t('Enter password'),
                variant: 'secret',
            }),
            confirmPassword: Type.String({
                title: t('Confirm password'),
                placeholder: t('Confirm password'),
                variant: 'secret',
            }),
        }),
    ])

    // const { cache } = useSWRConfig()

    const onSubmit: FormPageSubmitHandler<EditUser> = async (editedUser, setError, setFieldError) => {
        try {
            if (process.env.DELAY) await new Promise((resolve) => setTimeout(resolve, Number(process.env.DELAY)))
            const result = await requestGet<ItemsResponse<Organization>>(
                `/api/v2/organizations/?name=${editedUser.summary_fields.organization.name}`
            )
            if (result.results.length === 0) {
                setFieldError('summary_fields.organization.name', { message: t('Organization not found') })
                return false
            }
            const organization = result.results[0]
            editedUser.organization = organization.id
            let user: User
            if (Number.isInteger(id)) {
                user = await requestPatch<User>(`/api/v2/users/${id}/`, editedUser)
            } else {
                user = await requestPost<User>('/api/v2/users/', editedUser)
            }
            // ;(cache as unknown as { clear: () => void }).clear()
            history.push(RouteE.UserDetails.replace(':id', user.id.toString()))
        } catch (err) {
            if (err instanceof HTTPError) {
                try {
                    const response = (await err.response.json()) as { __all__?: string[] }
                    if ('__all__' in response && Array.isArray(response.__all__)) {
                        setError(JSON.stringify(response.__all__[0]))
                    } else {
                        setError(JSON.stringify(response))
                    }
                } catch {
                    setError(err.message)
                }
            } else if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('unknown error')
            }
        }
    }
    const onCancel = () => {
        history.goBack()
    }

    if (!user) {
        return (
            <>
                <PageHeader breadcrumbs={[{ label: t('Users'), to: RouteE.Users }, { label: t('Edit User') }]} />
            </>
        )
    } else {
        const defaultValue: EditUser = {
            username: user.username,
            lastName: user.last_name,
            firstName: user.first_name,
            email: user.email,
        }
        return (
            <>
                <PageHeader title={t('Edit User')} breadcrumbs={[{ label: t('Users'), to: RouteE.Users }, { label: t('Edit User') }]} />
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
