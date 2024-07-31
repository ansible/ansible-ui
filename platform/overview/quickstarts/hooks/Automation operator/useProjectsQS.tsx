import { QuickStart } from '@patternfly/quickstarts';
import { useTranslation } from 'react-i18next';

export function useProjectsQS() {
  const { t } = useTranslation();

  const qsData: QuickStart = {
    metadata: {
      name: 'execute-project',
      instructional: true,
    },
    spec: {
      displayName: t('Projects'),
      durationMinutes: 5,
      type: {
        text: 'Automation Execution',
        color: 'grey',
      },
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJ1dWlkLWFlOWM1NjUwLTFhYTAtNDBhYi04M2EyLTEzODgxMTEyNDE4OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMzggMzgiPjxkZWZzPjxzdHlsZT4udXVpZC0zNzU1MDdkZS1lMmQ3LTQzNmQtYjQ3ZC1mYmNkZWI4MTIzNmZ7ZmlsbDojZTAwO30udXVpZC1lYjcyNzUxYy1mZTVlLTQ1NGMtOGQwZi02MWE2ZGM0MGUyYmF7ZmlsbDojZmZmO30udXVpZC1iZDJiZTdjNS04NmY2LTRkMWUtOGIxMi01NGZiM2Y5MDE4YTB7ZmlsbDojZTBlMGUwO308L3N0eWxlPjwvZGVmcz48cGF0aCBjbGFzcz0idXVpZC1lYjcyNzUxYy1mZTVlLTQ1NGMtOGQwZi02MWE2ZGM0MGUyYmEiIGQ9Im0yOCwxSDEwQzUuMDI5NDQsMSwxLDUuMDI5NDQsMSwxMHYxOGMwLDQuOTcwNTcsNC4wMjk0NCw5LDksOWgxOGM0Ljk3MDU2LDAsOS00LjAyOTQzLDktOVYxMGMwLTQuOTcwNTYtNC4wMjk0NC05LTktOWgwWiIvPjxwYXRoIGNsYXNzPSJ1dWlkLWJkMmJlN2M1LTg2ZjYtNGQxZS04YjEyLTU0ZmIzZjkwMThhMCIgZD0ibTI4LDIuMjVjNC4yNzMzMiwwLDcuNzUsMy40NzY2NCw3Ljc1LDcuNzV2MThjMCw0LjI3MzM2LTMuNDc2NjgsNy43NS03Ljc1LDcuNzVIMTBjLTQuMjczMzIsMC03Ljc1LTMuNDc2NjQtNy43NS03Ljc1VjEwYzAtNC4yNzMzNiwzLjQ3NjY4LTcuNzUsNy43NS03Ljc1aDE4bTAtMS4yNUgxMEM1LjAyOTQyLDEsMSw1LjAyOTQzLDEsMTB2MThjMCw0Ljk3MDU3LDQuMDI5NDIsOSw5LDloMThjNC45NzA1OCwwLDktNC4wMjk0Myw5LTlWMTBjMC00Ljk3MDU3LTQuMDI5NDItOS05LTloMFoiLz48cGF0aCBjbGFzcz0idXVpZC0zNzU1MDdkZS1lMmQ3LTQzNmQtYjQ3ZC1mYmNkZWI4MTIzNmYiIGQ9Im0yMywxMi4zNzVoLS43NzEyNGMtLjA4NTY5LS40NDMzLS4yNTczMi0uODU2MTQtLjUwMTk1LTEuMjE3MWwuNTQzNy0uNTQzNjRjLjI0MzE2LS4yNDQxNC4yNDMxNi0uNjQwNjIsMC0uODg0NzctLjI0NDE0LS4yNDQxNC0uNjQwNjItLjI0NDE0LS44ODQ3NywwbC0uNTQzNy41NDM2NGMtLjM2MDg0LS4yNDQ1Ny0uNzczNjgtLjQxNjItMS4yMTcwNC0uNTAxODl2LS43NzEyNGMwLS4zNDQ3My0uMjgwMjctLjYyNS0uNjI1LS42MjVzLS42MjUuMjgwMjctLjYyNS42MjV2Ljc3MTI0Yy0uNDQzMzYuMDg1NjktLjg1NjIuMjU3MzItMS4yMTcwNC41MDE4OWwtLjU0MzctLjU0MzY0Yy0uMjQ0MTQtLjI0NDE0LS42NDA2Mi0uMjQ0MTQtLjg4NDc3LDAtLjI0MzE2LjI0NDE0LS4yNDMxNi42NDA2MiwwLC44ODQ3N2wuNTQzNy41NDM2NGMtLjI0NDYzLjM2MDk2LS40MTYyNi43NzM4LS41MDE5NSwxLjIxNzFoLS43NzEyNGMtLjM0NDczLDAtLjYyNS4yODAyNy0uNjI1LjYyNXMuMjgwMjcuNjI1LjYyNS42MjVoLjc3MTI0Yy4wODU2OS40NDMzLjI1NzMyLjg1NjE0LjUwMTk1LDEuMjE3MWwtLjU0MzcuNTQzNjRjLS4yNDMxNi4yNDQxNC0uMjQzMTYuNjQwNjIsMCwuODg0NzcuMTIyMDcuMTIyMDcuMjgyMjMuMTgyNjIuNDQyMzguMTgyNjJzLjMyMDMxLS4wNjA1NS40NDIzOC0uMTgyNjJsLjU0MzctLjU0MzY0Yy4zNjA4NC4yNDQ1Ny43NzM2OC40MTYyLDEuMjE3MDQuNTAxODl2Ljc3MTI0YzAsLjM0NDczLjI4MDI3LjYyNS42MjUuNjI1cy42MjUtLjI4MDI3LjYyNS0uNjI1di0uNzcxMjRjLjQ0MzM2LS4wODU2OS44NTYyLS4yNTczMiwxLjIxNzA0LS41MDE4OWwuNTQzNy41NDM2NGMuMTIyMDcuMTIyMDcuMjgyMjMuMTgyNjIuNDQyMzguMTgyNjJzLjMyMDMxLS4wNjA1NS40NDIzOC0uMTgyNjJjLjI0MzE2LS4yNDQxNC4yNDMxNi0uNjQwNjIsMC0uODg0NzdsLS41NDM3LS41NDM2NGMuMjQ0NjMtLjM2MDk2LjQxNjI2LS43NzM4LjUwMTk1LTEuMjE3MWguNzcxMjRjLjM0NDczLDAsLjYyNS0uMjgwMjcuNjI1LS42MjVzLS4yODAyNy0uNjI1LS42MjUtLjYyNVptLTQsMi42NjY5OWMtMS4xMjU5OCwwLTIuMDQxOTktLjkxNjAyLTIuMDQxOTktMi4wNDE5OXMuOTE2MDItMi4wNDE5OSwyLjA0MTk5LTIuMDQxOTksMi4wNDE5OS45MTYwMiwyLjA0MTk5LDIuMDQxOTktLjkxNjAyLDIuMDQxOTktMi4wNDE5OSwyLjA0MTk5WiIvPjxwYXRoIGNsYXNzPSJ1dWlkLTM3NTUwN2RlLWUyZDctNDM2ZC1iNDdkLWZiY2RlYjgxMjM2ZiIgZD0ibTI4LDI4LjYyNWgtNGMtLjM0NDczLDAtLjYyNS0uMjgwMjctLjYyNS0uNjI1di00YzAtLjM0NDczLjI4MDI3LS42MjUuNjI1LS42MjVoNGMuMzQ0NzMsMCwuNjI1LjI4MDI3LjYyNS42MjV2NGMwLC4zNDQ3My0uMjgwMjcuNjI1LS42MjUuNjI1Wm0tMy4zNzUtMS4yNWgyLjc1di0yLjc1aC0yLjc1djIuNzVaIi8+PHBhdGggY2xhc3M9InV1aWQtMzc1NTA3ZGUtZTJkNy00MzZkLWI0N2QtZmJjZGViODEyMzZmIiBkPSJtMjEsMjguNjI1aC00Yy0uMzQ0NzMsMC0uNjI1LS4yODAyNy0uNjI1LS42MjV2LTRjMC0uMzQ0NzMuMjgwMjctLjYyNS42MjUtLjYyNWg0Yy4zNDQ3MywwLC42MjUuMjgwMjcuNjI1LjYyNXY0YzAsLjM0NDczLS4yODAyNy42MjUtLjYyNS42MjVabS0zLjM3NS0xLjI1aDIuNzV2LTIuNzVoLTIuNzV2Mi43NVoiLz48cGF0aCBjbGFzcz0idXVpZC0zNzU1MDdkZS1lMmQ3LTQzNmQtYjQ3ZC1mYmNkZWI4MTIzNmYiIGQ9Im0xNCwyOC42MjVoLTRjLS4zNDQ3MywwLS42MjUtLjI4MDI3LS42MjUtLjYyNXYtNGMwLS4zNDQ3My4yODAyNy0uNjI1LjYyNS0uNjI1aDRjLjM0NDczLDAsLjYyNS4yODAyNy42MjUuNjI1djRjMCwuMzQ0NzMtLjI4MDI3LjYyNS0uNjI1LjYyNVptLTMuMzc1LTEuMjVoMi43NXYtMi43NWgtMi43NXYyLjc1WiIvPjxwYXRoIGQ9Im0yNiwyMC4zNzVoLTYuMzc1di0xLjM3NWMwLS4zNDQ3My0uMjgwMjctLjYyNS0uNjI1LS42MjVzLS42MjUuMjgwMjctLjYyNS42MjV2MS4zNzVoLTYuMzc1Yy0uMzQ0NzMsMC0uNjI1LjI4MDI3LS42MjUuNjI1cy4yODAyNy42MjUuNjI1LjYyNWgxNGMuMzQ0NzMsMCwuNjI1LS4yODAyNy42MjUtLjYyNXMtLjI4MDI3LS42MjUtLjYyNS0uNjI1WiIvPjwvc3ZnPg==',
      description: t('Executing projects.\n\nPersona: Ansible Operator'),
      introduction: t(
        'A project is a logical collection of Ansible playbooks, represented in automation controller. \n\nPlatform administrators and automation developers have the permissions to create projects. \nAs an automation operator you can view and sync projects.'
      ),
      tasks: [
        {
          title: 'Execute a project',
          description: t(
            '##To execute a project:\n\n 1. From the navigation panel, select **Automation Execution** > **Projects**.\n 2. Click a template to view its details.\n  [As part of the initial setup, a default project is created to help you get started.]{{admonition tip}}\n 3. For each project listed, you can sync the latest SCM revision, edit the project, or copy the project attributes, using the icons next to each project.\n\n ###Additional information\n The **Projects** window displays a list of the projects that are currently available.\n\n You are provided with a default project that you can work with initially.\n\n Status indicates the state of the project and might be one of the following (note that you can also filter your view by specific status types):\n    - **Pending** - The source control update has been created, but not queued or started yet. Any job (not just source control updates) stays pending until it is ready to be run by the system. Possible reasons for it not being ready are:\n         - It has dependencies that are currently running so it has to wait until they are done.\n         - There is not enough capacity to run in the locations it is configured to.\n    - **Waiting** - The source control update is in the queue waiting to be executed.\n    - **Running** - The source control update is currently in progress.\n    - **Success** - The last source control update for this project succeeded.\n    - **Failed**- The last source control update for this project failed.\n    - **Error** - The last source control update job failed to run at all.\n    - **Canceled** - The last source control update for the project was canceled.\n    - **Never updated** - The project is configured for source control, but has never been updated.\n    - **OK** - The project is not configured for source control, and is correctly in place.\n    - **Missing** - Projects are absent from the project base path of `/var/lib/awx/projects`. \n    This is applicable for manual or source control managed projects.\n\n For more information about projects, see [Projects](https://docs.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.5/html/using_automation_execution/controller-projects).'
          ),
        },
      ],
      conclusion: t(
        'You successfully completed the executing a project steps! If you want to learn how to launch a template, take the **Templates** quick start.'
      ),
      nextQuickStart: ['launch-a-job-template'],
    },
  };
  return qsData;
}
