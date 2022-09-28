import { Static, Type } from '@sinclair/typebox'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import useSWR, { useSWRConfig } from 'swr'
import { PageBody, PageHeader, PageLayout } from '../../../../framework'
import { FormPageSubmitHandler, PageForm } from '../../../../framework/PageForm'
import { ItemsResponse, requestGet, requestPatch, requestPost, swrOptions } from '../../../Data'
import { RouteE } from '../../../route'
import { getControllerError } from '../../useControllerView'
import { Organization } from '../organizations/Organization'
import { useSelectOrganization } from '../organizations/useSelectOrganization'
import { Team } from './Team'

export function EditTeam() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const params = useParams<{ id?: string }>()
    const id = Number(params.id)

    const { data: team } = useSWR<Team>(Number.isInteger(id) ? `/api/v2/teams/${id.toString()}/` : undefined, requestGet, swrOptions)

    const selectOrganization = useSelectOrganization()

    const EditTeamSchema = useMemo(
        () =>
            Type.Object({
                name: Type.String({
                    title: t('Name'),
                    placeholder: t('Enter the name'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
                    minLength: 1,
                    errorMessage: { minLength: t('Name is required') },
                }),
                description: Type.Optional(
                    Type.String({
                        title: t('Description'),
                        placeholder: t('Enter the description'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
                        variant: 'textarea',
                    })
                ),
                organization: Type.Optional(Type.Number()),
                summary_fields: Type.Object({
                    organization: Type.Object({
                        name: Type.String({
                            title: t('Organization'),
                            placeholder: t('Enter the organization'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
                            minLength: 1,
                            errorMessage: { minLength: t('Organization is required') },
                            variant: 'select',
                            selectTitle: t('Select an organization'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
                            selectValue: (organization: Organization) => organization.name,
                            selectOpen: selectOrganization,
                        }),
                    }),
                }),
            }),
        [selectOrganization, t]
    )

    type CreateTeam = Static<typeof EditTeamSchema>

    const { cache } = useSWRConfig()

    const onSubmit: FormPageSubmitHandler<CreateTeam> = async (editedTeam, setError, setFieldError) => {
        try {
            const result = await requestGet<ItemsResponse<Organization>>(
                `/api/v2/organizations/?name=${editedTeam.summary_fields.organization.name}`
            )
            if (result.results.length === 0) {
                setFieldError('summary_fields.organization.name', { message: t('Organization not found') })
                return false
            }
            const organization = result.results[0]
            editedTeam.organization = organization.id
            let team: Team
            if (Number.isInteger(id)) {
                team = await requestPatch<Team>(`/api/v2/teams/${id}/`, editedTeam)
            } else {
                team = await requestPost<Team>('/api/v2/teams/', editedTeam)
            }
            ;(cache as unknown as { clear: () => void }).clear?.()
            navigate(RouteE.TeamDetails.replace(':id', team.id.toString()))
        } catch (err) {
            setError(await getControllerError(err))
        }
    }
    const onCancel = () => navigate(-1)

    if (Number.isInteger(id)) {
        if (!team) {
            return (
                <PageLayout>
                    <PageHeader breadcrumbs={[{ label: t('Teams'), to: RouteE.Teams }, { label: t('Edit team') }]} />
                </PageLayout>
            )
        } else {
            return (
                <PageLayout>
                    <PageHeader title={t('Edit team')} breadcrumbs={[{ label: t('Teams'), to: RouteE.Teams }, { label: t('Edit team') }]} />
                    <PageBody>
                        <PageForm
                            schema={EditTeamSchema}
                            submitText={t('Save team')}
                            onSubmit={onSubmit}
                            cancelText={t('Cancel')}
                            onCancel={onCancel}
                            defaultValue={team}
                        />
                    </PageBody>
                </PageLayout>
            )
        }
    } else {
        return (
            <PageLayout>
                <PageHeader title={t('Create team')} breadcrumbs={[{ label: t('Teams'), to: RouteE.Teams }, { label: t('Create team') }]} />
                <PageBody>
                    <PageForm
                        schema={EditTeamSchema}
                        submitText={t('Create team')}
                        onSubmit={onSubmit}
                        cancelText={t('Cancel')}
                        onCancel={onCancel}
                    />
                </PageBody>
            </PageLayout>
        )
    }
}
