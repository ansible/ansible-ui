import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';
import {
  PageFormCheckbox,
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../framework';
import { PageFormGroup } from '../../../framework/PageForm/Inputs/PageFormGroup';
import { PageFormSection } from '../../../framework/PageForm/Utils/PageFormSection';
import { requestGet, swrOptions } from '../../common/crud/Data';
import { useGet } from '../../common/crud/useGet';
import { usePatchRequest } from '../../common/crud/usePatchRequest';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { PageFormSelectOrganization } from '../access/organizations/components/PageFormOrganizationSelect';
import { EdaPageForm } from '../common/EdaPageForm';
import { edaAPI } from '../common/eda-utils';
import { EdaCredential } from '../interfaces/EdaCredential';
import { EdaOrganization } from '../interfaces/EdaOrganization';
import { EdaProject, EdaProjectCreate, EdaProjectRead } from '../interfaces/EdaProject';
import { EdaResult } from '../interfaces/EdaResult';
import { EdaRoute } from '../main/EdaRoutes';
import { Alert } from '@patternfly/react-core';
import { useOptions } from '../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../interfaces/OptionsResponse';
import { ProjectDetails } from './ProjectPage/ProjectDetails';

function ProjectCreateInputs() {
  const { t } = useTranslation();
  const { data: credentials } = useGet<EdaResult<EdaCredential>>(
    edaAPI`/eda-credentials/` + `?credential_type__kind=scm&page_size=300`
  );
  const { data: verifyCredentials } = useGet<EdaResult<EdaCredential>>(
    edaAPI`/eda-credentials/` + `?credential_type__kind=cryptography&page_size=300`
  );

  return (
    <>
      <PageFormSection>
        <PageFormTextInput<EdaProjectCreate>
          name="name"
          label={t('Name')}
          placeholder={t('Enter name')}
          isRequired
          maxLength={150}
        />
        <PageFormTextInput<EdaProjectCreate>
          name="description"
          label={t('Description')}
          placeholder={t('Enter description')}
          maxLength={150}
        />
        <PageFormSelectOrganization<EdaProjectCreate> name="organization_id" isRequired />
        <PageFormTextInput
          name="type"
          aria-disabled={true}
          isDisabled={true}
          label={t('Source control type')}
          placeholder={t('Git')}
          labelHelpTitle={t('Source control type')}
          labelHelp={t('There is currently only one source control available for use.')}
        />
        <PageFormTextInput<EdaProjectCreate>
          name="url"
          isRequired={true}
          label={t('Source control URL')}
          placeholder={t('Enter Source control URL')}
          labelHelpTitle={t('Source control URL')}
          labelHelp={t('HTTP[S] protocol address of a repository, such as GitHub or GitLab.')}
        />
        <PageFormTextInput<EdaProjectCreate>
          name="proxy"
          label={t('Proxy')}
          placeholder={t('Enter proxy')}
          labelHelpTitle={t('Proxy')}
          labelHelp={t('Proxy used to access HTTP or HTTPS servers.')}
        />
        <PageFormTextInput
          name="scm_branch"
          label={t('Source control branch/tag/commit')}
          placeholder={t('Enter branch/tag/commit')}
          labelHelpTitle={'Source control branch/tag/commit'}
          labelHelp={t(
            'Branch to checkout. In addition to branches, you can input tags, commit hashes, and arbitrary refs. Some commit hashes and refs may not be available unless you also provide a custom refspec.'
          )}
        />
        <PageFormTextInput
          name="scm_refspec"
          label={t('Source control refspec')}
          placeholder={t('Enter refspec')}
          labelHelpTitle={'Source control refspec'}
          labelHelp={t(
            'A refspec to fetch (passed to the Ansible git module). This parameter allows access to references via the branch field not otherwise available.'
          )}
        />
        <PageFormSelect
          name={'eda_credential_id'}
          label={t('Source control credential')}
          placeholderText={t('Select credential')}
          options={
            credentials?.results
              ? credentials.results.map((item: { name: string; id: number }) => ({
                  label: item.name,
                  value: item.id,
                }))
              : []
          }
          labelHelpTitle={t('Source control credential')}
          labelHelp={t('The token needed to utilize the source control URL.')}
        />
        <PageFormSelect
          name={'signature_validation_credential_id'}
          label={t('Content signature validation credential')}
          labelHelpTitle={t('Content signature validation credential')}
          labelHelp={t(
            'Enable content signing to verify that the content has remained secure when a project is synced. If the content has been tampered with, the job will not run.'
          )}
          placeholderText={t('Select validation credential')}
          options={
            verifyCredentials?.results
              ? verifyCredentials.results.map((item: { name: string; id: number }) => ({
                  label: item.name,
                  value: item.id,
                }))
              : []
          }
        />
      </PageFormSection>
      <PageFormSection singleColumn>
        <PageFormGroup label={t('Options')}>
          <PageFormCheckbox<EdaProjectCreate>
            label={t`Verify SSL`}
            labelHelpTitle={t('Verify SSL')}
            labelHelp={t(
              'Enabling this option verifies the SSL with HTTPS when the project is imported.'
            )}
            name="verify_ssl"
          />
        </PageFormGroup>
      </PageFormSection>
    </>
  );
}

function ProjectEditInputs() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { data: credentials } = useGet<EdaResult<EdaCredential>>(
    edaAPI`/eda-credentials/` + `?credential_type__kind=scm&page_size=300`
  );
  const { data: verifyCredentials } = useGet<EdaResult<EdaCredential>>(
    edaAPI`/eda-credentials/` + `?credential_type__kind=cryptography&page_size=300`
  );
  return (
    <>
      <PageFormSection>
        <PageFormTextInput<EdaProjectCreate>
          name="name"
          label={t('Name')}
          placeholder={t('Enter name')}
          isRequired
          maxLength={150}
        />
        <PageFormTextInput<EdaProjectCreate>
          name="description"
          label={t('Description')}
          placeholder={t('Enter description')}
          maxLength={150}
        />
        <PageFormSelectOrganization<EdaProjectCreate> name="organization_id" isRequired />
        <PageFormTextInput
          name="type"
          aria-disabled={true}
          isDisabled={true}
          label={t('Source control type')}
          labelHelpTitle={t('Source control type')}
          labelHelp={t('There is currently only one source control available for use.')}
          placeholder={t('Git')}
        />
        <PageFormTextInput<EdaProjectCreate>
          name="proxy"
          label={t('Proxy')}
          placeholder={t('Enter proxy')}
          labelHelpTitle={t('Proxy')}
          labelHelp={t('Proxy used to access HTTP or HTTPS servers.')}
        />
        <PageFormTextInput
          name="scm_branch"
          label={t('Source control branch/tag/commit')}
          placeholder={t('Enter branch/tag/commit')}
          labelHelpTitle={'Source control branch/tag/commit'}
          labelHelp={t(
            'Branch to checkout. In addition to branches, you can input tags, commit hashes, and arbitrary refs. Some commit hashes and refs may not be available unless you also provide a custom refspec.'
          )}
        />
        <PageFormTextInput
          name="scm_refspec"
          label={t('Source control refspec')}
          placeholder={t('Enter refspec')}
          labelHelpTitle={t('Source control refspec')}
          labelHelp={t(
            'A refspec to fetch (passed to the Ansible git module). This parameter allows access to references via the branch field not otherwise available.'
          )}
        />
        <PageFormSelect
          name={'eda_credential_id'}
          isRequired={false}
          label={t('Source control credential')}
          labelHelpTitle={t('Source control credential')}
          labelHelp={t('The token needed to utilize the source control URL.')}
          placeholderText={t('Select credential')}
          options={
            credentials?.results
              ? credentials.results.map((item: { name: string; id: number }) => ({
                  label: item.name,
                  value: item.id,
                }))
              : []
          }
          footer={<Link to={getPageUrl(EdaRoute.CreateCredential)}>{t('Create credential')}</Link>}
        />
        <PageFormSelect
          name={'signature_validation_credential_id'}
          isRequired={false}
          label={t('Content signature validation credential')}
          labelHelpTitle={t('Content signature validation credential')}
          labelHelp={t(
            'Enable content signing to verify that the content has remained secure when a project is synced. If the content has been tampered with, the job will not run.'
          )}
          placeholderText={t('')}
          options={
            verifyCredentials?.results
              ? verifyCredentials.results.map((item: { name: string; id: number }) => ({
                  label: item.name,
                  value: item.id,
                }))
              : []
          }
        />
      </PageFormSection>
      <PageFormSection singleColumn>
        <PageFormGroup label={t('Options')}>
          <PageFormCheckbox
            label={t`Verify SSL`}
            labelHelp={t(
              'Enabling this option verifies the SSL with HTTPS when the project is imported.'
            )}
            name="verify_ssl"
          />
        </PageFormGroup>
      </PageFormSection>
    </>
  );
}

