import { QuickStart } from '@patternfly/quickstarts';
import { useTranslation } from 'react-i18next';

export function useCreateTeamsQS() {
  const { t } = useTranslation();

  const qsData: QuickStart = {
    metadata: {
      name: 'creating-a-team',
      instructional: true,
    },
    spec: {
      displayName: t('Create teams'),
      durationMinutes: 10,
      type: {
        text: t('Access'),
        color: 'grey',
      },
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJ1dWlkLTc3OWYyYTc5LTdiYzMtNDY1MS1hYTkwLWUwMTIwZTI1NWFlMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMzggMzgiPjxkZWZzPjxzdHlsZT4udXVpZC02OTk4ZmEyMi1lYzlhLTRlMmYtOWQwZC1mNGJjMzM2MWU4MGV7ZmlsbDojZTAwO30udXVpZC0yYTAxZDA0Yy04OWQ0LTQ4YmEtYTJkOC01MTAzNDIxNWRhOWJ7ZmlsbDojZmZmO30udXVpZC1hMTkyMjZlOC1iNzFmLTQ4MWMtODE1Zi0xZWQ2MGY0MzYzYTZ7ZmlsbDojNGQ0ZDRkO308L3N0eWxlPjwvZGVmcz48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHJ4PSI5IiByeT0iOSIvPjxwYXRoIGNsYXNzPSJ1dWlkLWExOTIyNmU4LWI3MWYtNDgxYy04MTVmLTFlZDYwZjQzNjNhNiIgZD0ibTI4LDIuMjVjNC4yNzMzOCwwLDcuNzUsMy40NzY2NCw3Ljc1LDcuNzV2MThjMCw0LjI3MzM2LTMuNDc2NjIsNy43NS03Ljc1LDcuNzVIMTBjLTQuMjczMzgsMC03Ljc1LTMuNDc2NjQtNy43NS03Ljc1VjEwYzAtNC4yNzMzNiwzLjQ3NjYyLTcuNzUsNy43NS03Ljc1aDE4bTAtMS4yNUgxMEM1LjAyOTQyLDEsMSw1LjAyOTQ0LDEsMTB2MThjMCw0Ljk3MDU3LDQuMDI5NDIsOSw5LDloMThjNC45NzA1OCwwLDktNC4wMjk0Myw5LTlWMTBjMC00Ljk3MDU2LTQuMDI5NDItOS05LTloMFoiLz48cGF0aCBjbGFzcz0idXVpZC0yYTAxZDA0Yy04OWQ0LTQ4YmEtYTJkOC01MTAzNDIxNWRhOWIiIGQ9Im0xNSwyMy42MjVjLS4wODU5NCwwLS4xNzM4My0uMDE3NTgtLjI1Njg0LS4wNTU2Ni0uMzE0NDUtLjE0MTYtLjQ1NTA4LS41MTE3Mi0uMzEyNS0uODI2MTdsMi4wMjA1MS00LjQ4MTQ1Yy4wMDI5My0uMDA1ODYuMDA1ODYtLjAxMTcyLjAwNzgxLS4wMTc1OGwxLjk3MTY4LTQuMzY5MTRjLjIwMTE3LS40NDkyMi45Mzc1LS40NDkyMiwxLjEzODY3LDBsNCw4Ljg2ODE2Yy4xMTgxNC4yNTk3Ny4wNDM5NS41NjY0MS0uMTc4NzEuNzQ1MTItLjIyMjY2LjE3NzczLS41MzYxMy4xODI2Mi0uNzY2Ni4wMTE3MmwtNS4zNDk2MS00LjAyMTQ4LTEuNzA1MDgsMy43NzgzMmMtLjEwMzUyLjIzMTQ1LS4zMzEwNS4zNjgxNi0uNTY5MzQuMzY4MTZabTIuODAwNzgtNS4zMTQ0NWwzLjYyODkxLDIuNzI3NTQtMi40Mjk2OS01LjM4NTc0LTEuMTk5MjIsMi42NTgyWiIvPjxwYXRoIGNsYXNzPSJ1dWlkLTY5OThmYTIyLWVjOWEtNGUyZi05ZDBkLWY0YmMzMzYxZTgwZSIgZD0ibTE5LDMwLjEyNWMtNi4xMzQ3NywwLTExLjEyNS00Ljk5MDIzLTExLjEyNS0xMS4xMjVzNC45OTAyMy0xMS4xMjUsMTEuMTI1LTExLjEyNSwxMS4xMjUsNC45OTAyMywxMS4xMjUsMTEuMTI1LTQuOTkwMjMsMTEuMTI1LTExLjEyNSwxMS4xMjVabTAtMjFjLTUuNDQ1MzEsMC05Ljg3NSw0LjQyOTY5LTkuODc1LDkuODc1czQuNDI5NjksOS44NzUsOS44NzUsOS44NzUsOS44NzUtNC40Mjk2OSw5Ljg3NS05Ljg3NS00LjQyOTY5LTkuODc1LTkuODc1LTkuODc1WiIvPjwvc3ZnPg==',
      prerequisites: [
        t('You have completed the Ansible Automation Platform installation.'),
        t('You have a valid Ansible Automation Platform subscription.'),
      ],
      description: t(
        'Create a team and associate organizations and roles to that team.\n\nPersona: Platform Administrator'
      ),
      introduction: t(
        "You'll create a team and associate organizations and roles as needed in this quick start."
      ),
      tasks: [
        {
          title: t('Create teams'),
          description: t(
            '##To create teams:\n\nYou can create new teams and manage the users and organizations associated with each team. \nUsers associated with a team inherit the permissions associated with the team and any organization permissions to which the team has membership. \nTo add a user to a team, the user must have already been created.\n\n1. From the navigational panel, select **Access Management** > **Teams**.\n2. Click **Create team**.\n3. Enter the appropriate details into the required fields.\n4. Select an organization from the **Organization** list to which you want to associate this team.\n5. Select the users from the **Users** list that you want to include as members of this team.\n6. Click **Create team**. The **Details** page opens, where you can review and edit your team information.'
          ),
          review: {
            instructions: t(
              "#### To verify that you've added a team:\nDid the **Details** page open after creating the team?\nIs the team listed on the **Teams** list view?"
            ),
            failedTaskHelp: t(
              'Try the steps again. For more information, see [Managing teams](https://docs.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.5/html-single/using_automation_execution/access_management_and_authentication/index#assembly-controller-teams).'
            ),
          },
          summary: {
            success: t('You have viewed the details of your user!'),
            failed: undefined,
          },
        },
      ],
      conclusion: t(
        'You successfully completed the creating a team steps! If you want to learn how to create a user, take the **Create users** quick start.'
      ),
      nextQuickStart: ['create-users'],
    },
  };
  return qsData;
}
