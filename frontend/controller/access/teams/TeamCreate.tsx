import { Static, Type } from '@sinclair/typebox'
import ky, { HTTPError } from 'ky'
import { useHistory } from 'react-router-dom'
import { PageHeader } from '../../../../framework'
import { useTranslation } from '../../../../framework/components/useTranslation'
import { FormPageSubmitHandler, PageForm } from '../../../common/FormPage'
import { headers, ItemsResponse } from '../../../Data'
import { RouteE } from '../../../route'
import { Organization } from '../organizations/Organization'
import { Team } from './Team'

export function CreateTeam() {
    const { t } = useTranslation()
    const history = useHistory()

    const CreateTeamSchema = Type.Object({
        name: Type.String({
            title: t('Name'),
            placeholder: t('Enter the name'),
            minLength: 1,
            errorMessage: { required: 'Name is required', minLength: 'Name is required' },
        }),
        description: Type.Optional(
            Type.String({
                title: t('Description'),
                placeholder: t('Enter the description'),
                variant: 'textarea',
            })
        ),
        organization: Type.Optional(Type.Number()),
        summary_fields: Type.Object({
            organization: Type.Object({
                name: Type.String({
                    title: t('Organization'),
                    placeholder: 'Enter the organization',
                    minLength: 1,
                    errorMessage: { required: 'Organization is required', minLength: 'Organization is required' },
                    variant: 'select',
                }),
            }),
        }),
    })

    type CreateTeam = Static<typeof CreateTeamSchema>

    const onSubmit: FormPageSubmitHandler<CreateTeam> = async (createTeam, setError, setFieldError) => {
        try {
            if (process.env.NODE_ENV === 'development') await new Promise((resolve) => setTimeout(resolve, 2000))
            const result = await ky
                .get(`/api/v2/organizations/?name=${createTeam.summary_fields.organization.name}`, { credentials: 'include', headers })
                .json<ItemsResponse<Organization>>()
            if (result.results.length === 0) {
                setFieldError('summary_fields.organization.name', {
                    type: 'manual',
                    message: `Organization "${createTeam.summary_fields.organization.name}" not found`,
                })
                return false
            }
            const organization = result.results[0]
            createTeam.organization = organization.id
            const team = await ky.post('/api/v2/teams/', { json: createTeam, credentials: 'include', headers }).json<Team>()
            history.push(RouteE.TeamDetails.replace(':id', team.id.toString()))
        } catch (err) {
            if (err instanceof HTTPError) {
                try {
                    const response = await err.response.json()
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
    const onCancel = () => history.push(RouteE.Teams)

    return (
        <>
            <PageHeader
                title={t('Create Team')}
                breadcrumbs={[
                    { label: t('Dashboard'), to: RouteE.Dashboard },
                    { label: t('Teams'), to: RouteE.Teams },
                    { label: t('Create Team') },
                ]}
            />
            <PageForm schema={CreateTeamSchema} submitText={t('Create')} onSubmit={onSubmit} cancelText={t('Cancel')} onCancel={onCancel} />
        </>
    )
}
