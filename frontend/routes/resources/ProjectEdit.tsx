import { FormGroup, FormSection, PageSection, SelectOption, Split, SplitItem, Stack } from '@patternfly/react-core'
import { GitAltIcon, RedhatIcon } from '@patternfly/react-icons'
import { Static } from '@sinclair/typebox'
import { Fragment, Suspense } from 'react'
import { SubmitHandler, useWatch } from 'react-hook-form'
import { useHistory, useParams } from 'react-router-dom'
import { FormInputCheckbox, FormPage, FormPageAlerts, FormPageButtons, FormSelect, FormTextInput } from '../../common/FormPage'
import { useItems } from '../../Data'
import { ICatalogBreadcrumb, PageHeader } from '../../framework'
import { LoadingPage } from '../../framework/components/LoadingPage'
import { useTranslation } from '../../framework/components/useTranslation'
import { RouteE } from '../../route'
import { useCredentials } from './Credentials'
import { ProjectType, useProject } from './Projects'

type IProject = Static<typeof ProjectType>

export function ProjectEditPage() {
    const { t } = useTranslation()
    const baseBreadcrumbs = [
        { label: t('Dashboard'), to: RouteE.Dashboard },
        { label: t('Projects'), to: RouteE.Projects },
    ]
    return (
        <Suspense fallback={<LoadingPage breadcrumbs={baseBreadcrumbs} />}>
            <ProjectEditPageContent baseBreadcrumbs={baseBreadcrumbs} />
        </Suspense>
    )
}

export function ProjectEditPageContent(props: { baseBreadcrumbs: ICatalogBreadcrumb[] }) {
    const { t } = useTranslation()
    const params = useParams<{ id: string }>()
    const id = Number(params.id)
    const project = useProject(id)
    const organizations = []
    const { items: execution_environments } = useItems('execution_environments')
    const history = useHistory()

    const breadcrumbs = [...props.baseBreadcrumbs, { label: project?.name ?? '' }]
    if (!project) return <></>

    const onSubmit: SubmitHandler<IProject> = (data) => console.log(data)
    const onCancel = () => {
        history.push(RouteE.ProjectDetails.replace(':id', project.id.toString()))
    }

    return (
        <Fragment>
            <PageHeader title={project.name} breadcrumbs={breadcrumbs} />
            <FormPage defaultValues={project} onSubmit={onSubmit} schema={ProjectType}>
                <PageSection>
                    <FormSection>
                        <FormTextInput label={t('Name')} name="name" required />
                        <FormTextInput label={t('Description')} name="description" />
                        <FormSelect label={t('Organization')} name="organization" required>
                            {organizations.map((organization) => (
                                <SelectOption key={organization.id} value={organization.id}>
                                    {organization.name}
                                </SelectOption>
                            ))}
                        </FormSelect>
                        <FormSelect label={t('Execution Environment')} name="executionEnvironment">
                            {execution_environments.map((organization) => (
                                <SelectOption key={organization.id} value={organization.id}>
                                    {organization.name}
                                </SelectOption>
                            ))}
                        </FormSelect>
                        <FormSelect label={t('Source Control Type')} name="scm_type">
                            <SelectOption value="manual">Manual</SelectOption>
                            <SelectOption value="git">
                                <Split>
                                    <GitAltIcon color="#F1502F" size="md" style={{ paddingRight: 6 }} />
                                    <SplitItem>Git</SplitItem>
                                </Split>
                            </SelectOption>
                            <SelectOption value="subversion">Subversion</SelectOption>
                            <SelectOption value="insights">
                                <Split>
                                    <RedhatIcon color="#ee0000" size="md" style={{ paddingRight: 6 }} />
                                    <SplitItem>Red Hat Insights</SplitItem>
                                </Split>
                            </SelectOption>
                            <SelectOption value="remote">Remote Archive</SelectOption>
                        </FormSelect>
                        <SourceControl />
                    </FormSection>
                </PageSection>
                <FormPageAlerts />
                <FormPageButtons onCancel={onCancel} />
            </FormPage>
        </Fragment>
    )
}

