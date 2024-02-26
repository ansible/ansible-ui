import { DescriptionListGroup, DescriptionListTerm } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  CopyCell,
  LoadingPage,
  PageDetail,
  PageDetails,
  TextCell,
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
        <TextCell text={'Git'} />
      </PageDetail>
      <PageDetail
        label={t('SCM URL')}
        helpText={t('HTTP[S] protocol address of a repository, such as GitHub or GitLab.')}
      >
        {project?.url || ''}
      </PageDetail>
      <PageDetail label={t('Credential')} helpText={t('The token needed to utilize the SCM URL.')}>
        {project && project.credential ? (
          <Link
            to={getPageUrl(EdaRoute.CredentialPage, { params: { id: project?.credential?.id } })}
          >
            {project?.credential?.name}
          </Link>
        ) : (
          project?.credential?.name || ''
        )}
      </PageDetail>
      <PageDetail label={t('Git hash')}>
        <CopyCell text={project?.git_hash ? project.git_hash : ''} />
      </PageDetail>
      <PageDetail label={t('Status')}>
        <StatusCell status={project?.import_state || ''} />
      </PageDetail>
      <PageDetail label={t('Import error')}>{project?.import_error || ''}</PageDetail>
      <PageDetail label={t('Created')}>
        {project?.created_at ? formatDateString(project.created_at) : ''}
      </PageDetail>
      <LastModifiedPageDetail
        value={project?.modified_at ? formatDateString(project.modified_at) : ''}
      />
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