export function CreateProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const { cache } = useSWRConfig();
  const postRequest = usePostRequest<EdaProjectCreate, EdaProject>();
  const { data: organizations } = useSWR<EdaResult<EdaOrganization>>(
    edaAPI`/organizations/?name=Default`,
    requestGet,
    swrOptions
  );
  const defaultOrganization =
    organizations && organizations?.results && organizations.results.length > 0
      ? organizations.results[0]
      : undefined;

  const onSubmit: PageFormSubmitHandler<EdaProjectCreate> = async (project) => {
    const newProject = await postRequest(edaAPI`/projects/`, project);
    (cache as unknown as { clear: () => void }).clear?.();
    pageNavigate(EdaRoute.ProjectPage, { params: { id: newProject.id } });
  };

  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Create project')}
        breadcrumbs={[
          { label: t('Projects'), to: getPageUrl(EdaRoute.Projects) },
          { label: t('Create project') },
        ]}
      />
      <EdaPageForm
        submitText={t('Create project')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{ verify_ssl: true, organization_id: defaultOrganization?.id }}
      >
        <ProjectCreateInputs />
      </EdaPageForm>
    </PageLayout>
  );
}

export function EditProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(
    edaAPI`/projects/${params.id ?? ''}/`
  );
  const canEditProject = data ? Boolean(data.actions && data.actions['PATCH']) : true;

  const { data: project } = useGet<EdaProjectRead>(edaAPI`/projects/${id.toString()}/`);

  const { cache } = useSWRConfig();
  const patchRequest = usePatchRequest<EdaProjectCreate, EdaProjectCreate>();
  const onSubmit: PageFormSubmitHandler<EdaProjectCreate> = async (project) => {
    await patchRequest(edaAPI`/projects/${id.toString()}/`, project);
    (cache as unknown as { clear: () => void }).clear?.();
    navigate(-1);
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();
  if (!project) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Projects'), to: getPageUrl(EdaRoute.Projects) },
            { label: t('Edit Project') },
          ]}
        />
      </PageLayout>
    );
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={`${t('Edit')} ${project?.name || t('Project')}`}
          breadcrumbs={[
            { label: t('Projects'), to: getPageUrl(EdaRoute.Projects) },
            { label: `${t('Edit')} ${project?.name || t('Project')}` },
          ]}
        />
        {!canEditProject ? (
          <>
            <Alert
              variant={'warning'}
              isInline
              style={{
                marginLeft: '24px',
                marginRight: '24px',
                marginTop: '24px',
                paddingLeft: '24px',
                paddingTop: '16px',
              }}
              title={t(
                'You do not have permissions to edit this project. Please contact your organization administrator if there is an issue with your access.'
              )}
            />
            <ProjectDetails />
          </>
        ) : (
          <EdaPageForm
            submitText={t('Save project')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
            defaultValue={{
              ...project,
              eda_credential_id: project?.eda_credential?.id,
              organization_id: project?.organization?.id,
            }}
          >
            <ProjectEditInputs />
          </EdaPageForm>
        )}
      </PageLayout>
    );
  }
}
