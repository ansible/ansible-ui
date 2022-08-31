import { Static, Type } from '@sinclair/typebox'
import { HTTPError } from 'ky'
import { useHistory } from 'react-router-dom'
import { PageHeader } from '../../../../framework'
import { useTranslation } from '../../../../framework/components/useTranslation'
import { FormPageSubmitHandler, PageForm } from '../../../common/FormPage'
import { getUrl, ItemsResponse, postUrl } from '../../../Data'
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
            errorMessage: { minLength: t('Name is required') },
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
                    placeholder: t('Enter the organization'),
                    minLength: 1,
                    errorMessage: { minLength: t('Organization is required') },
                    variant: 'select',
                }),
            }),
        }),
    })

    type CreateTeam = Static<typeof CreateTeamSchema>

    const onSubmit: FormPageSubmitHandler<CreateTeam> = async (createTeam, setError, setFieldError) => {
        try {
            if (process.env.NODE_ENV === 'development') await new Promise((resolve) => setTimeout(resolve, 2000))
            const result = await getUrl<ItemsResponse<Organization>>(
                `/api/v2/organizations/?name=${createTeam.summary_fields.organization.name}`
            )
            if (result.results.length === 0) {
                setFieldError('summary_fields.organization.name', { message: t('Organization not found') })
                return false
            }
            const organization = result.results[0]
            createTeam.organization = organization.id
            const team = await postUrl<Team>('/api/v2/teams/', createTeam)
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
            <PageHeader title={t('Create Team')} breadcrumbs={[{ label: t('Teams'), to: RouteE.Teams }, { label: t('Create Team') }]} />
            <PageForm schema={CreateTeamSchema} submitText={t('Create')} onSubmit={onSubmit} cancelText={t('Cancel')} onCancel={onCancel} />
        </>
    )
}
