import { SubmitHandler } from 'react-hook-form'
import { useHistory } from 'react-router-dom'
import { FormPage, FormTextInput } from '../../../common/FormPage'
import { useTranslation } from '../../../framework/components/useTranslation'
import { RouteE } from '../../../route'
import { CreateTeamType, Team } from './Team'

export function CreateTeam() {
    const { t } = useTranslation()
    const history = useHistory()

    const onSubmit: SubmitHandler<Team> = (data) => console.log(data)
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
        >
            <FormTextInput label={t('Name')} name="name" required />
            <FormTextInput label={t('Description')} name="description" />
            <FormTextInput label={t('Organization')} name="organization" />
        </FormPage>
    )
}
