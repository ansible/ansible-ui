import { QuickStart } from '@patternfly/quickstarts';
import { useTranslation } from 'react-i18next';

export function useCreateRulebookActivationQS() {
  const { t } = useTranslation();

  const qsData: QuickStart = {
    metadata: {
      name: 'creating-a-rulebook-activation',
      instructional: true,
    },
    spec: {
      displayName: t('Creating a rulebook activation'),
      durationMinutes: 5,
      type: {
        text: t('Automation Decisions'),
        color: 'grey',
      },
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJ1dWlkLTMwODRiN2UwLTMyYWItNGNjMS1hZmEwLTU3ODVkOWE1MGZkMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMzggMzgiPjxkZWZzPjxzdHlsZT4udXVpZC0yZTkzZmJkYy0zNWQyLTQ4ODEtOTA4Yy05Y2ExNTVhMjc2ZjR7ZmlsbDojZTAwO30udXVpZC1kMjZhN2RhNi05M2JiLTRkN2MtYWZmMC00ODUzNmRmZDIwZTN7ZmlsbDojZmZmO30udXVpZC0zZTlmMDM4Ni1jYjhhLTRiMzAtYTcxYS02ZjRmYjIzMDU0YzZ7ZmlsbDojZTBlMGUwO308L3N0eWxlPjwvZGVmcz48cGF0aCBjbGFzcz0idXVpZC1kMjZhN2RhNi05M2JiLTRkN2MtYWZmMC00ODUzNmRmZDIwZTMiIGQ9Im0yOCwxSDEwQzUuMDI5NDQsMSwxLDUuMDI5NDQsMSwxMHYxOGMwLDQuOTcwNTcsNC4wMjk0NCw5LDksOWgxOGM0Ljk3MDU2LDAsOS00LjAyOTQzLDktOVYxMGMwLTQuOTcwNTYtNC4wMjk0NC05LTktOWgwWiIvPjxwYXRoIGNsYXNzPSJ1dWlkLTNlOWYwMzg2LWNiOGEtNGIzMC1hNzFhLTZmNGZiMjMwNTRjNiIgZD0ibTI4LDIuMjVjNC4yNzMzMiwwLDcuNzUsMy40NzY2Miw3Ljc1LDcuNzV2MThjMCw0LjI3MzM4LTMuNDc2NjgsNy43NS03Ljc1LDcuNzVIMTBjLTQuMjczMzIsMC03Ljc1LTMuNDc2NjItNy43NS03Ljc1VjEwYzAtNC4yNzMzOCwzLjQ3NjY4LTcuNzUsNy43NS03Ljc1aDE4bTAtMS4yNUgxMEM1LjAyOTQyLDEsMSw1LjAyOTQyLDEsMTB2MThjMCw0Ljk3MDU4LDQuMDI5NDIsOSw5LDloMThjNC45NzA1OCwwLDktNC4wMjk0Miw5LTlWMTBjMC00Ljk3MDU4LTQuMDI5NDItOS05LTloMFoiLz48cGF0aCBkPSJtMTUsMTEuNjI1aDExLjQ5MDg0bC0uOTMzMjMuOTMyNjJjLS4yNDMxNi4yNDQxNC0uMjQzMTYuNjQwNjIsMCwuODg0NzcuMTIyMDcuMTIyMDcuMjgyMjMuMTgyNjIuNDQyMzguMTgyNjJzLjMyMDMxLS4wNjA1NS40NDIzOC0uMTgyNjJsMi0yYy4wMjIwOS0uMDIyMTYuMDMxNjItLjA1MDcyLjA0OTY4LS4wNzUyLjAzMDY0LS4wNDEwOC4wNjQ0NS0uMDc5ODMuMDg0NDctLjEyNzc1LjAyNzk1LS4wNjc2OS4wMzk1NS0uMTM5NDcuMDQyODUtLjIxMTQ5LjAwMDQ5LS4wMDk4My4wMDU2Mi0uMDE4MDcuMDA1NjItLjAyNzk1cy0uMDA1MTMtLjAxODEzLS4wMDU2Mi0uMDI3OTVjLS4wMDMzLS4wNzIwMi0uMDE0ODktLjE0MzgtLjA0Mjg1LS4yMTE0OS0uMDIwMDItLjA0NzkxLS4wNTM4My0uMDg2NjctLjA4NDQ3LS4xMjc3NS0uMDE4MDctLjAyNDQ4LS4wMjc1OS0uMDUzMDQtLjA0OTY4LS4wNzUybC0yLTJjLS4yNDQxNC0uMjQ0MTQtLjY0MDYyLS4yNDQxNC0uODg0NzcsMC0uMjQzMTYuMjQ0MTQtLjI0MzE2LjY0MDYyLDAsLjg4NDc3bC45MzMyMy45MzI2MmgtMTEuNDkwODRjLS4zNDQ3MywwLS42MjUuMjgwMjctLjYyNS42MjVzLjI4MDI3LjYyNS42MjUuNjI1WiIvPjxwYXRoIGQ9Im0yMywyNi4zNzVoLTExLjQ5MDg0bC45MzMyMy0uOTMyNjJjLjI0MzE2LS4yNDQxNC4yNDMxNi0uNjQwNjIsMC0uODg0NzctLjI0NDE0LS4yNDQxNC0uNjQwNjItLjI0NDE0LS44ODQ3NywwbC0yLDJjLS4wMjIwOS4wMjIxNi0uMDMxNjIuMDUwNzItLjA0OTY4LjA3NTItLjAzMDY0LjA0MTA4LS4wNjQ0NS4wNzk4My0uMDg0NDcuMTI3NzUtLjAyNzk1LjA2NzY5LS4wMzk1NS4xMzk0Ny0uMDQyODUuMjExNDktLjAwMDQ5LjAwOTgzLS4wMDU2Mi4wMTgwNy0uMDA1NjIuMDI3OTVzLjAwNTEzLjAxODEzLjAwNTYyLjAyNzk1Yy4wMDMzLjA3MjAyLjAxNDg5LjE0MzguMDQyODUuMjExNDkuMDIwMDIuMDQ3OTEuMDUzODMuMDg2NjcuMDg0NDcuMTI3NzUuMDE4MDcuMDI0NDguMDI3NTkuMDUzMDQuMDQ5NjguMDc1MmwyLDJjLjEyMjA3LjEyMjA3LjI4MjIzLjE4MjYyLjQ0MjM4LjE4MjYycy4zMjAzMS0uMDYwNTUuNDQyMzgtLjE4MjYyYy4yNDMxNi0uMjQ0MTQuMjQzMTYtLjY0MDYyLDAtLjg4NDc3bC0uOTMzMjMtLjkzMjYyaDExLjQ5MDg0Yy4zNDQ3MywwLC42MjUtLjI4MDI3LjYyNS0uNjI1cy0uMjgwMjctLjYyNS0uNjI1LS42MjVaIi8+PHBhdGggZD0ibTEwLjM3NSwxMS41MDkxNnYxMS40OTA4NGMwLC4zNDQ3My4yODAyNy42MjUuNjI1LjYyNXMuNjI1LS4yODAyNy42MjUtLjYyNXYtMTEuNDkwODRsLjkzMjYyLjkzMzIzYy4xMjIwNy4xMjIwNy4yODIyMy4xODI2Mi40NDIzOC4xODI2MnMuMzIwMzEtLjA2MDU1LjQ0MjM4LS4xODI2MmMuMjQzMTYtLjI0NDE0LjI0MzE2LS42NDA2MiwwLS44ODQ3N2wtMi0yYy0uMDI3NTktLjAyNzU5LS4wNjI1LS4wNDA2NS0uMDkzNTEtLjA2MjAxLS4wMzU2NC0uMDI0OS0uMDY3NjMtLjA1NDg3LS4xMDgyOC0uMDcxOS0uMTUzODEtLjA2NDAzLS4zMjczOS0uMDY0MDMtLjQ4MTIsMC0uMDQwNjUuMDE3MDMtLjA3MjYzLjA0Ny0uMTA4MjguMDcxOS0uMDMxMDEuMDIxMzYtLjA2NTkyLjAzNDQyLS4wOTM1MS4wNjIwMWwtMiwyYy0uMjQzMTYuMjQ0MTQtLjI0MzE2LjY0MDYyLDAsLjg4NDc3LjI0NDE0LjI0NDE0LjY0MDYyLjI0NDE0Ljg4NDc3LDBsLjkzMjYyLS45MzMyM1oiLz48cGF0aCBkPSJtMjkuNDQyMzgsMjUuNTU3NjJjLS4yNDQxNC0uMjQ0MTQtLjY0MDYyLS4yNDQxNC0uODg0NzcsMGwtLjkzMjYyLjkzMzIzdi0xMS40OTA4NGMwLS4zNDQ3My0uMjgwMjctLjYyNS0uNjI1LS42MjVzLS42MjUuMjgwMjctLjYyNS42MjV2MTEuNDkwODRsLS45MzI2Mi0uOTMzMjNjLS4yNDQxNC0uMjQ0MTQtLjY0MDYyLS4yNDQxNC0uODg0NzcsMC0uMjQzMTYuMjQ0MTQtLjI0MzE2LjY0MDYyLDAsLjg4NDc3bDIsMmMuMDI0OS4wMjQ5LjA1NjY0LjAzNjEzLjA4NDM1LjA1NTkxLjAzODQ1LjAyNzcxLjA3MzczLjA1OTYzLjExODA0LjA3ODEyLjA3NjY2LjAzMTc0LjE1ODIuMDQ4NTguMjM5OTkuMDQ4NThzLjE2MzMzLS4wMTY4NS4yMzk5OS0uMDQ4NThjLjA0NDMxLS4wMTg0OS4wNzk1OS0uMDUwNDIuMTE4MDQtLjA3ODEyLjAyNzcxLS4wMTk3OC4wNTk0NS0uMDMxMDEuMDg0MzUtLjA1NTkxbDItMmMuMjQzMTYtLjI0NDE0LjI0MzE2LS42NDA2MiwwLS44ODQ3N1oiLz48cGF0aCBjbGFzcz0idXVpZC0yZTkzZmJkYy0zNWQyLTQ4ODEtOTA4Yy05Y2ExNTVhMjc2ZjQiIGQ9Im0yMywxOC4zNzVoLS43NzEyNGMtLjA4NTY5LS40NDMzLS4yNTczMi0uODU2MTQtLjUwMTk1LTEuMjE3MWwuNTQzNy0uNTQzNjRjLjI0MzE2LS4yNDQxNC4yNDMxNi0uNjQwNjIsMC0uODg0NzctLjI0NDE0LS4yNDQxNC0uNjQwNjItLjI0NDE0LS44ODQ3NywwbC0uNTQzNy41NDM2NGMtLjM2MDg0LS4yNDQ1Ny0uNzczNjgtLjQxNjItMS4yMTcwNC0uNTAxODl2LS43NzEyNGMwLS4zNDQ3My0uMjgwMjctLjYyNS0uNjI1LS42MjVzLS42MjUuMjgwMjctLjYyNS42MjV2Ljc3MTI0Yy0uNDQzMzYuMDg1NjktLjg1NjIuMjU3MzItMS4yMTcwNC41MDE4OWwtLjU0MzctLjU0MzY0Yy0uMjQ0MTQtLjI0NDE0LS42NDA2Mi0uMjQ0MTQtLjg4NDc3LDAtLjI0MzE2LjI0NDE0LS4yNDMxNi42NDA2MiwwLC44ODQ3N2wuNTQzNy41NDM2NGMtLjI0NDYzLjM2MDk2LS40MTYyNi43NzM4LS41MDE5NSwxLjIxNzFoLS43NzEyNGMtLjM0NDczLDAtLjYyNS4yODAyNy0uNjI1LjYyNXMuMjgwMjcuNjI1LjYyNS42MjVoLjc3MTI0Yy4wODU2OS40NDMzLjI1NzMyLjg1NjE0LjUwMTk1LDEuMjE3MWwtLjU0MzcuNTQzNjRjLS4yNDMxNi4yNDQxNC0uMjQzMTYuNjQwNjIsMCwuODg0NzcuMTIyMDcuMTIyMDcuMjgyMjMuMTgyNjIuNDQyMzguMTgyNjJzLjMyMDMxLS4wNjA1NS40NDIzOC0uMTgyNjJsLjU0MzctLjU0MzY0Yy4zNjA4NC4yNDQ1Ny43NzM2OC40MTYyLDEuMjE3MDQuNTAxODl2Ljc3MTI0YzAsLjM0NDczLjI4MDI3LjYyNS42MjUuNjI1cy42MjUtLjI4MDI3LjYyNS0uNjI1di0uNzcxMjRjLjQ0MzM2LS4wODU2OS44NTYyLS4yNTczMiwxLjIxNzA0LS41MDE4OWwuNTQzNy41NDM2NGMuMTIyMDcuMTIyMDcuMjgyMjMuMTgyNjIuNDQyMzguMTgyNjJzLjMyMDMxLS4wNjA1NS40NDIzOC0uMTgyNjJjLjI0MzE2LS4yNDQxNC4yNDMxNi0uNjQwNjIsMC0uODg0NzdsLS41NDM3LS41NDM2NGMuMjQ0NjMtLjM2MDk2LjQxNjI2LS43NzM4LjUwMTk1LTEuMjE3MWguNzcxMjRjLjM0NDczLDAsLjYyNS0uMjgwMjcuNjI1LS42MjVzLS4yODAyNy0uNjI1LS42MjUtLjYyNVptLTQsMi42NjY5OWMtMS4xMjU5OCwwLTIuMDQxOTktLjkxNjAyLTIuMDQxOTktMi4wNDE5OXMuOTE2MDItMi4wNDE5OSwyLjA0MTk5LTIuMDQxOTksMi4wNDE5OS45MTYwMiwyLjA0MTk5LDIuMDQxOTktLjkxNjAyLDIuMDQxOTktMi4wNDE5OSwyLjA0MTk5WiIvPjwvc3ZnPg==',
      prerequisites: [
        t('You have set up a project.'),
        t('You have set up a decision environment.'),
        t('You have set up an automation controller token.'),
      ],
      description: t(
        'Create a rulebook activation.\n\nPersona: Platform administrator, Automation developer'
      ),
      introduction: t(
        'Create a rulebook activation, which is a process running in the background defined by a decision environment executing a specific rulebook.'
      ),
      tasks: [
        {
          title: t('Create a rulebook activation'),
          description: t(
            '## To create a rulebook activation:\n\n 1. Log in to Red Hat Ansible Automation Platform.\n 2. From the navigation panel, select **Automation Decisions** > **Rulebook Activations**.\n 3. Click **Create rulebook activation**.\n 4. Complete the required fields:\n\n    - **Name**: Give your rulebook activation a unique name. \n    - **Project**: Select a project to choose one of its rulebooks for use with this rulebook activation.\n    - **Rulebook**: Select the rulebook that this rulebook activation will work with. \n    - **Decision environment**: Select a decision environment, which is a container image used to run Ansible rulebooks. \n    - **Restart policy**: Select a policy that determines when to restart your rulebook.\n    - **Log level**: \n    - **Rulebook activation enabled**: Choose whether or not to automatically run your rulebook activation after creation.\n    - **Variables**: The variables for the rulebook are in a JSON/YAML format. The content is equivalent to the file passed through the `--vars` flag of ansible-rulebook command.\n\n 5. Click **Create rulebook activation**.\n\nYour rulebook activation is now created and can be managed in the **Rulebook Activations** screen.'
          ),
          review: {
            instructions: t(
              "#### To verify that you've created a rulebook activation:\nDo you see the details page of your new rulebook activation?"
            ),
            failedTaskHelp: t(
              'Try the steps again. For more information, see [Rulebook activations](https://docs.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.5/html/using_automation_decisions/eda-rulebook-activations).'
            ),
          },
          summary: {
            success: t('You have viewed the details of your user!'),
            failed: undefined,
          },
        },
      ],
      conclusion: t(
        'You successfully completed the creating a rulebook activation steps! If you want to learn how to set up Ansible Lightspeed, take the **Setting up Ansible Lightspeed** quick start.'
      ),
      nextQuickStart: ['ansible-lightspeed'],
    },
  };
  return qsData;
}
