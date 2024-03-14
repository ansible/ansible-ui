import { DescriptionListGroup, DescriptionListTerm } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  CopyCell,
  LoadingPage,
  PageDetail,
  PageDetails,
  useGetPageUrl,
} from '../../../../framework';
import { StandardPopover } from '../../../../framework/components/StandardPopover';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { LastModifiedPageDetail } from '../../../common/LastModifiedPageDetail';
import { StatusCell } from '../../../common/Status';
import { useGetItem } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaProjectRead } from '../../interfaces/EdaProject';
import { EdaRoute } from '../../main/EdaRoutes';
import { capitalizeFirstLetter } from '../../../../framework/utils/strings';

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
      <PageDetail
        label={t('SCM type')}
        helpText={t('There is currently only one SCM type available for use.')}
      >
        {project?.scm_type ? capitalizeFirstLetter(project?.scm_type) : t('Git')}
      </PageDetail>
      <PageDetail
        label={t('SCM URL')}
        helpText={t('HTTP[S] protocol address of a repository, such as GitHub or GitLab.')}
      >
        {project?.url || ''}
      </PageDetail>
      <PageDetail label={t('Credential')} helpText={t('The token needed to utilize the SCM URL.')}>
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
        label={t('Content Signature Validation Credential')}
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
      <PageDetail label={t('Source Control Branch/Tag/Commit')}>
        {project?.scm_branch || ''}
      </PageDetail>
      <PageDetail label={t('Source Control Refspec')}>{project?.scm_refspec || ''}</PageDetail>
      <PageDetail label={t('Import error')}>{project?.import_error || ''}</PageDetail>
      <PageDetail label={t('Created')}>
        {project?.created_at ? formatDateString(project.created_at) : ''}
      </PageDetail>
      <LastModifiedPageDetail value={project?.modified_at ? project.modified_at : ''} />
      {!!project?.verify_ssl && (
        <PageDetail label={t('Enabled option')}>
          <DescriptionListGroup>
            <DescriptionListTerm style={{ opacity: 0.6 }}>
              {t('Verify SSL')}
              <StandardPopover
                header={t('Verify SSL')}
                content={t('Verifies the SSL with HTTPS when the project is imported.')}
              />
            </DescriptionListTerm>
          </DescriptionListGroup>
        </PageDetail>
      )}
    </PageDetails>
  );
}
