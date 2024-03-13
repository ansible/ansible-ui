import { TextList, TextListItem, TextListItemVariants } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
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
import { StandardPopover } from '../../../framework/components/StandardPopover';
import { useGet } from '../../common/crud/useGet';
import { usePatchRequest } from '../../common/crud/usePatchRequest';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { useIsValidUrl } from '../../common/validation/useIsValidUrl';
import { EdaPageForm } from '../common/EdaPageForm';
import { edaAPI } from '../common/eda-utils';
import { EdaCredential } from '../interfaces/EdaCredential';
import { EdaProject, EdaProjectCreate, EdaProjectRead } from '../interfaces/EdaProject';
import { EdaResult } from '../interfaces/EdaResult';
import { EdaRoute } from '../main/EdaRoutes';
import { Trans } from 'react-i18next';
import { getDocsBaseUrl } from '../../awx/common/util/getDocsBaseUrl';

function ProjectCreateInputs() {
  const { t } = useTranslation();
  const { data: credentials } = useGet<EdaResult<EdaCredential>>(
    edaAPI`/eda-credentials/` + `?credential_type__kind=scm&page_size=300`
  );
  const { data: verifyCredentials } = useGet<EdaResult<EdaCredential>>(
    edaAPI`/eda-credentials/` + `?credential_type__kind=cryptography&page_size=300`
  );
  const sourceControlRefspecHelp = (
    <Trans i18nKey="sourceControlRefspecHelp">
      <span>
        A refspec to fetch (passed to the Ansible git module). This parameter allows access to
        references via the branch field not otherwise available.
        <br />
        <br />
        Note: This field assumes the remote name is &quot;origin&quot;.
        <br />
        <br />
        Examples include:
        <ul style={{ margin: '10px 0 10px 20px' }}>
          <li>
            <code>refs/*:refs/remotes/origin/*</code>
          </li>
          <li>
            <code>refs/pull/62/head:refs/remotes/origin/pull/62/head</code>
          </li>
        </ul>
        The first fetches all references. The second fetches the Github pull request number 62, in
        this example the branch needs to be &quot;pull/62/head&quot;.
        <br />
        <br />
        {t`For more information, refer to the`}{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`${getDocsBaseUrl(
            undefined
          )}/html/userguide/projects.html#manage-playbooks-using-source-control`}
        >
          {t`Documentation.`}
        </a>
      </span>
    </Trans>
  );

  const isValidUrl = useIsValidUrl();
  const getPageUrl = useGetPageUrl();
  return (
    <>
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
      <PageFormTextInput
        name="type"
        aria-disabled={true}
        isDisabled={true}
        label={t('SCM type')}
        placeholder={t('Git')}
        labelHelpTitle={t('SCM type')}
        labelHelp={t('There is currently only one SCM available for use.')}
      />
      <PageFormTextInput<EdaProjectCreate>
        name="url"
        isRequired={true}
        label={t('SCM URL')}
        placeholder={t('Enter SCM URL')}
        validate={isValidUrl}
        labelHelpTitle={t('SCM URL')}
        labelHelp={t('HTTP[S] protocol address of a repository, such as GitHub or GitLab.')}
      />
      <PageFormSelect
        name={'eda_credential_id'}
        label={t('Credential')}
        placeholderText={t('Select credential')}
        options={
          credentials?.results
            ? credentials.results.map((item: { name: string; id: number }) => ({
                label: item.name,
                value: item.id,
              }))
            : []
        }
        labelHelpTitle={t('Credential')}
        labelHelp={t('The token needed to utilize the SCM URL.')}
      />
      <PageFormSelect
        name={'signature_validation_credential_id'}
        label={t('Content Signature Validation Credential')}
        labelHelpTitle={t('Content Signature Validation Credential')}
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
      <PageFormTextInput
        name="scm_branch"
        label={t('Source Control Branch/Tag/Commit')}
        placeholder={''}
        labelHelp={t(
          'Branch to checkout. In addition to branches, you can input tags, commit hashes, and arbitrary refs. Some commit hashes and refs may not be available unless you also provide a custom refspec.'
        )}
      />
      <PageFormTextInput
        name="scm_refspec"
        label={t('Source Control Refspec')}
        placeholder={''}
        labelHelpTitle={''}
        labelHelp={sourceControlRefspecHelp}
      />
      <PageFormGroup label={t('Options')}>
        <PageFormCheckbox<EdaProjectCreate>
          label={
            <TextList>
              <TextListItem component={TextListItemVariants.li}>
                {t`Verify SSL`}
                <StandardPopover
                  header=""
                  content={t(
                    'Enabling this option verifies the SSL with HTTPS when the project is imported.'
                  )}
                />
              </TextListItem>
            </TextList>
          }
          name="verify_ssl"
        />
      </PageFormGroup>
    </>
  );
}

function ProjectEditInputs() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { data: credentials } = useGet<EdaResult<EdaCredential>>(
    edaAPI`/credentials/` + `?credential_type__kind=scm&page_size=300`
  );
  const { data: verifyCredentials } = useGet<EdaResult<EdaCredential>>(
    edaAPI`/eda-credentials/` + `?credential_type__kind=cryptography&page_size=300`
  );
  const sourceControlRefspecHelp = (
    <Trans i18nKey="sourceControlRefspecHelp">
      <span>
        A refspec to fetch (passed to the Ansible git module). This parameter allows access to
        references via the branch field not otherwise available.
        <br />
        <br />
        Note: This field assumes the remote name is &quot;origin&quot;.
        <br />
        <br />
        Examples include:
        <ul style={{ margin: '10px 0 10px 20px' }}>
          <li>
            <code>refs/*:refs/remotes/origin/*</code>
          </li>
          <li>
            <code>refs/pull/62/head:refs/remotes/origin/pull/62/head</code>
          </li>
        </ul>
        The first fetches all references. The second fetches the Github pull request number 62, in
        this example the branch needs to be &quot;pull/62/head&quot;.
        <br />
        <br />
        {t`For more information, refer to the`}{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`${getDocsBaseUrl(
            undefined
          )}/html/userguide/projects.html#manage-playbooks-using-source-control`}
        >
          {t`Documentation.`}
        </a>
      </span>
    </Trans>
  );
  return (
    <>
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
      <PageFormTextInput
        name="type"
        aria-disabled={true}
        isDisabled={true}
        label={t('SCM type')}
        labelHelpTitle={t('SCM type')}
        labelHelp={t('There is currently only one SCM available for use.')}
        placeholder={t('Git')}
      />
      <PageFormSelect
        name={'eda_credential_id'}
        isRequired={false}
        label={t('Credential')}
        labelHelpTitle={t('Credential')}
        labelHelp={t('The token needed to utilize the SCM URL.')}
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
        label={t('Content Signature Validation Credential')}
        labelHelpTitle={t('Content Signature Validation Credential')}
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
      <PageFormTextInput
        name="scm_branch"
        label={t('Source Control Branch/Tag/Commit')}
        placeholder={''}
        labelHelp={t(
          'Branch to checkout. In addition to branches, you can input tags, commit hashes, and arbitrary refs. Some commit hashes and refs may not be available unless you also provide a custom refspec.'
        )}
      />
      <PageFormTextInput
        name="scm_refspec"
        label={t('Source Control Refspec')}
        placeholder={''}
        labelHelpTitle={''}
        labelHelp={sourceControlRefspecHelp}
      />
      <PageFormGroup label={t('Options')}>
        <PageFormCheckbox
          label={
            <TextList>
              <TextListItem component={TextListItemVariants.li}>
                {t`Verify SSL`}
                <StandardPopover
                  header=""
                  content={t(
                    'Enabling this option verifies the SSL with HTTPS when the project is imported.'
                  )}
                />
              </TextListItem>
            </TextList>
          }
          name="verify_ssl"
        />
      </PageFormGroup>
    </>
  );
}

export function CreateProject() {
  const defaultValues: Partial<EdaProject> = {
    verify_ssl: true,
  };
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const { cache } = useSWRConfig();
  const postRequest = usePostRequest<EdaProjectCreate, EdaProject>();

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
        title={t('Create Project')}
        breadcrumbs={[
          { label: t('Projects'), to: getPageUrl(EdaRoute.Projects) },
          { label: t('Create Project') },
        ]}
      />
      <EdaPageForm
        submitText={t('Create project')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{ ...defaultValues }}
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
        <EdaPageForm
          submitText={t('Save project')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
          defaultValue={{ ...project, eda_credential_id: project?.eda_credential?.id }}
        >
          <ProjectEditInputs />
        </EdaPageForm>
      </PageLayout>
    );
  }
}
