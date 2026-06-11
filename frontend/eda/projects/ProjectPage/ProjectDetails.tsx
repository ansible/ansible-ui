import {
  CopyCell,
  DateTimeCell,
  LoadingPage,
  PageDetail,
  PageDetails,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { StandardPopover } from '@ansible/ansible-ui-framework/components/StandardPopover';
import { capitalizeFirstLetter } from '@ansible/ansible-ui-framework/utils/strings';
import { LastModifiedPageDetail } from '@ansible/common-ui/LastModifiedPageDetail';
import { StatusCell } from '@ansible/common-ui/Status';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import {
  Content,
  ContentVariants,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { edaAPI } from '../../common/eda-utils';
import { EdaProjectRead } from '../../interfaces/EdaProject';
import { EdaRoute } from '../../main/EdaRoutes';

export function ProjectDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const { data: project } = useGetItem<EdaProjectRead>(edaAPI`/projects/`, params.id);
  if (!project) {
    return <LoadingPage />;
  }
  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{project?.name || ''}</PageDetail>
      <PageDetail label={t('Description')}>{project?.description || ''}</PageDetail>
      <PageDetail label={t('Organization')}>
        {project && project.organization ? (
          <Link
            to={getPageUrl(EdaRoute.OrganizationPage, {
              params: { id: project?.organization?.id },
            })}
          >
            {project?.organization?.name}
          </Link>
        ) : (
          project?.organization?.name || ''
        )}
      </PageDetail>
      <PageDetail
        label={t('Source control type')}
        helpText={t('There is currently only one source control type available for use.')}
      >
        {project?.scm_type ? capitalizeFirstLetter(project?.scm_type) : t('Git')}
      </PageDetail>
      <PageDetail
        label={t('Source control URL')}
        helpText={t('HTTP[S] protocol address of a repository, such as GitHub or GitLab.')}
      >
        {project?.url || ''}
      </PageDetail>
      <PageDetail label={t('Proxy')} helpText={t('Proxy used to access HTTP or HTTPS servers.')}>
        {project?.proxy || ''}
      </PageDetail>
      <PageDetail
        label={t('Source control credential')}
        helpText={t('The token needed to utilize the source control URL.')}
      >
        {project && project.eda_credential ? (
          <Link
            to={getPageUrl(EdaRoute.CredentialPage, {
              params: { id: project?.eda_credential?.id },
            })}
          >
            {project?.eda_credential?.name}
          </Link>
        ) : (
          project?.eda_credential?.name || ''
        )}
      </PageDetail>
      <PageDetail
        label={t('Content signature validation credential')}
        helpText={t(
          'Enable content signing to verify that the content has remained secure when a project is synced. If the content has been tampered with, the job will not run.'
        )}
      >
        {project && project.signature_validation_credential ? (
          <Link
            to={getPageUrl(EdaRoute.CredentialPage, {
              params: { id: project?.signature_validation_credential?.id },
            })}
          >
            {project?.signature_validation_credential?.name}
          </Link>
        ) : (
          project?.signature_validation_credential?.name || ''
        )}
      </PageDetail>
      <PageDetail label={t('Git hash')}>
        <CopyCell text={project?.git_hash ? project.git_hash : ''} />
      </PageDetail>
      <PageDetail label={t('Status')}>
        <StatusCell status={project?.import_state || ''} />
      </PageDetail>
      <PageDetail label={t('Source control branch/tag/commit')}>
        {project?.scm_branch || ''}
      </PageDetail>
      <PageDetail
        label={t('Cache timeout')}
        helpText={t`Time in seconds to consider a project
  to be current. During job runs and callbacks the task
  system will evaluate the timestamp of the latest project
  update. If it is older than cache timeout, it is not
  considered current, and a new project update will be
  performed.`}
      >
        {`${project.scm_update_cache_timeout} seconds`}
      </PageDetail>
      <PageDetail label={t('Source control refspec')}>{project?.scm_refspec || ''}</PageDetail>
      <PageDetail label={t('Import error')}>{project?.import_error || ''}</PageDetail>
      <PageDetail label={t('Last sync')}>
        <DateTimeCell value={project.last_synced_at} />
      </PageDetail>
      <PageDetail label={t('Created')}>
        <DateTimeCell value={project.created_at} author={project?.created_by?.username} />
      </PageDetail>
      <LastModifiedPageDetail
        value={project?.modified_at ? project.modified_at : ''}
        author={project?.modified_by?.username}
      />
      <PageDetail label={t('Enabled option')}>
        <Content component={ContentVariants.ul}>
          {!!project?.verify_ssl && (
            <Content component={ContentVariants.li}>
              <DescriptionListGroup>
                <DescriptionListTerm style={{ opacity: 0.6 }}>
                  {t('Verify SSL')}
                  <StandardPopover
                    header={t('Verify SSL')}
                    content={t('Verifies the SSL with HTTPS when the project is imported.')}
                  />
                </DescriptionListTerm>
              </DescriptionListGroup>
            </Content>
          )}
          {!!project.update_revision_on_launch && (
            <Content component={ContentVariants.li}>
              <DescriptionListGroup>
                <DescriptionListTerm style={{ opacity: 0.6 }}>
                  {t('Update revision on launch')}
                  <StandardPopover
                    header={t('Update revision on launch')}
                    content={t(
                      'Prior to starting or restarting a rulebook activation this project will be updated.'
                    )}
                  />
                </DescriptionListTerm>
              </DescriptionListGroup>
            </Content>
          )}
        </Content>
      </PageDetail>
    </PageDetails>
  );
}
