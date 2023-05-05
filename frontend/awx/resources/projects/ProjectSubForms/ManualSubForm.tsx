import { Trans, useTranslation } from 'react-i18next';
import { PageFormHidden } from '../../../../../framework/PageForm/Utils/PageFormHidden';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { Alert } from '@patternfly/react-core';
import { PageFormSelectOption, PageFormTextInput } from '../../../../../framework';
import useSWR from 'swr';
import { ProjectFields } from '../ProjectPage/ProjectForm';

interface IConfigData {
  project_base_dir: string | null;
  project_local_paths?: string[];
}

export function ManualSubForm() {
  const { t } = useTranslation();
  const { data: config } = useSWR<IConfigData>(`/api/v2/config/`, (url: string) =>
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
  const options = config?.project_local_paths
    ? config?.project_local_paths.map((path) => ({
        label: path,
        value: path,
      }))
    : [];
  return (
    <PageFormHidden watch="project.scm_type" hidden={(type: string) => type !== 'manual'}>
      <PageFormSection title={t('Type Details')}>
        {options.length === 0 && (
          <PageFormSection singleColumn>
            <Alert
              title={t`WARNING: `}
              // css="grid-column: 1/-1"
              variant="warning"
              isInline
              ouiaId="project-manual-subform-alert"
            >
              {noPlaybookDirectoriesAlert}
            </Alert>
          </PageFormSection>
        )}
        <PageFormTextInput
          name="project.base_dir"
          label={t('Project Base Path')}
          placeholder={config?.project_base_dir ?? ''}
          labelHelpTitle={t('Project Base Path')}
          labelHelp={basePathHelpBlock}
          isReadOnly
        />
        <PageFormSelectOption<ProjectFields>
          isRequired
          name="project.local_path"
          id="project_local_path"
          label={t('Playbook Directory')}
          options={options}
          placeholderText={t('Choose a Playbook Directory')}
          labelHelpTitle={t('Playbook Directory')}
          labelHelp={t(
            'Select from the list of directories found in the Project Base Path. Together the base path and the playbook directory provide the full path used to locate playbooks.'
          )}
        />
      </PageFormSection>
    </PageFormHidden>
  );
}
