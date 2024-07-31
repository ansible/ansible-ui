import { QuickStart } from '@patternfly/quickstarts';
import { useTranslation } from 'react-i18next';

export function useBuildExecutionEnvironmentsQS() {
  const { t } = useTranslation();

  const qsData: QuickStart = {
    metadata: {
      name: 'build-execution-environment',
      instructional: true,
    },
    spec: {
      displayName: t('Building an automation execution environment'),
      durationMinutes: 10,
      type: {
        text: t('Automation Execution'),
        color: 'grey',
      },
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJ1dWlkLWFlOWM1NjUwLTFhYTAtNDBhYi04M2EyLTEzODgxMTEyNDE4OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMzggMzgiPjxkZWZzPjxzdHlsZT4udXVpZC0zNzU1MDdkZS1lMmQ3LTQzNmQtYjQ3ZC1mYmNkZWI4MTIzNmZ7ZmlsbDojZTAwO30udXVpZC1lYjcyNzUxYy1mZTVlLTQ1NGMtOGQwZi02MWE2ZGM0MGUyYmF7ZmlsbDojZmZmO30udXVpZC1iZDJiZTdjNS04NmY2LTRkMWUtOGIxMi01NGZiM2Y5MDE4YTB7ZmlsbDojZTBlMGUwO308L3N0eWxlPjwvZGVmcz48cGF0aCBjbGFzcz0idXVpZC1lYjcyNzUxYy1mZTVlLTQ1NGMtOGQwZi02MWE2ZGM0MGUyYmEiIGQ9Im0yOCwxSDEwQzUuMDI5NDQsMSwxLDUuMDI5NDQsMSwxMHYxOGMwLDQuOTcwNTcsNC4wMjk0NCw5LDksOWgxOGM0Ljk3MDU2LDAsOS00LjAyOTQzLDktOVYxMGMwLTQuOTcwNTYtNC4wMjk0NC05LTktOWgwWiIvPjxwYXRoIGNsYXNzPSJ1dWlkLWJkMmJlN2M1LTg2ZjYtNGQxZS04YjEyLTU0ZmIzZjkwMThhMCIgZD0ibTI4LDIuMjVjNC4yNzMzMiwwLDcuNzUsMy40NzY2NCw3Ljc1LDcuNzV2MThjMCw0LjI3MzM2LTMuNDc2NjgsNy43NS03Ljc1LDcuNzVIMTBjLTQuMjczMzIsMC03Ljc1LTMuNDc2NjQtNy43NS03Ljc1VjEwYzAtNC4yNzMzNiwzLjQ3NjY4LTcuNzUsNy43NS03Ljc1aDE4bTAtMS4yNUgxMEM1LjAyOTQyLDEsMSw1LjAyOTQzLDEsMTB2MThjMCw0Ljk3MDU3LDQuMDI5NDIsOSw5LDloMThjNC45NzA1OCwwLDktNC4wMjk0Myw5LTlWMTBjMC00Ljk3MDU3LTQuMDI5NDItOS05LTloMFoiLz48cGF0aCBjbGFzcz0idXVpZC0zNzU1MDdkZS1lMmQ3LTQzNmQtYjQ3ZC1mYmNkZWI4MTIzNmYiIGQ9Im0yMywxMi4zNzVoLS43NzEyNGMtLjA4NTY5LS40NDMzLS4yNTczMi0uODU2MTQtLjUwMTk1LTEuMjE3MWwuNTQzNy0uNTQzNjRjLjI0MzE2LS4yNDQxNC4yNDMxNi0uNjQwNjIsMC0uODg0NzctLjI0NDE0LS4yNDQxNC0uNjQwNjItLjI0NDE0LS44ODQ3NywwbC0uNTQzNy41NDM2NGMtLjM2MDg0LS4yNDQ1Ny0uNzczNjgtLjQxNjItMS4yMTcwNC0uNTAxODl2LS43NzEyNGMwLS4zNDQ3My0uMjgwMjctLjYyNS0uNjI1LS42MjVzLS42MjUuMjgwMjctLjYyNS42MjV2Ljc3MTI0Yy0uNDQzMzYuMDg1NjktLjg1NjIuMjU3MzItMS4yMTcwNC41MDE4OWwtLjU0MzctLjU0MzY0Yy0uMjQ0MTQtLjI0NDE0LS42NDA2Mi0uMjQ0MTQtLjg4NDc3LDAtLjI0MzE2LjI0NDE0LS4yNDMxNi42NDA2MiwwLC44ODQ3N2wuNTQzNy41NDM2NGMtLjI0NDYzLjM2MDk2LS40MTYyNi43NzM4LS41MDE5NSwxLjIxNzFoLS43NzEyNGMtLjM0NDczLDAtLjYyNS4yODAyNy0uNjI1LjYyNXMuMjgwMjcuNjI1LjYyNS42MjVoLjc3MTI0Yy4wODU2OS40NDMzLjI1NzMyLjg1NjE0LjUwMTk1LDEuMjE3MWwtLjU0MzcuNTQzNjRjLS4yNDMxNi4yNDQxNC0uMjQzMTYuNjQwNjIsMCwuODg0NzcuMTIyMDcuMTIyMDcuMjgyMjMuMTgyNjIuNDQyMzguMTgyNjJzLjMyMDMxLS4wNjA1NS40NDIzOC0uMTgyNjJsLjU0MzctLjU0MzY0Yy4zNjA4NC4yNDQ1Ny43NzM2OC40MTYyLDEuMjE3MDQuNTAxODl2Ljc3MTI0YzAsLjM0NDczLjI4MDI3LjYyNS42MjUuNjI1cy42MjUtLjI4MDI3LjYyNS0uNjI1di0uNzcxMjRjLjQ0MzM2LS4wODU2OS44NTYyLS4yNTczMiwxLjIxNzA0LS41MDE4OWwuNTQzNy41NDM2NGMuMTIyMDcuMTIyMDcuMjgyMjMuMTgyNjIuNDQyMzguMTgyNjJzLjMyMDMxLS4wNjA1NS40NDIzOC0uMTgyNjJjLjI0MzE2LS4yNDQxNC4yNDMxNi0uNjQwNjIsMC0uODg0NzdsLS41NDM3LS41NDM2NGMuMjQ0NjMtLjM2MDk2LjQxNjI2LS43NzM4LjUwMTk1LTEuMjE3MWguNzcxMjRjLjM0NDczLDAsLjYyNS0uMjgwMjcuNjI1LS42MjVzLS4yODAyNy0uNjI1LS42MjUtLjYyNVptLTQsMi42NjY5OWMtMS4xMjU5OCwwLTIuMDQxOTktLjkxNjAyLTIuMDQxOTktMi4wNDE5OXMuOTE2MDItMi4wNDE5OSwyLjA0MTk5LTIuMDQxOTksMi4wNDE5OS45MTYwMiwyLjA0MTk5LDIuMDQxOTktLjkxNjAyLDIuMDQxOTktMi4wNDE5OSwyLjA0MTk5WiIvPjxwYXRoIGNsYXNzPSJ1dWlkLTM3NTUwN2RlLWUyZDctNDM2ZC1iNDdkLWZiY2RlYjgxMjM2ZiIgZD0ibTI4LDI4LjYyNWgtNGMtLjM0NDczLDAtLjYyNS0uMjgwMjctLjYyNS0uNjI1di00YzAtLjM0NDczLjI4MDI3LS42MjUuNjI1LS42MjVoNGMuMzQ0NzMsMCwuNjI1LjI4MDI3LjYyNS42MjV2NGMwLC4zNDQ3My0uMjgwMjcuNjI1LS42MjUuNjI1Wm0tMy4zNzUtMS4yNWgyLjc1di0yLjc1aC0yLjc1djIuNzVaIi8+PHBhdGggY2xhc3M9InV1aWQtMzc1NTA3ZGUtZTJkNy00MzZkLWI0N2QtZmJjZGViODEyMzZmIiBkPSJtMjEsMjguNjI1aC00Yy0uMzQ0NzMsMC0uNjI1LS4yODAyNy0uNjI1LS42MjV2LTRjMC0uMzQ0NzMuMjgwMjctLjYyNS42MjUtLjYyNWg0Yy4zNDQ3MywwLC42MjUuMjgwMjcuNjI1LjYyNXY0YzAsLjM0NDczLS4yODAyNy42MjUtLjYyNS42MjVabS0zLjM3NS0xLjI1aDIuNzV2LTIuNzVoLTIuNzV2Mi43NVoiLz48cGF0aCBjbGFzcz0idXVpZC0zNzU1MDdkZS1lMmQ3LTQzNmQtYjQ3ZC1mYmNkZWI4MTIzNmYiIGQ9Im0xNCwyOC42MjVoLTRjLS4zNDQ3MywwLS42MjUtLjI4MDI3LS42MjUtLjYyNXYtNGMwLS4zNDQ3My4yODAyNy0uNjI1LjYyNS0uNjI1aDRjLjM0NDczLDAsLjYyNS4yODAyNy42MjUuNjI1djRjMCwuMzQ0NzMtLjI4MDI3LjYyNS0uNjI1LjYyNVptLTMuMzc1LTEuMjVoMi43NXYtMi43NWgtMi43NXYyLjc1WiIvPjxwYXRoIGQ9Im0yNiwyMC4zNzVoLTYuMzc1di0xLjM3NWMwLS4zNDQ3My0uMjgwMjctLjYyNS0uNjI1LS42MjVzLS42MjUuMjgwMjctLjYyNS42MjV2MS4zNzVoLTYuMzc1Yy0uMzQ0NzMsMC0uNjI1LjI4MDI3LS42MjUuNjI1cy4yODAyNy42MjUuNjI1LjYyNWgxNGMuMzQ0NzMsMCwuNjI1LS4yODAyNy42MjUtLjYyNXMtLjI4MDI3LS42MjUtLjYyNS0uNjI1WiIvPjwvc3ZnPg==',
      description: t(
        'Build, view, and sync an environment.\n\nPersona: Platform administrator, Automation developer'
      ),
      introduction: t(
        'All automation in Red Hat Ansible Automation Platform runs on container images called automation execution environments. \nAutomation execution environments create a common language for communicating automation dependencies, and offer a standard way to build and distribute the automation environment.'
      ),
      tasks: [
        {
          title: t('Build an execution environment'),
          description: t(
            '##To build an execution environment:\n\nAn automation execution environment must contain the following:\n - Ansible 2.9 or Ansible Core 2.11-2.15\n - Python 3.8-3.11\n - Ansible Runner\n - Ansible content collections and their dependencies\n - System dependencies\n\nAnsible Builder is a command line tool that automates the process of building automation execution environments by using metadata defined in various Ansible Collections or created by the user.\n\nFor more information about Ansible Builder and execution environments, see: \n- [Using Ansible Builder](https://docs.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.5/html-single/creating_and_using_execution_environments/index#assembly-using-builder)\n- [Creating and Consuming Execution Environments](https://docs.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.5/html-single/creating_and_using_execution_environments/index)'
          ),
        },
        {
          title: t('View an execution environment'),
          description: t(
            '##To view an execution environment:\n\n1. From the navigation panel, select **Automation Execution** > **Infrastructure** > **Execution Environments**. \n2. Click an execution environment to view its details. \n  As part of the initial setup, a **Control Plane Execution Environment**, a **Default execution environment**, and a **Minimal execution environment** are created to help you get started, but you can also create your own.'
          ),
        },
        {
          title: t('Add an execution environment to a job template'),
          description: t(
            '##To add an execution environment to a job template:\n\n###Prerequisites:\n  - You have access to an execution environment created using ansible-builder as described in [Building an execution environment](https://docs.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.5/html-single/using_automation_execution/index#ref-controller-build-exec-envs). \n      Use the automation controller UI to specify the execution environment to use in your job templates.\n  - You have the appropriate permissions to use an execution environment in a job. \n  - For jobs or jobs template that use an execution environment with an assigned credential, ensure that the credential contains a username, host, and password.\n\n###Procedure:\n  1. From the navigation panel, select **Automation Execution** > **Infrastructure** > **Execution Environments**.\n  2. Click **Create execution environment**.\n  3. Enter the appropriate details into the required fields.\n  4. Click **Create execution environent**.\n  5. To add an execution environment to a job template, specify it in the **Execution environment** field of the job template.\n\n   When you have added an execution environment to a job template, those templates are listed in the **Templates tab** of the execution environment.\n\n   For more information, see [Execution environments](https://docs.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.5/html-single/using_automation_execution/index#assembly-controller-execution-environments).'
          ),
          review: {
            instructions: t(
              "#### To verify that you've added an execution environment:\nIs the execution environment listed on the **Execution Environments** list view?"
            ),
            failedTaskHelp: t('Try the steps again.'),
          },
          summary: {
            success: t('You have viewed the details of your environment!'),
            failed: undefined,
          },
        },
      ],
      conclusion: t(
        'You successfully completed the building an execution environment steps! If you want to learn how to build a decision environment, take the **Building a decision environment** quick start.'
      ),
      nextQuickStart: ['build-decision-environment'],
    },
  };
  return qsData;
}
