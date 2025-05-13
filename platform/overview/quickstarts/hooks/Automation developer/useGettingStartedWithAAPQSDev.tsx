import { QuickStart } from '@patternfly/quickstarts';
import { useTranslation } from 'react-i18next';

export function useGettingStartedWithAAPQSDeveloper() {
  const { t } = useTranslation();

  const qsData: QuickStart = {
    metadata: {
      name: 'getting started with Ansible Automation Platformr',
      instructional: true,
    },
    spec: {
      displayName: t('Getting started with Ansible Automation Platform - Automation Developer'),
      durationMinutes: 15,
      type: {
        text: t('Automation developer'),
        color: 'grey',
      },
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJ1dWlkLWFlMzcyZWFiLWE3YjktNDU4ZC04MzkwLWI5OWZiNzhmYzFlNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMzggMzgiPjxwYXRoIGQ9Im0yOCwxSDEwQzUuMDI5NDIsMSwxLDUuMDI5NDIsMSwxMHYxOGMwLDQuOTcwNTgsNC4wMjk0Miw5LDksOWgxOGM0Ljk3MDU4LDAsOS00LjAyOTQyLDktOVYxMGMwLTQuOTcwNTgtNC4wMjk0Mi05LTktOVptNy43NSwyN2MwLDQuMjczMzgtMy40NzY2OCw3Ljc1LTcuNzUsNy43NUgxMGMtNC4yNzMzMiwwLTcuNzUtMy40NzY2Mi03Ljc1LTcuNzVWMTBjMC00LjI3MzM4LDMuNDc2NjgtNy43NSw3Ljc1LTcuNzVoMThjNC4yNzMzMiwwLDcuNzUsMy40NzY2Miw3Ljc1LDcuNzV2MThaIi8+PHBhdGggZD0ibTE0LDEwLjQ3NTU5aC0zYy0uMzQ0NzMsMC0uNjI1LjI4MDI3LS42MjUuNjI1djNjMCwuMzQ0NzMuMjgwMjcuNjI1LjYyNS42MjVoM2MuMzQ0NzMsMCwuNjI1LS4yODAyNy42MjUtLjYyNXYtM2MwLS4zNDQ3My0uMjgwMjctLjYyNS0uNjI1LS42MjVabS0uNjI1LDNoLTEuNzV2LTEuNzVoMS43NXYxLjc1WiIvPjxwYXRoIGQ9Im0yNywxMC40NzU1OWgtM2MtLjM0NDczLDAtLjYyNS4yODAyNy0uNjI1LjYyNXYzYzAsLjM0NDczLjI4MDI3LjYyNS42MjUuNjI1aDNjLjM0NDczLDAsLjYyNS0uMjgwMjcuNjI1LS42MjV2LTNjMC0uMzQ0NzMtLjI4MDI3LS42MjUtLjYyNS0uNjI1Wm0tLjYyNSwzaC0xLjc1di0xLjc1aDEuNzV2MS43NVoiLz48cGF0aCBkPSJtMjcsMjMuNDc1NTloLTNjLS4zNDQ3MywwLS42MjUuMjgwMjctLjYyNS42MjV2M2MwLC4zNDQ3My4yODAyNy42MjUuNjI1LjYyNWgzYy4zNDQ3MywwLC42MjUtLjI4MDI3LjYyNS0uNjI1di0zYzAtLjM0NDczLS4yODAyNy0uNjI1LS42MjUtLjYyNVptLS42MjUsM2gtMS43NXYtMS43NWgxLjc1djEuNzVaIi8+PHBhdGggZD0ibTE0LDIzLjQ3NTU5aC0zYy0uMzQ0NzMsMC0uNjI1LjI4MDI3LS42MjUuNjI1djNjMCwuMzQ0NzMuMjgwMjcuNjI1LjYyNS42MjVoM2MuMzQ0NzMsMCwuNjI1LS4yODAyNy42MjUtLjYyNXYtM2MwLS4zNDQ3My0uMjgwMjctLjYyNS0uNjI1LS42MjVabS0uNjI1LDNoLTEuNzV2LTEuNzVoMS43NXYxLjc1WiIvPjxwYXRoIGQ9Im0yMS4xNTUyNywxMC43NDcwN2MtMS40MDQzLS4zNTkzOC0yLjkwNjI1LS4zNTkzOC00LjMxMDU1LDAtLjMzMzk4LjA4NTk0LS41MzYxMy40MjY3Ni0uNDUwMi43NjA3NC4wODQ5Ni4zMzMwMS40MjI4NS41MzkwNi43NjA3NC40NTAyLDEuMjAzMTItLjMwODU5LDIuNDg2MzMtLjMwODU5LDMuNjg5NDUsMCwuMDUxNzYuMDEzNjcuMTA0NDkuMDE5NTMuMTU1MjcuMDE5NTMuMjc5MywwLC41MzMyLS4xODc1LjYwNTQ3LS40Njk3My4wODU5NC0uMzMzOTgtLjExNjIxLS42NzQ4LS40NTAyLS43NjA3NFoiLz48cGF0aCBkPSJtMTEuNDA3MjMsMTYuNDk1MTJjLS4zMzY5MS0uMDg5ODQtLjY3NDguMTE3MTktLjc2MDc0LjQ1MDItLjE3OTY5LjcwMTE3LS4yNzE0OCwxLjQyNjc2LS4yNzE0OCwyLjE1NTI3LDAsLjcyNzU0LjA5MTgsMS40NTMxMi4yNzE0OCwyLjE1NTI3LjA3MjI3LjI4MjIzLjMyNjE3LjQ2OTczLjYwNTQ3LjQ2OTczLjA1MDc4LDAsLjEwMzUyLS4wMDU4Ni4xNTUyNy0uMDE5NTMuMzMzOTgtLjA4NTk0LjUzNjEzLS40MjY3Ni40NTAyLS43NjA3NC0uMTU0My0uNjAxNTYtLjIzMjQyLTEuMjIxNjgtLjIzMjQyLTEuODQ0NzMsMC0uNjI0MDIuMDc4MTItMS4yNDQxNC4yMzI0Mi0xLjg0NDczLjA4NTk0LS4zMzM5OC0uMTE1MjMtLjY3NDgtLjQ1MDItLjc2MDc0WiIvPjxwYXRoIGQ9Im0yMC44NDQ3MywyNi4yNDMxNmMtMS4yMDMxMi4zMDg1OS0yLjQ4NjMzLjMwODU5LTMuNjg5NDUsMC0uMzM2OTEtLjA4Nzg5LS42NzQ4LjExNjIxLS43NjA3NC40NTAycy4xMTYyMS42NzQ4LjQ1MDIuNzYwNzRjLjcwMjE1LjE3OTY5LDEuNDI3NzMuMjcxNDgsMi4xNTUyNy4yNzE0OHMxLjQ1MzEyLS4wOTE4LDIuMTU1MjctLjI3MTQ4Yy4zMzM5OC0uMDg1OTQuNTM2MTMtLjQyNjc2LjQ1MDItLjc2MDc0LS4wODQ5Ni0uMzMzOTgtLjQyMzgzLS41MzkwNi0uNzYwNzQtLjQ1MDJaIi8+PHBhdGggZD0ibTI2LjU5Mjc3LDE2LjQ5NTEyYy0uMzM0OTYuMDg1OTQtLjUzNjEzLjQyNjc2LS40NTAyLjc2MDc0LjE1NDMuNjAwNTkuMjMyNDIsMS4yMjA3LjIzMjQyLDEuODQ0NzMsMCwuNjIzMDUtLjA3ODEyLDEuMjQzMTYtLjIzMjQyLDEuODQ0NzMtLjA4NTk0LjMzMzk4LjExNjIxLjY3NDguNDUwMi43NjA3NC4wNTE3Ni4wMTM2Ny4xMDQ0OS4wMTk1My4xNTUyNy4wMTk1My4yNzkzLDAsLjUzMzItLjE4NzUuNjA1NDctLjQ2OTczLjE3OTY5LS43MDIxNS4yNzE0OC0xLjQyNzczLjI3MTQ4LTIuMTU1MjcsMC0uNzI4NTItLjA5MTgtMS40NTQxLS4yNzE0OC0yLjE1NTI3LS4wODU5NC0uMzMzMDEtLjQyMzgzLS41NDEwMi0uNzYwNzQtLjQ1MDJaIi8+PHBhdGggZD0ibTIwLjkxMTEzLDE3LjM4NTc0YzAtMS4wNTM3MS0uODU3NDItMS45MTAxNi0xLjkxMTEzLTEuOTEwMTZzLTEuOTExMTMuODU2NDUtMS45MTExMywxLjkxMDE2YzAsLjYyNzc1LjMwODM1LDEuMTgxMDMuNzc3MjIsMS41Mjk2NmwtLjc1ODY3LDMuMDMzODFjLS4wNDY4OC4xODY1Mi0uMDA0ODguMzg0NzcuMTE0MjYuNTM2MTMuMTE4MTYuMTUxMzcuMjk5OC4yNDAyMy40OTIxOS4yNDAyM2gyLjU3MjI3Yy4xOTIzOCwwLC4zNzQwMi0uMDg4ODcuNDkyMTktLjI0MDIzLjExOTE0LS4xNTEzNy4xNjExMy0uMzQ5NjEuMTE0MjYtLjUzNjEzbC0uNzU4NjctMy4wMzM4MWMuNDY4ODctLjM0ODYzLjc3NzIyLS45MDE5Mi43NzcyMi0xLjUyOTY2Wm0tMi4zOTY0OCw0LjA4OTg0bC40ODUzNS0xLjk0MTQxLjQ4NTM1LDEuOTQxNDFoLS45NzA3Wm0uNDg1MzUtMy40Mjg3MWMtLjM2NDI2LDAtLjY2MTEzLS4yOTY4OC0uNjYxMTMtLjY2MTEzcy4yOTY4OC0uNjYwMTYuNjYxMTMtLjY2MDE2LjY2MTEzLjI5NTkuNjYxMTMuNjYwMTYtLjI5Njg4LjY2MTEzLS42NjExMy42NjExM1oiLz48L3N2Zz4=',
      prerequisites: [
        t('You have completed the Ansible Automation Platform installation.'),
        t('You have a valid Ansible Automation Platform subscription.'),
        t(
          'You have created a [project folder](https://docs.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.5/html-single/getting_started_with_playbooks/index#proc-starting-automation) on your filesystem.'
        ),
      ],
      description: t('Learn how to get started with Ansible Automation Platform.'),
      introduction: t(
        'Get started with Ansible Automation Platform as an automation developer. \nAs an automation developer, review [Developing automation content](https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html-single/developing_automation_content/index) before beginning your Ansible development project.'
      ),
      tasks: [
        {
          title: t('Download and install tools'),
          description: t(
            '##To download and install tools\n\n  - For more information about Red Hat Ansible Automation Platform tools and components you will use in creating automation execution environments, see [Ansible development tools](https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html-single/developing_automation_content/index#devtools-intro).\n\n  - For more information about installing tools, see [Installing Ansible development tools](https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html-single/developing_automation_content/index#installing-devtools).'
          ),
        },
        {
          title: t('Create a playbook'),
          description: t(
            '##To create a playbook:\n\n Ansible playbooks are blueprints that tell Ansible Automation Platform what tasks to perform with which devices. You can use a playbook to define the automation tasks that you want the platform to run.\n\n For more information, see [Playbook execution](https://docs.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.5/html-single/getting_started_with_playbooks/index#ref-playbook-execution).\n \n A playbook contains one or more plays. A basic play contains the following parameters:\n \n  - **Name**: a brief description of the overall function of the playbook, which assists in keeping it readable and organized for all users.\n  - **Hosts**: identifies the target or targets for Ansible to run against.\n  - **Become statements**: this optional statement can be set to true or yes to enable privilege escalation using a become plugin, such as `sudo`, `su`, `pfexec`, `doas`, `pbrun`, `dzdo`, `ksu`.\n  - **Tasks**: this is the list of actions that get executed against each host in the play.\n\n Here is an example of a play in a playbook. You can see the name of the play, the host, and the list of tasks included in the play:\n ```\n name: Set Up a Project and Job Template\n hosts: host.name.ip\n become: true\n \n tasks:\n    name: Create a Project\n    ansible.controller.project:\n        name: Job Template Test Project\n        state: present\n        scm_type: git\n        scm_url: https://github.com/ansible/ansible-tower-samples.git\n        \n    name: Create a Job Template\n    ansible.controller.job_template:\n        name: my-job-1\n        project: Job Template Test Project\n        inventory: Demo Inventory\n        playbook: hello_world.yml\n        job_type: run\n        state: present\n  ```\n\n  For more information about playbooks, see [Getting Started with Ansible Playbooks.](https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html/getting_started_with_playbooks/index)\n  For help writing a playbook, see [Ansible Lightspeed.](https://developers.redhat.com/products/ansible/lightspeed?source=sso)'
          ),
          review: {
            instructions: t(
              "#### To verify that you've written a functional playbook:\nDid your playbook execute correctly?"
            ),
            failedTaskHelp: t(
              'Try the steps again or read more about this topic at [Run Your First Command and Playbook](https://docs.ansible.com/ansible/latest/network/getting_started/first_playbook.html).'
            ),
          },
          summary: {
            success: t('You have viewed the details of your playbook!'),
            failed: undefined,
          },
        },
        {
          title: t('Create a role'),
          description: t(
            '##To create a role:\n\nRoles are units of organization in the Ansible Automation Platform. \nWhen you assign a role to a team or user, you are granting access to use, read, or write credentials. \nBecause of the file structure associated with a role, roles become redistributable units that enable you to share behavior among resources, or with other users. \nAll access that is granted to use, read, or write credentials is handled through roles, and roles are defined for a resource.\n\nRoles are separated out by service through automation controller, Event-Driven Ansible, and automation hub. \nFor more information, see [Creating a role](https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html/access_management_and_authentication/assembly-gw-roles#proc-gw-create-roles).'
          ),
        },
        {
          title: t('Upload a collection to automation hub'),
          description: t(
            '##To upload a collection to automation hub:\n\nAs a content creator, you can use namespaces in automation hub to curate and manage collections for the following purposes:\n\n  - Create groups with permissions to curate namespaces and upload collections to private automation hub.\n  - Add information and resources to the namespace to help end users of the collection in their automation tasks.\n  - Upload collections to the namespace.\n  - Review the namespace import logs to determine the success or failure of uploading the collection and its current approval status.\n\nFor more information about collections, see [Managing collections in automation hub](https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html-single/managing_automation_content/index#managing-collections-hub).\n\nYou can upload the collection by using either the automation hub user interface or the `ansible-galaxy` client.\n\n###Prerequisites\n\n- You have configured the `ansible-galaxy` client for automation hub.\n- You have at least one namespace.\n- You have run all content through ansible-test sanity.\n- You are a Red Hat Connect Partner. Learn more at [Red Hat Partner Connect](https://connect.redhat.com/).\n\n###Procedure\n\n1. From the navigation panel, select **Automation Content** > **Namespaces**.\n2. On the **My namespaces** tab, locate the namespace to which you want to upload a collection.\n3. Click **View collections** and click **Upload collection**.\n4. In the **New collection modal**, click **Select file**. Locate the file on your system.\n5. Click **Upload**.\n6. Using the ansible-galaxy client, enter the following command:\n\n  ```\n  ansible-galaxy collection publish path/to/my_namespace-my_collection-1.0.0.tar.gz --api-key=SECRET\n  ```'
          ),
          review: {
            instructions: t(
              "#### To verify that you've uploaded a collection:\nDoes the collection appear in the **Collections** list?"
            ),
            failedTaskHelp: t('This task is not verified yet. Try the task again.'),
          },
          summary: {
            success: t('You have viewed the details of your collection!'),
            failed: t('Try the steps again.'),
          },
        },
        {
          title: t('Add an inventory plugin (optional)'),
          description: t(
            '##To add an inventory plugin:\n\nInventory updates use dynamically-generated YAML files which are parsed by their inventory plugin. \nIn automation controller v4.4, you can give the inventory plugin configuration directly to automation controller using the inventory source `source_vars`.\n\nFor more information about adding inventory plugins, see [Inventory Plugins](https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html-single/using_automation_execution/index#ref-controller-inventory-plugins).'
          ),
        },
      ],
      conclusion: t(
        'You successfully completed the getting started steps for Ansible Automation Platform! If you want to learn how to find content, take the **Finding content in ansible automation platform** quick start.'
      ),
      nextQuickStart: ['finding-content-in-ansible-automation-platform'],
    },
  };
  return qsData;
}
