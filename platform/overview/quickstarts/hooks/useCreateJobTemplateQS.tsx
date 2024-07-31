import { QuickStart } from '@patternfly/quickstarts';
import { useTranslation } from 'react-i18next';

export function useCreateJobTemplateQS() {
  const { t } = useTranslation();

  const qsData: QuickStart = {
    metadata: {
      name: 'creating-a-job-template',
      instructional: true,
    },
    spec: {
      displayName: t('Creating and running a job or workflow template'),
      durationMinutes: 10,
      type: {
        text: t('Automation Execution'),
        color: 'grey',
      },
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJ1dWlkLWFlOWM1NjUwLTFhYTAtNDBhYi04M2EyLTEzODgxMTEyNDE4OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMzggMzgiPjxkZWZzPjxzdHlsZT4udXVpZC0zNzU1MDdkZS1lMmQ3LTQzNmQtYjQ3ZC1mYmNkZWI4MTIzNmZ7ZmlsbDojZTAwO30udXVpZC1lYjcyNzUxYy1mZTVlLTQ1NGMtOGQwZi02MWE2ZGM0MGUyYmF7ZmlsbDojZmZmO30udXVpZC1iZDJiZTdjNS04NmY2LTRkMWUtOGIxMi01NGZiM2Y5MDE4YTB7ZmlsbDojZTBlMGUwO308L3N0eWxlPjwvZGVmcz48cGF0aCBjbGFzcz0idXVpZC1lYjcyNzUxYy1mZTVlLTQ1NGMtOGQwZi02MWE2ZGM0MGUyYmEiIGQ9Im0yOCwxSDEwQzUuMDI5NDQsMSwxLDUuMDI5NDQsMSwxMHYxOGMwLDQuOTcwNTcsNC4wMjk0NCw5LDksOWgxOGM0Ljk3MDU2LDAsOS00LjAyOTQzLDktOVYxMGMwLTQuOTcwNTYtNC4wMjk0NC05LTktOWgwWiIvPjxwYXRoIGNsYXNzPSJ1dWlkLWJkMmJlN2M1LTg2ZjYtNGQxZS04YjEyLTU0ZmIzZjkwMThhMCIgZD0ibTI4LDIuMjVjNC4yNzMzMiwwLDcuNzUsMy40NzY2NCw3Ljc1LDcuNzV2MThjMCw0LjI3MzM2LTMuNDc2NjgsNy43NS03Ljc1LDcuNzVIMTBjLTQuMjczMzIsMC03Ljc1LTMuNDc2NjQtNy43NS03Ljc1VjEwYzAtNC4yNzMzNiwzLjQ3NjY4LTcuNzUsNy43NS03Ljc1aDE4bTAtMS4yNUgxMEM1LjAyOTQyLDEsMSw1LjAyOTQzLDEsMTB2MThjMCw0Ljk3MDU3LDQuMDI5NDIsOSw5LDloMThjNC45NzA1OCwwLDktNC4wMjk0Myw5LTlWMTBjMC00Ljk3MDU3LTQuMDI5NDItOS05LTloMFoiLz48cGF0aCBjbGFzcz0idXVpZC0zNzU1MDdkZS1lMmQ3LTQzNmQtYjQ3ZC1mYmNkZWI4MTIzNmYiIGQ9Im0yMywxMi4zNzVoLS43NzEyNGMtLjA4NTY5LS40NDMzLS4yNTczMi0uODU2MTQtLjUwMTk1LTEuMjE3MWwuNTQzNy0uNTQzNjRjLjI0MzE2LS4yNDQxNC4yNDMxNi0uNjQwNjIsMC0uODg0NzctLjI0NDE0LS4yNDQxNC0uNjQwNjItLjI0NDE0LS44ODQ3NywwbC0uNTQzNy41NDM2NGMtLjM2MDg0LS4yNDQ1Ny0uNzczNjgtLjQxNjItMS4yMTcwNC0uNTAxODl2LS43NzEyNGMwLS4zNDQ3My0uMjgwMjctLjYyNS0uNjI1LS42MjVzLS42MjUuMjgwMjctLjYyNS42MjV2Ljc3MTI0Yy0uNDQzMzYuMDg1NjktLjg1NjIuMjU3MzItMS4yMTcwNC41MDE4OWwtLjU0MzctLjU0MzY0Yy0uMjQ0MTQtLjI0NDE0LS42NDA2Mi0uMjQ0MTQtLjg4NDc3LDAtLjI0MzE2LjI0NDE0LS4yNDMxNi42NDA2MiwwLC44ODQ3N2wuNTQzNy41NDM2NGMtLjI0NDYzLjM2MDk2LS40MTYyNi43NzM4LS41MDE5NSwxLjIxNzFoLS43NzEyNGMtLjM0NDczLDAtLjYyNS4yODAyNy0uNjI1LjYyNXMuMjgwMjcuNjI1LjYyNS42MjVoLjc3MTI0Yy4wODU2OS40NDMzLjI1NzMyLjg1NjE0LjUwMTk1LDEuMjE3MWwtLjU0MzcuNTQzNjRjLS4yNDMxNi4yNDQxNC0uMjQzMTYuNjQwNjIsMCwuODg0NzcuMTIyMDcuMTIyMDcuMjgyMjMuMTgyNjIuNDQyMzguMTgyNjJzLjMyMDMxLS4wNjA1NS40NDIzOC0uMTgyNjJsLjU0MzctLjU0MzY0Yy4zNjA4NC4yNDQ1Ny43NzM2OC40MTYyLDEuMjE3MDQuNTAxODl2Ljc3MTI0YzAsLjM0NDczLjI4MDI3LjYyNS42MjUuNjI1cy42MjUtLjI4MDI3LjYyNS0uNjI1di0uNzcxMjRjLjQ0MzM2LS4wODU2OS44NTYyLS4yNTczMiwxLjIxNzA0LS41MDE4OWwuNTQzNy41NDM2NGMuMTIyMDcuMTIyMDcuMjgyMjMuMTgyNjIuNDQyMzguMTgyNjJzLjMyMDMxLS4wNjA1NS40NDIzOC0uMTgyNjJjLjI0MzE2LS4yNDQxNC4yNDMxNi0uNjQwNjIsMC0uODg0NzdsLS41NDM3LS41NDM2NGMuMjQ0NjMtLjM2MDk2LjQxNjI2LS43NzM4LjUwMTk1LTEuMjE3MWguNzcxMjRjLjM0NDczLDAsLjYyNS0uMjgwMjcuNjI1LS42MjVzLS4yODAyNy0uNjI1LS42MjUtLjYyNVptLTQsMi42NjY5OWMtMS4xMjU5OCwwLTIuMDQxOTktLjkxNjAyLTIuMDQxOTktMi4wNDE5OXMuOTE2MDItMi4wNDE5OSwyLjA0MTk5LTIuMDQxOTksMi4wNDE5OS45MTYwMiwyLjA0MTk5LDIuMDQxOTktLjkxNjAyLDIuMDQxOTktMi4wNDE5OSwyLjA0MTk5WiIvPjxwYXRoIGNsYXNzPSJ1dWlkLTM3NTUwN2RlLWUyZDctNDM2ZC1iNDdkLWZiY2RlYjgxMjM2ZiIgZD0ibTI4LDI4LjYyNWgtNGMtLjM0NDczLDAtLjYyNS0uMjgwMjctLjYyNS0uNjI1di00YzAtLjM0NDczLjI4MDI3LS42MjUuNjI1LS42MjVoNGMuMzQ0NzMsMCwuNjI1LjI4MDI3LjYyNS42MjV2NGMwLC4zNDQ3My0uMjgwMjcuNjI1LS42MjUuNjI1Wm0tMy4zNzUtMS4yNWgyLjc1di0yLjc1aC0yLjc1djIuNzVaIi8+PHBhdGggY2xhc3M9InV1aWQtMzc1NTA3ZGUtZTJkNy00MzZkLWI0N2QtZmJjZGViODEyMzZmIiBkPSJtMjEsMjguNjI1aC00Yy0uMzQ0NzMsMC0uNjI1LS4yODAyNy0uNjI1LS42MjV2LTRjMC0uMzQ0NzMuMjgwMjctLjYyNS42MjUtLjYyNWg0Yy4zNDQ3MywwLC42MjUuMjgwMjcuNjI1LjYyNXY0YzAsLjM0NDczLS4yODAyNy42MjUtLjYyNS42MjVabS0zLjM3NS0xLjI1aDIuNzV2LTIuNzVoLTIuNzV2Mi43NVoiLz48cGF0aCBjbGFzcz0idXVpZC0zNzU1MDdkZS1lMmQ3LTQzNmQtYjQ3ZC1mYmNkZWI4MTIzNmYiIGQ9Im0xNCwyOC42MjVoLTRjLS4zNDQ3MywwLS42MjUtLjI4MDI3LS42MjUtLjYyNXYtNGMwLS4zNDQ3My4yODAyNy0uNjI1LjYyNS0uNjI1aDRjLjM0NDczLDAsLjYyNS4yODAyNy42MjUuNjI1djRjMCwuMzQ0NzMtLjI4MDI3LjYyNS0uNjI1LjYyNVptLTMuMzc1LTEuMjVoMi43NXYtMi43NWgtMi43NXYyLjc1WiIvPjxwYXRoIGQ9Im0yNiwyMC4zNzVoLTYuMzc1di0xLjM3NWMwLS4zNDQ3My0uMjgwMjctLjYyNS0uNjI1LS42MjVzLS42MjUuMjgwMjctLjYyNS42MjV2MS4zNzVoLTYuMzc1Yy0uMzQ0NzMsMC0uNjI1LjI4MDI3LS42MjUuNjI1cy4yODAyNy42MjUuNjI1LjYyNWgxNGMuMzQ0NzMsMCwuNjI1LS4yODAyNy42MjUtLjYyNXMtLjI4MDI3LS42MjUtLjYyNS0uNjI1WiIvPjwvc3ZnPg==',
      prerequisites: [t('You have a valid Ansible Automation Platform subscription.')],
      description: t(
        'Create and run a job or workflow template.\n\nPersona: Platform administrator, Automation developer'
      ),
      introduction: t(
        'A job template combines an Ansible playbook from a project and the settings required to launch it. \nJob templates are used for executing the same job many times and encouraging the reuse of Ansible playbook content. \nFor more information, see [Creating a job template](https://docs.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.5/html-single/using_automation_execution/index#controller-create-job-template).'
      ),
      tasks: [
        {
          title: t('Get started with job templates'),
          description: t(
            '## To view a demo job template:\n\n  1. From the navigation panel, select **Automation Execution** > **Templates**.\n\n  2. Click **Demo Job Template**. \n  As part of the initial setup, a **Demo Job Template** is created to help you get started, but you can also create your own.'
          ),
        },
        {
          title: t('Create a job template'),
          description: t(
            '##To create a job template:\n\n  1. From the navigation panel, select **Automation Execution** > **Templates**.\n  \n  2. On the **Templates** list view, click **Create template → Create job template**.\n\n  3. Complete the following mandatory fields:\n      [If a field has the **Prompt on launch** checkbox selected, launching the job prompts you for the value for that field when launching. Most prompted values override any values set in the job template.]{{admonition tip}}\n   \n      - **Name**: Give a unique name for your job template. \n      - **Job Type**: Select a job template type.\n      - **Inventory**: Select the inventory that the job template runs against.\n      A system administrator must grant you or your team permissions to be able to use certain inventories in a job template.\n      - **Project**: Select the project containing your Ansible playbooks.\n      - **Playbook**: Specify the playbook that the job template executes.\n      \n      Optional: Complete the following fields:\n\n          - **Description**: Enter a description as appropriate.\n          - **ExecutionEnvironment**: Select the container image to use for this job.\n          - **Credentials**: Select credentials for accessing the nodes this job runs against.\n          - **Labels**: Optional labels that describe this job template, such as `dev` or `test`.\n          - **Forks**: The number of parallel or simultaneous processes to use while executing the playbook.\n          - **Limit**: A host pattern to further constrain the list of hosts managed or affected by the playbook.\n          - **Verbosity**: Control the level of output Ansible produces as the playbook executes.\n          - **Job slicing**: Specify the number of slices you want this job template to run.\n          - **Timeout**: This enables you to specify the length of time (in seconds) that the job might run before it is canceled.\n          - **Show changes**: If enabled, show the changes made by Ansible tasks, where supported.\n          - **Instance groups**: Select the instance groups for this job template to run on.\n          - **Job tags**: Tags are useful when you have a large playbook, and you want to run a specific part of a play or task.\n          - **Skip tags**: Skip tags are useful when you have a large playbook, and you want to skip specific parts of a play or task.\n          - **Extra variables**: Apply optional extra variables to be applied to the job template.\n    <p>&nbsp;</p>\n  4. Optional: Configure the following options:\n\n      - **Privilege escalation**: If checked, you enable this playbook to run as an administrator. \n      This is the equivalent of passing the `--become` option to the `ansible-playbook` command.\n      - **Provisioning callback**:  If checked, you enable a host to call back to the automation controller through the REST API and start the launch of a job from this job template.\n      - **Enable webhook**: If checked, you turn on the ability to interface with a predefined SCM system web service that is used to launch a job template.\n      - **Concurrent jobs**: If checked, you are allowing jobs in the queue to run simultaneously if not dependent on one another. Check this box if you want to run job slices simultaneously.\n      - **Enable fact storage**: If checked, automation controller stores gathered facts for all hosts in an inventory related to the job running.\n      - **Prevent instance group fallback**: Check this option to allow only the instance groups listed in the Instance Groups field to execute the job. \n      If clear, all available instances in the execution pool are used based on the hierarchy.\n  5. Click **Create job template**.'
          ),
          review: {
            instructions: t(
              '#### To verify that you have created a job template:\nIs the job template listed on the **Templates** list view?'
            ),
            failedTaskHelp: t(
              'This task is not verified yet. Try the task again. For more information about job templates, see the [Job templates](https://docs.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.5/html-single/using_automation_execution/index#controller-job-templates).'
            ),
          },
          summary: {
            success: t('You have viewed the details of your job template!'),
            failed: t('Try the steps again.'),
          },
        },
        {
          title: t('Create a worklfow job template'),
          description: t(
            "##To create a workflow job template:\n\n  1. From the navigation panel, select **Automation Execution** > **Templates**.\n  \n  2. On the **Templates** list view, click **Create template → Create workflow job template**.\n\n  3. Complete the following fields:\n      [If a field has the **Prompt on launch** checkbox selected, launching the job prompts you for the value for that field when launching. Most prompted values override any values set in the job template.]{{admonition tip}}\n   \n      - **Name**: Give a unique name for your job template. \n      - **Description**: Optionally, enter an arbitrary description as appropriate.\n      - **Organization**: Choose the organization to use with this template from the organizations available to the logged in user.\n      - **Inventory**: Optionally, select the inventory to use with this template from the inventories available to the logged in user.\n      - **Limit**: Give a host pattern to further constrain the list of hosts that will be managed or affected by the playbook. \n      Many patterns are allowed. Refer to Ansible documentation for more information and examples on patterns.\n      - **Source control branch**: Select a branch for the workflow. This branch is applied to all workflow job template nodes that prompt for a branch.\n      - **Labels**: Optional labels that describe this job template, such as 'dev' or 'test'. Use labels to group and filter job templates and completed jobs.\n      - **Job tags**: Tags are useful when you have a large playbook, and you want to run a specific part of a play or task. \n      Use commas to separate tags.\n      - **Skip Tags**: Skip tags are useful when you have a large playbook, and you want to skip specific parts of a play or task. Use commas to separate multiple tags.\n      - **Extra Variables**: Optional extra variables to be applied to the job template.\n  \n  4. Specify the following **Options** for launching this template, if necessary:\n      - Check **Enable webhook** to turn on the ability to interface with a predefined source code management (SCM) system web service that is used to launch a workflow job template. \n      GitHub and GitLab are the supported SCM systems.\n         - If you enable webhooks, other fields display, prompting for additional information:\n            - **Webhook service**: Select which service to listen for webhooks from.\n            - **Webhook URL**: Optionally, select a webhook service.\n            - **Webhook key**: Generated shared secret to be used by the webhook service to sign payloads sent to automation controller. \n            You must configure this in the settings on the webhook service so that webhooks from this service are accepted in automation controller.\n      - Check **Enable concurrent jobs** to allow simultaneous runs of this workflow.\n  \n  5. Click **Create workflow job** template."
          ),
          review: {
            instructions: t(
              '#### To verify that you have created a worfklow job template:\nIs the workflow job template listed on the **Templates** list view?'
            ),
            failedTaskHelp: t(
              'This task is not verified yet. Try the task again. For more information about workflow job templates, see [Workflow job templates](https://docs.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.5/html-single/using_automation_execution/index#controller-workflow-job-templates).'
            ),
          },
          summary: {
            success: t('You have viewed the details of your job template!'),
            failed: t('Try the steps again.'),
          },
        },
        {
          title: t('Launch a job template'),
          description: t(
            '##To launch a job template:\n\nA benefit of automation controller is the push-button deployment of Ansible playbooks. \nYou can configure a template to store all the parameters that you would normally pass to the Ansible playbook on the command line. \nIn addition to the playbooks, the template passes the inventory, credentials, extra variables, and all options and settings that you can specify on the command line.\n\nEasier deployments drive consistency, by running your playbooks the same way each time, and allowing you to delegate responsibilities.\n\nRun a job template by using one of these methods:\n\n- From the navigation panel, select **Automation Execution** > **Templates** > **Launch template**.\n- In the job template **Details** view of the job template you want to launch, click **Launch template**.\n\nFor more information, see [Launching a job template](https://docs.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.5/html-single/using_automation_execution/index#controller-launch-job-template).'
          ),
        },
      ],
      conclusion: t(
        'You successfully completed the creating and running a job or workflow template steps! If you want to learn how to create a rulebook activation, take the **Creating a rulebook activation** quick start.'
      ),
      nextQuickStart: ['creating-a-rulebook-activation'],
    },
  };
  return qsData;
}
