import { useTranslation } from 'react-i18next';
import {
  PageFormCheckbox,
  PageFormDataEditor,
  PageFormGrid,
  PageFormSwitch,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  PageTable,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
  usePageAlertToaster,
} from '../../../framework';
import { AwxRoute } from '../main/AwxRoutes';
import { PageFormSingleSelect } from '../../../framework/PageForm/Inputs/PageFormSingleSelect';
import { useOptions } from '../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../interfaces/OptionsResponse';
import { awxAPI } from './api/awx-utils';
import { postRequest } from '../../common/crud/Data';
import { useNavigate } from 'react-router-dom';
import { useGetItem } from '../../common/crud/useGet';
import { Organization } from '../interfaces/Organization';
import { ExecutionEnvironment } from '../interfaces/ExecutionEnvironment';
import { useExecutionEnvironmentsFilters } from '../administration/execution-environments/hooks/useExecutionEnvironmentsFilters';
import { useExecutionEnvironmentsColumns } from '../administration/execution-environments/hooks/useExecutionEnvironmentsColumns';
import { useAwxView } from './useAwxView';
import { useEffect, useState } from 'react';

export interface RunCommandModule {
  module_name: string;
  module_args: string;
  verbosity: string;
  limit: string;
  forks: number;
  diff_mode: boolean;
  become_enabled: boolean;
  extra_vars: string;
  execution_environment: number;
}

export interface RunCommand {}

export function AwxRunCommand() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const alertToaster = usePageAlertToaster();
  const { data: organization } = useGetItem<Organization>(awxAPI`/organizations/`);
  const [selectedEE, setSelectEE] = useState<ExecutionEnvironment[]>();

  const toolbarFilters = useExecutionEnvironmentsFilters();
  const tableColumns = useExecutionEnvironmentsColumns({ disableLinks: true });
  const defaultParams: {
    order_by: string;
    or__organization__isnull: string;
    [key: string]: string;
  } = {
    order_by: 'name',
    or__organization__isnull: 'True',
  };
  if (organization?.id) {
    defaultParams.or__organization__id = organization.id.toString();
  }
  const view = useAwxView<ExecutionEnvironment>({
    url: awxAPI`/execution_environments/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
    queryParams: defaultParams,
    defaultSelection: selectedEE ? selectedEE : [],
  });

  useEffect(() => {
    console.log(view.selectedItems)
    setSelectEE(view.selectedItems);
  },[view.selectedItems])

  const commandOptions = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/ad_hoc_commands/`)
    .data?.actions?.POST;
  const moduleNameOptions = commandOptions?.module_name?.choices?.map((choice: string[]) => ({
    label: t(choice[0]),
    value: choice[1],
  }));
  const navigate = useNavigate();

  if (!commandOptions) {
    return null;
  }

  const handleSubmit = async () => {
    const payload = {
      // credential: 1,
      // execution_environment: executionEnviroment?.id,
      // limit: 'test-101',
      // module_args: 'test',
      // verbosity: '1',
      // forks: 1,
      // diff_mode: true,
      // become_enabled: true,
      // module_name: 'shell',
      // extra_vars: '---\ntest: true',
      // job_type: 'run',
    };
    try {
      const command = await postRequest(awxAPI`/ad_hoc_commands/`, payload);
      if (command) {
        navigate(-1);
      }
    } catch (err) {
      alertToaster.addAlert({
        variant: 'danger',
        title: t('Failed to run command'),
        children: err instanceof Error && err.message,
      });
    }
  };

  const verbosityOptions = commandOptions?.verbosity?.choices?.map((choice: string[]) => ({
    label: t(choice[0]),
    value: choice[1],
  }));

  const steps: PageWizardStep[] = [
    {
      id: 'details',
      label: 'Details',
      inputs: (
        <>
          <PageFormGrid isVertical singleColumn>
            <PageFormSingleSelect<RunCommandModule>
              name="module_name"
              label={t('Module')}
              placeholder={t('Choose a module')}
              options={moduleNameOptions ?? []}
              isRequired
            />
            <PageFormTextInput<RunCommandModule>
              name="module_args"
              type="text"
              labelHelp={t('These are the modules that AWX supports running commands against.')}
              label={t('Arguments')}
            />
            <PageFormSingleSelect<RunCommandModule>
              name="verbosity"
              label={t('Verbosity')}
              placeholder={t('Choose verbosity')}
              options={verbosityOptions ?? []}
            />
            <PageFormTextInput<RunCommandModule>
              name="limit"
              type="text"
              labelHelp={
                <span>
                  The pattern used to target hosts in the inventory. Leaving the field blank, all,
                  and * will all target all hosts in the inventory. You can find more information
                  about Ansible&apos;s host patterns{' '}
                  <span>
                    <a
                      href="https://docs.ansible.com/ansible/latest/user_guide/intro_patterns.html"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      here
                    </a>
                  </span>
                </span>
              }
              label={t('Limit')}
            />
            <PageFormTextInput<RunCommandModule>
              labelHelp={
                <span>
                  The number of parallel or simultaneous processes to use while executing the
                  playbook. Inputting no value will use the default value from the ansible
                  configuration file. You can find more information{' '}
                  <span>
                    <a
                      href="https://docs.ansible.com/ansible/latest/installation_guide/intro_configuration.html#the-ansible-configuration-file"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      here
                    </a>
                  </span>
                </span>
              }
              name="forks"
              type="number"
              label={t('Forks')}
            />
            <PageFormSwitch
              name="diff_mode"
              id="diff_mode"
              label={t('Show changes')}
              labelHelp={t(
                'If enabled, show the changes made by Ansible tasks, where supported. This is equivalent to Ansible’s --diff mode.'
              )}
              additionalControls={
                <PageFormCheckbox
                  label={t('Enable privilege escalation')}
                  name="become_enabled"
                  labelHelp={t(
                    'Enables creation of a provisioning callback URL. Using the URL a host can contact AWX and request a configuration update using this job template --become option to the  ansible command'
                  )}
                />
              }
            />
            <PageFormDataEditor
              labelHelp={
                <span>
                  {t(
                    'Pass extra command line changes. There are two ansible command line parameters:'
                  )}
                  <br />
                  <code>
                    <b>-e, --extra-vars</b>
                  </code>
                  <br />
                  {t('Provide key/value pairs using either YAML or JSON.')}
                  <br />
                  JSON:
                  <br />
                  <code>
                    <b>
                      {`{`}
                      <br />
                      {`"somevar": "somevalue",`}
                      <br />
                      {`"password": "magic"`}
                      <br />
                      {`}`}
                    </b>
                  </code>
                  <br />
                  YAML:
                  <br />
                  <code>
                    <b>---</b>
                    <br />
                    <b>somevar: somevalue</b>
                    <br />
                    <b>password: magic</b>
                  </code>
                </span>
              }
              toggleLanguages={['yaml', 'json']}
              label={t('Extra Variables')}
              name="extra_vars"
            />
          </PageFormGrid>
        </>
      ),
    },
    {
      id: 'execution_environment',
      label: 'Execution Environment',
      inputs: (
        <PageTable<ExecutionEnvironment>
          toolbarFilters={toolbarFilters}
          tableColumns={tableColumns}
          errorStateTitle={t('Error loading execution environments')}
          emptyStateTitle={t('No execution environments available')}
          emptyStateDescription={t('Please create a execution environment')}
          onSelect={() => null}
          disableCardView
          disableListView
          compact
          disableBodyPadding
          isSelectMultiple={false}
          {...view}
        />
      ),
    },
  ];

  return (
    <PageLayout>
      <PageHeader
        title={t('Prompt on Launch')}
        breadcrumbs={[{ label: t('Inventories'), to: getPageUrl(AwxRoute.Inventories) }]}
      />
      <PageWizard<RunCommand>
        steps={steps}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        disableGrid={true}
      />
    </PageLayout>
  );
}