function SourceControl() {
    const { t } = useTranslation()
    const scm_type = useWatch({ name: 'scm_type' })
    const credentials = useCredentials()

    switch (scm_type) {
        case 'manual':
            return (
                <FormSection title={t('Source Control')}>
                    <FormTextInput label={t('Project Base Path')} name="local_path" required />
                    <FormSelect label={t('Playbook Directory')} name="sourceControlCredential" />
                </FormSection>
            )
        case 'git':
            return (
                <FormSection title={t('Source Control')}>
                    <FormTextInput label={t('URL')} name="scm_url" required />
                    <FormTextInput label={t('Branch')} name="scm_branch" />
                    <FormTextInput label={t('Refspec')} name="scm_refspec" />
                    <FormSelect label={t('Credential')} name="sourceControlCredential">
                        {credentials.map((organization) => (
                            <SelectOption key={organization.id} value={organization.id}>
                                {organization.name}
                            </SelectOption>
                        ))}
                    </FormSelect>{' '}
                    <FormGroup label="Options" hasNoPaddingTop role="group">
                        <Stack hasGutter>
                            <FormInputCheckbox label={t('Clean')} name="scm_clean" />
                            <FormInputCheckbox label={t('Delete')} name="scm_delete_on_update" />
                            <FormInputCheckbox label={t('Track submodules')} name="scm_track_submodules" />
                            <FormInputCheckbox
                                label={t('Update Revision on Launch')}
                                name="scm_update_on_launch"
                                body={<FormTextInput label="Cache Timeout" name="timeout" />}
                            />
                            <FormInputCheckbox label={t('Allow Branch Override')} name="allow_override" />
                        </Stack>
                    </FormGroup>
                </FormSection>
            )
        case 'subversion':
            return (
                <FormSection title={t('Source Control')}>
                    <FormTextInput label={t('URL')} name="scm_url" required />
                    <FormTextInput label={t('revision')} name="scm_revision" />
                    <FormSelect label={t('Credential')} name="sourceControlCredential">
                        {credentials.map((organization) => (
                            <SelectOption key={organization.id} value={organization.id}>
                                {organization.name}
                            </SelectOption>
                        ))}
                    </FormSelect>
                    <FormGroup label="Options" hasNoPaddingTop role="group">
                        <Stack hasGutter>
                            <FormInputCheckbox label={t('Clean')} name="scm_clean" />
                            <FormInputCheckbox label={t('Delete')} name="scm_delete_on_update" />
                            <FormInputCheckbox label={t('Track submodules')} name="scm_track_submodules" />
                            <FormInputCheckbox
                                label={t('Update Revision on Launch')}
                                name="scm_update_on_launch"
                                body={<FormTextInput label="Cache Timeout" name="timeout" />}
                            />
                            <FormInputCheckbox label={t('Allow Branch Override')} name="allow_override" />
                        </Stack>
                    </FormGroup>
                </FormSection>
            )
        case 'insights':
            return (
                <FormSection title={t('Source Control')}>
                    <FormSelect label={t('Credential')} name="sourceControlCredential">
                        {credentials.map((organization) => (
                            <SelectOption key={organization.id} value={organization.id}>
                                {organization.name}
                            </SelectOption>
                        ))}
                    </FormSelect>
                    <FormGroup label="Options" hasNoPaddingTop role="group">
                        <Stack hasGutter>
                            <FormInputCheckbox label={t('Clean')} name="scm_clean" />
                            <FormInputCheckbox label={t('Delete')} name="scm_delete_on_update" />
                            <FormInputCheckbox label={t('Track submodules')} name="scm_track_submodules" />
                            <FormInputCheckbox
                                label={t('Update Revision on Launch')}
                                name="scm_update_on_launch"
                                body={<FormTextInput label="Cache Timeout" name="timeout" />}
                            />
                        </Stack>
                    </FormGroup>
                </FormSection>
            )
        case 'remote':
            return (
                <FormSection title={t('Source Control')}>
                    <FormTextInput label={t('URL')} name="scm_url" required />
                    <FormSelect label={t('Credential')} name="sourceControlCredential">
                        {credentials.map((organization) => (
                            <SelectOption key={organization.id} value={organization.id}>
                                {organization.name}
                            </SelectOption>
                        ))}
                    </FormSelect>
                    <FormGroup label="Options" hasNoPaddingTop role="group">
                        <Stack hasGutter>
                            <FormInputCheckbox label={t('Clean')} name="scm_clean" />
                            <FormInputCheckbox label={t('Delete')} name="scm_delete_on_update" />
                            <FormInputCheckbox label={t('Track submodules')} name="scm_track_submodules" />
                            <FormInputCheckbox
                                label={t('Update Revision on Launch')}
                                name="scm_update_on_launch"
                                body={<FormTextInput label="Cache Timeout" name="timeout" />}
                            />
                            <FormInputCheckbox label={t('Allow Branch Override')} name="allow_override" />
                        </Stack>
                    </FormGroup>
                </FormSection>
            )
        default:
            return <></>
    }
}
