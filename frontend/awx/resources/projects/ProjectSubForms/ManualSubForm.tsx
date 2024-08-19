import { Alert } from '@patternfly/react-core';
import { Trans, useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { PageFormSelect, PageFormTextInput } from '../../../../../framework';
import { PageFormHidden } from '../../../../../framework/PageForm/Utils/PageFormHidden';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { awxAPI } from '../../../common/api/awx-utils';
import { Project } from '../../../interfaces/Project';

interface IConfigData {
  project_base_dir: string | null;
  project_local_paths?: string[];
}

export function ManualSubForm(props: { localPath?: string }) {
  const { t } = useTranslation();
  const { data: config } = useSWR<IConfigData>(awxAPI`/config/`, (url: string) =>
    fetch(url).then((r) => r.json())
  );
  const brand: string = process.env.BRAND ?? 'AWX';
  const product: string = process.env.PRODUCT ?? t('Ansible');
  const basePathHelpBlock = (
    <Trans i18nKey="basePathHelpBlock">
      <p>
        Base path used for locating playbooks. Directories found inside this path will be listed in
        the playbook directory drop-down. Together the base path and selected playbook directory
        provide the full path used to locate playbooks.
      </p>
      <br></br>
      <p>
        Change PROJECTS_ROOT when deploying {product} {brand} to change this location.
      </p>
    </Trans>
  );
  const noPlaybookDirectoriesAlert = (
    <Trans i18nKey="noPlaybookDirectoriesAlert">
      <p>
        There are no available playbook directories in {config?.project_base_dir ?? ''}. Either that
        directory is empty, or all of the contents are already assigned to other projects. Create a
        new directory there and make sure the playbook files can be read by the &quot;awx&quot;
        system user, or have {product} {brand} directly retrieve your playbooks from source control
        using the Source Control Type option above.
      </p>
    </Trans>
  );
  const projectLocalPaths = config?.project_local_paths
    ? config?.project_local_paths.map((path) => ({
        label: path,
        value: path,
      }))
    : [];
  const localPath =
    typeof props.localPath === 'string' && props.localPath.length > 0
      ? [
          {
            label: props.localPath,
            value: props.localPath,
          },
        ]
      : [];
  const options = [...projectLocalPaths, ...localPath];

  return (
    <PageFormHidden watch="scm_type" hidden={(type: string) => type !== 'manual'}>
      <PageFormSection title={t('Type Details')}>
        {options.length === 0 && (
          <PageFormSection singleColumn>
            <Alert
              title={t`WARNING: `}
              variant="warning"
              isInline
              ouiaId="project-manual-subform-alert"
            >
              {noPlaybookDirectoriesAlert}
            </Alert>
          </PageFormSection>
        )}
        <PageFormTextInput<Project>
          name="base_dir"
          label={t('Project base path')}
          placeholder={config?.project_base_dir ?? ''}
          labelHelpTitle={t('Project base path')}
          labelHelp={basePathHelpBlock}
          isReadOnly
        />
        <PageFormSelect<Project>
          isRequired
          name="local_path"
          id="project_local_path"
          label={t('Playbook directory')}
          options={options}
          placeholderText={t('Choose a playbook directory')}
          labelHelpTitle={t('Playbook directory')}
          labelHelp={t(
            'Select from the list of directories found in the project base path. Together the base path and the playbook directory provide the full path used to locate playbooks.'
          )}
        />
      </PageFormSection>
    </PageFormHidden>
  );
}