// {
//   "credential": 1,
//   "execution_environment": 7,
//   "limit": "test-101",
//   "module_args": "test",
//   "verbosity": "1",
//   "forks": 1,
//   "diff_mode": true,
//   "become_enabled": true,
//   "module_name": "shell",
//   "extra_vars": "---\ntest: true",
//   "job_type": "run"
// }

// {
//   "id": 168,
//   "type": "ad_hoc_command",
//   "url": "/api/v2/ad_hoc_commands/168/",
//   "related": {
//       "created_by": "/api/v2/users/3/",
//       "modified_by": "/api/v2/users/3/",
//       "stdout": "/api/v2/ad_hoc_commands/168/stdout/",
//       "execution_environment": "/api/v2/execution_environments/7/",
//       "inventory": "/api/v2/inventories/1/",
//       "credential": "/api/v2/credentials/1/",
//       "events": "/api/v2/ad_hoc_commands/168/events/",
//       "activity_stream": "/api/v2/ad_hoc_commands/168/activity_stream/",
//       "notifications": "/api/v2/ad_hoc_commands/168/notifications/",
//       "cancel": "/api/v2/ad_hoc_commands/168/cancel/",
//       "relaunch": "/api/v2/ad_hoc_commands/168/relaunch/"
//   },
//   "summary_fields": {
//       "inventory": {
//           "id": 1,
//           "name": "Demo Inventory",
//           "description": "",
//           "has_active_failures": false,
//           "total_hosts": 12,
//           "hosts_with_active_failures": 0,
//           "total_groups": 6,
//           "has_inventory_sources": false,
//           "total_inventory_sources": 0,
//           "inventory_sources_with_failures": 0,
//           "organization_id": 1,
//           "kind": ""
//       },
//       "execution_environment": {
//           "id": 7,
//           "name": "hello",
//           "description": "world",
//           "image": "test/image"
//       },
//       "credential": {
//           "id": 1,
//           "name": "Demo Credential",
//           "description": "",
//           "kind": "ssh",
//           "cloud": false,
//           "kubernetes": false,
//           "credential_type_id": 1
//       },
//       "created_by": {
//           "id": 3,
//           "username": "dev",
//           "first_name": "",
//           "last_name": ""
//       },
//       "modified_by": {
//           "id": 3,
//           "username": "dev",
//           "first_name": "",
//           "last_name": ""
//       },
//       "user_capabilities": {
//           "delete": true,
//           "start": true
//       }
//   },
//   "created": "2024-02-16T01:46:58.305078Z",
//   "modified": "2024-02-16T01:46:58.336359Z",
//   "name": "shell",
//   "launch_type": "manual",
//   "status": "new",
//   "execution_environment": 7,
//   "failed": false,
//   "started": null,
//   "finished": null,
//   "canceled_on": null,
//   "elapsed": 0,
//   "job_explanation": "",
//   "execution_node": "",
//   "controller_node": "",
//   "launched_by": {
//       "id": 3,
//       "name": "dev",
//       "type": "user",
//       "url": "/api/v2/users/3/"
//   },
//   "work_unit_id": null,
//   "job_type": "run",
//   "inventory": 1,
//   "limit": "test-101",
//   "credential": 1,
//   "module_name": "shell",
//   "module_args": "test",
//   "forks": 1,
//   "verbosity": 1,
//   "extra_vars": "---\ntest: true",
//   "become_enabled": true,
//   "diff_mode": true
// }
