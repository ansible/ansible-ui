/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation, Trans } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CopyCell, PageDetail, PageDetails, SinceCell, TextCell } from '../../../../../framework';
import { RouteE } from '../../../../Routes';
import { Project } from '../../../interfaces/Project';
import { ScmType } from '../../../../common/scm';
import { StatusCell } from '../../../../common/StatusCell';

export function ProjectDetails(props: { project: Project }) {
  const { t } = useTranslation();
  const { project } = props;
  const history = useNavigate();

  const playbookDirectorHelpText = t`Select from the list of directories found in the Project Base Path. Together the base path and the playbook directory provide the full path used to locate playbooks`;
  // const basePathHelpBlock = (
  //   <Trans i18nKey="playbookDirectorHelpText">
  //     <p>
  //       Base path used for locating playbooks. Directories found inside this path will be listed in
  //       the playbook directory drop-down. Together the base path and selected playbook directory
  //       provide the full path used to locate playbooks.
  //     </p>
  //     <br></br>
  //     <p>Change PROJECTS_ROOT when deploying Ansible AWX to change this location.</p>
  //   </>
  // );
  const sourceControlURLHelpBlock = (
    <Trans i18nKey="sourceControlURLHelpBlock">
      <p>Example URLs for GIT Source Control include:</p>
      <code>
        https://github.com/ansible/ansible.git git@github.com:ansible/ansible.git
        git://servername.example.com/ansible.git
      </code>
      <p>
        Note: When using SSH protocol for GitHub or Bitbucket, enter an SSH key only, do not enter a
        username (other than git). Additionally, GitHub and Bitbucket do not support password
        authentication when using SSH. GIT read only protocol (git://) does not use username or
        password information.
      </p>
    </Trans>
  );
  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{project.name}</PageDetail>
      <PageDetail label={t('Description')}>{project.description}</PageDetail>
      <PageDetail label={t('Organization')}>
        <TextCell
          text={project.summary_fields?.organization?.name}
          to={RouteE.OrganizationDetails.replace(
            ':id',
            (project.summary_fields?.organization?.id ?? '').toString()
          )}
        />
      </PageDetail>
      <PageDetail label={t('Last Job Status')}>
        <StatusCell status={project.status} />
      </PageDetail>
      <PageDetail label={t('Source Control Type')}>
        <ScmType scmType={project.scm_type} />
      </PageDetail>
      <PageDetail label={t('Source Control Revision')}>
        <CopyCell text={project.scm_revision} />
      </PageDetail>
      <PageDetail label={t('Source Control URL')} helpText={sourceControlURLHelpBlock}>
        {project.scm_url}
      </PageDetail>
      <PageDetail label={t('Cache Timeout')}>{project.scm_update_cache_timeout}</PageDetail>
      {/* TODO config provider */}
      {/* <PageDetail label={t('Project Base Path')} helpText={basePathHelpBlock} >{config.project_base_dir}</PageDetail> */}
      <PageDetail label={t('Playbook Directory')} helpText={playbookDirectorHelpText}>
        {project.local_path}
      </PageDetail>
      <PageDetail label={t('Created')}>
        <SinceCell
          value={project.created}
          author={project.summary_fields?.created_by?.username}
          onClick={() =>
            history(
              RouteE.UserDetails.replace(
                ':id',
                (project.summary_fields?.created_by?.id ?? 0).toString()
              )
            )
          }
        />
      </PageDetail>
      <PageDetail label={t('Last modified')}>
        <SinceCell
          value={project.modified}
          author={project.summary_fields?.modified_by?.username}
          onClick={() =>
            history(
              RouteE.UserDetails.replace(
                ':id',
                (project.summary_fields?.modified_by?.id ?? 0).toString()
              )
            )
          }
        />
      </PageDetail>
    </PageDetails>
  );
}
