import { Static, Type } from '@sinclair/typebox'
import { useMemo } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import useSWR, { useSWRConfig } from 'swr'
import { PageBody, PageHeader } from '../../../../framework'
import { useTranslation } from '../../../../framework/components/useTranslation'
import { FormPageSubmitHandler, PageForm } from '../../../../framework/FormPage'
import { requestGet, requestPatch, requestPost, swrOptions } from '../../../Data'
import { RouteE } from '../../../route'
import { getControllerError } from '../../useControllerView'
import { Organization } from './Organization'

export function EditOrganization() {
    const { t } = useTranslation()
    const history = useHistory()

    const params = useParams<{ id?: string }>()
    const id = Number(params.id)

    const { data: organization } = useSWR<Organization>(
        Number.isInteger(id) ? `/api/v2/organizations/${id.toString()}/` : undefined,
        requestGet,
        swrOptions
    )

    const EditOrganizationSchema = useMemo(
        () =>
            Type.Object({
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
                instanceGroups: Type.Optional(
                    Type.String({
                        title: t('Instance groups'),
                        placeholder: t('Select instance groups '),
                        variant: 'select',
                    })
                ),
                executionEnvironments: Type.Optional(
                    Type.String({
                        title: t('Execution environment'),
                        placeholder: t('Select execution environmentn'),
                        variant: 'select',
                    })
                ),
                galaxyCredentials: Type.Optional(
                    Type.String({
                        title: t('Galaxy credentials'),
                        placeholder: t('Select galaxy credentials'),
                        variant: 'select',
                    })
                ),
            }),
        [t]
    )

    type CreateOrganization = Static<typeof EditOrganizationSchema>

    const { cache } = useSWRConfig()

    const onSubmit: FormPageSubmitHandler<CreateOrganization> = async (editedOrganization, setError, setFieldError) => {
        try {
            let organization: Organization
            if (Number.isInteger(id)) {
                organization = await requestPatch<Organization>(`/api/v2/organizations/${id}/`, editedOrganization)
            } else {
                organization = await requestPost<Organization>('/api/v2/organizations/', editedOrganization)
            }
            ;(cache as unknown as { clear: () => void }).clear?.()
            history.push(RouteE.OrganizationDetails.replace(':id', organization.id.toString()))
        } catch (err) {
            setError(await getControllerError(err))
        }
    }
    const onCancel = () => history.goBack()

    if (Number.isInteger(id)) {
        if (!organization) {
            return (
                <>
                    <PageHeader
                        breadcrumbs={[{ label: t('Organizations'), to: RouteE.Organizations }, { label: t('Edit Organization') }]}
                    />
                </>
            )
        } else {
            return (
                <>
                    <PageHeader
                        title={t('Edit Organization')}
                        breadcrumbs={[{ label: t('Organizations'), to: RouteE.Organizations }, { label: t('Edit Organization') }]}
                    />
                    <PageBody>
                        <PageForm
                            schema={EditOrganizationSchema}
                            submitText={t('Save organization')}
                            onSubmit={onSubmit}
                            cancelText={t('Cancel')}
                            onCancel={onCancel}
                            defaultValue={organization}
                        />
                    </PageBody>
                </>
            )
        }
    } else {
        return (
            <>
                <PageHeader
                    title={t('Create Organization')}
                    breadcrumbs={[{ label: t('Organizations'), to: RouteE.Organizations }, { label: t('Create Organization') }]}
                />
                <PageBody>
                    <PageForm
                        schema={EditOrganizationSchema}
                        submitText={t('Create organization')}
                        onSubmit={onSubmit}
                        cancelText={t('Cancel')}
                        onCancel={onCancel}
                    />
                </PageBody>
            </>
        )
    }
}
