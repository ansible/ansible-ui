import { QuickStart } from '@patternfly/quickstarts';
import { useTranslation } from 'react-i18next';

export function useGettingStartedWithAAPQSDeveloper() {
  const { t } = useTranslation();

  const qsData: QuickStart = {
    metadata: {
      name: t('getting started with Ansible Automation Platform - Automation Developer'),
      instructional: true,
    },
    spec: {
      displayName: t('Getting started with Ansible Automation Platform - Automation Developer'),
      durationMinutes: 15,
      type: {
        color: 'grey',
        text: t('Platform'),
      },
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJ1dWlkLTc3OWYyYTc5LTdiYzMtNDY1MS1hYTkwLWUwMTIwZTI1NWFlMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMzggMzgiPjxkZWZzPjxzdHlsZT4udXVpZC02OTk4ZmEyMi1lYzlhLTRlMmYtOWQwZC1mNGJjMzM2MWU4MGV7ZmlsbDojZTAwO30udXVpZC0yYTAxZDA0Yy04OWQ0LTQ4YmEtYTJkOC01MTAzNDIxNWRhOWJ7ZmlsbDojZmZmO30udXVpZC1hMTkyMjZlOC1iNzFmLTQ4MWMtODE1Zi0xZWQ2MGY0MzYzYTZ7ZmlsbDojNGQ0ZDRkO308L3N0eWxlPjwvZGVmcz48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHJ4PSI5IiByeT0iOSIvPjxwYXRoIGNsYXNzPSJ1dWlkLWExOTIyNmU4LWI3MWYtNDgxYy04MTVmLTFlZDYwZjQzNjNhNiIgZD0ibTI4LDIuMjVjNC4yNzMzOCwwLDcuNzUsMy40NzY2NCw3Ljc1LDcuNzV2MThjMCw0LjI3MzM2LTMuNDc2NjIsNy43NS03Ljc1LDcuNzVIMTBjLTQuMjczMzgsMC03Ljc1LTMuNDc2NjQtNy43NS03Ljc1VjEwYzAtNC4yNzMzNiwzLjQ3NjYyLTcuNzUsNy43NS03Ljc1aDE4bTAtMS4yNUgxMEM1LjAyOTQyLDEsMSw1LjAyOTQ0LDEsMTB2MThjMCw0Ljk3MDU3LDQuMDI5NDIsOSw5LDloMThjNC45NzA1OCwwLDktNC4wMjk0Myw5LTlWMTBjMC00Ljk3MDU2LTQuMDI5NDItOS05LTloMFoiLz48cGF0aCBjbGFzcz0idXVpZC0yYTAxZDA0Yy04OWQ0LTQ4YmEtYTJkOC01MTAzNDIxNWRhOWIiIGQ9Im0xNSwyMy42MjVjLS4wODU5NCwwLS4xNzM4My0uMDE3NTgtLjI1Njg0LS4wNTU2Ni0uMzE0NDUtLjE0MTYtLjQ1NTA4LS41MTE3Mi0uMzEyNS0uODI2MTdsMi4wMjA1MS00LjQ4MTQ1Yy4wMDI5My0uMDA1ODYuMDA1ODYtLjAxMTcyLjAwNzgxLS4wMTc1OGwxLjk3MTY4LTQuMzY5MTRjLjIwMTE3LS40NDkyMi45Mzc1LS40NDkyMiwxLjEzODY3LDBsNCw4Ljg2ODE2Yy4xMTgxNC4yNTk3Ny4wNDM5NS41NjY0MS0uMTc4NzEuNzQ1MTItLjIyMjY2LjE3NzczLS41MzYxMy4xODI2Mi0uNzY2Ni4wMTE3MmwtNS4zNDk2MS00LjAyMTQ4LTEuNzA1MDgsMy43NzgzMmMtLjEwMzUyLjIzMTQ1LS4zMzEwNS4zNjgxNi0uNTY5MzQuMzY4MTZabTIuODAwNzgtNS4zMTQ0NWwzLjYyODkxLDIuNzI3NTQtMi40Mjk2OS01LjM4NTc0LTEuMTk5MjIsMi42NTgyWiIvPjxwYXRoIGNsYXNzPSJ1dWlkLTY5OThmYTIyLWVjOWEtNGUyZi05ZDBkLWY0YmMzMzYxZTgwZSIgZD0ibTE5LDMwLjEyNWMtNi4xMzQ3NywwLTExLjEyNS00Ljk5MDIzLTExLjEyNS0xMS4xMjVzNC45OTAyMy0xMS4xMjUsMTEuMTI1LTExLjEyNSwxMS4xMjUsNC45OTAyMywxMS4xMjUsMTEuMTI1LTQuOTkwMjMsMTEuMTI1LTExLjEyNSwxMS4xMjVabTAtMjFjLTUuNDQ1MzEsMC05Ljg3NSw0LjQyOTY5LTkuODc1LDkuODc1czQuNDI5NjksOS44NzUsOS44NzUsOS44NzUsOS44NzUtNC40Mjk2OSw5Ljg3NS05Ljg3NS00LjQyOTY5LTkuODc1LTkuODc1LTkuODc1WiIvPjwvc3ZnPg==',
      prerequisites: [
        t('You have completed the Ansible Automation Platform installation.'),
        t('You have a valid Ansible Automation Platform subscription.'),
        t(
          `You have created a [project folder](https://docs.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.5/html-single/getting_started_with_playbooks/index#proc-starting-automation) on your filesystem.`
        ),
      ],
      description: t('Learn how to get started with Ansible Automation Platform.'),
      introduction: t(
        'Get started with Ansible Automation Platform as an automation developer. \nAs an automation developer, review [Understanding Ansible concepts](https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.4/html-single/red_hat_ansible_automation_platform_creator_guide/index#understanding_ansible_concepts) before beginning your Ansible development project.'
      ),
      tasks: [
        {
          title: t('Download and install tools'),
          description: t(
            '##To download and install tools\n\n  - For more information about Red Hat Ansible Automation Platform tools and components you will use in creating automation execution environments, see [Tools and components](https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.4/html-single/red_hat_ansible_automation_platform_creator_guide/index#tools).\n\n  - For more information about installing tools, see [Setting up your development environment](https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.4/html-single/red_hat_ansible_automation_platform_creator_guide/index#setting-up-dev-environment).'
          ),
        },
        {
          title: t('Write a playbook'),
          description: t(
            '##To write a playbook:\n\n Ansible Playbooks are lists of tasks that automatically execute for your specified inventory or groups of hosts. \n One or more Ansible tasks can be combined to make a play, that is, an ordered grouping of tasks mapped to specific hosts.\n\n A playbook runs in order from top to bottom. \n Within each play, tasks also run in order from top to bottom. \n Playbooks with many "plays" can orchestrate multi-machine deployments, running one play on your webservers, then another play on your database servers, then a third play on your network infrastructure.\n\n For more information, see [Playbook execution](https://docs.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.5/html-single/getting_started_with_playbooks/index#ref-playbook-execution).\n \n Create a playbook that pings your hosts and prints a "Hello world" message:\n\n 1. Create a file named `playbook.yaml` in your `ansible_quickstart` directory, with the following content:\n\n ```\n  name: My first play\n   hosts: myhosts\n   tasks:\n     name: Ping my hosts\n    ansible.builtin.ping:\n\n    name: Print message\n    ansible.builtin.debug:\n     msg: Hello world\n\n ```\n\n 2. Run your playbook:\n\n ```\n ansible-playbook -i inventory.ini playbook.yaml\n ```\n\n - Ansible returns the following output:\n ```\n PLAY [My first play] ****************************************************************************\n\n TASK [Gathering Facts] **************************************************************************\n ok: [192.0.2.50]\n ok: [192.0.2.51]\n ok: [192.0.2.52]\n\n TASK [Ping my hosts] ****************************************************************************\n ok: [192.0.2.50]\n ok: [192.0.2.51]\n ok: [192.0.2.52]\n\n TASK [Print message] ****************************************************************************\n ok: [192.0.2.50] => {\n    "msg": "Hello world"\n }\n ok: [192.0.2.51] => {\n    "msg": "Hello world"\n }\n ok: [192.0.2.52] => {\n    "msg": "Hello world"\n }\n\n PLAY RECAP **************************************************************************************\n  192.0.2.50: ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0\n  192.0.2.51: ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0\n  192.0.2.52: ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0\n  ```\n\n  For more information about playbooks, see [Getting Started with Ansible Playbooks.](https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.5/html-single/getting_started_with_ansible_playbooks/index#doc-wrapper)\n  For help writing a playbook, see [Ansible Lightspeed.](https://developers.redhat.com/products/ansible/lightspeed?source=sso)'
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
            '##To create a role:\n\nRoles are units of organization in the Ansible Automation Platform. \nWhen you assign a role to a team or user, you are granting access to use, read, or write credentials. \nBecause of the file structure associated with a role, roles become redistributable units that enable you to share behavior among resources, or with other users. \nAll access that is granted to use, read, or write credentials is handled through roles, and roles are defined for a resource.\n\nRoles are separated out by service through automation controller, Event-Driven Ansible, and automation hub. \nFor more information, see the quick start **Review roles**.'
          ),
        },
        {
          title: t('Upload a collection to automation hub'),
          description: t(
            '##To upload a collection to automation hub:\n\nAs a content creator, you can use namespaces in automation hub to curate and manage collections for the following purposes:\n\n  - Create groups with permissions to curate namespaces and upload collections to private automation hub.\n  - Add information and resources to the namespace to help end users of the collection in their automation tasks.\n  - Upload collections to the namespace.\n  - Review the namespace import logs to determine the success or failure of uploading the collection and its current approval status.\n\nFor more information about collections, see [Managing collections](https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.4/html/managing_content_in_automation_hub/managing-collections-hub) in automation hub.\n\nYou can upload the collection by using either the automation hub user interface or the `ansible-galaxy` client.\n\n###Prerequisites\n\n- You have configured the `ansible-galaxy` client for automation hub.\n- You have at least one namespace.\n- You have run all content through ansible-test sanity.\n- You are a Red Hat Connect Partner. Learn more at [Red Hat Partner Connect](https://connect.redhat.com/).\n\n###Procedure\n\n1. From the navigation panel, select **Automation Content**.\n2. From the automation hub navigation panel, select **Collections** > **Namespaces**.\n3. On the **My namespaces** tab, locate the namespace to which you want to upload a collection.\n4. Click **View collections** and click **Upload collection**.\n5. In the **New collection modal**, click **Select file**. Locate the file on your system.\n6. Click **Upload**.\n7. Using the ansible-galaxy client, enter the following command:\n\n  ```\n  ansible-galaxy collection publish path/to/my_namespace-my_collection-1.0.0.tar.gz --api-key=SECRET\n  ```'
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
            '##To add an inventory plugin:\n\nInventory updates use dynamically-generated YAML files which are parsed by their inventory plugin. \nIn automation controller v4.4, you can give the inventory plugin configuration directly to automation controller using the inventory source `source_vars`.\n\nFor more information about adding inventory plugins, see [Inventory Plugins](https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.5/html-single/automation_controller_user_guide/index#ref-controller-inventory-plugins).'
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
