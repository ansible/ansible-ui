import ky from 'ky'
import { SubmitHandler } from 'react-hook-form'
import { useHistory } from 'react-router-dom'
import { useTranslation } from '../../../../framework/components/useTranslation'
import { FormPage, FormPageButtons, FormTextInput } from '../../../common/FormPage'
import { headers } from '../../../Data'
import { RouteE } from '../../../route'
import { CreateTeamType, Team } from './Team'

export function CreateTeam() {
    const { t } = useTranslation()
    const history = useHistory()

    const onSubmit: SubmitHandler<Team> = async (json) => {
        if (process.env.NODE_ENV === 'development') await new Promise((resolve) => setTimeout(resolve, 2000))
        const team = await ky.post('/api/v2/teams/', { json, credentials: 'include', headers }).json<Team>()
        history.push(RouteE.TeamDetails.replace(':id', team.id.toString()))
    }
    const onCancel = () => history.push(RouteE.Teams)

    return (
        <FormPage
            title={t('Create Team')}
            breadcrumbs={[
                { label: t('Dashboard'), to: RouteE.Dashboard },
                { label: t('Teams'), to: RouteE.Teams },
                { label: t('Create Team') },
            ]}
            submitText={t('Create')}
            onSubmit={onSubmit}
            onCancel={onCancel}
            schema={CreateTeamType}
            defaultValues={{ description: '', organization: 1 }}
        >
            <FormTextInput label={t('Name')} name="name" required />
            <FormTextInput label={t('Description')} name="description" />
            {/* <FormTextInput label={t('Organization')} name="organization" /> */}
            <FormPageButtons submitText={t('Create')} onCancel={onCancel} />
        </FormPage>
    )
}
