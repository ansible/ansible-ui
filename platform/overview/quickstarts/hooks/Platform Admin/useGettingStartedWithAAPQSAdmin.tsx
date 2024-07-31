import { QuickStart } from '@patternfly/quickstarts';
import { useTranslation } from 'react-i18next';

export function useGettingStartedWithAAPQSAdmin() {
  const { t } = useTranslation();

  const qsData: QuickStart = {
    metadata: {
      name: 'getting started with Ansible Automation Platform - Platform Administrator',
      instructional: true,
    },
    spec: {
      displayName: t('Getting started with Ansible Automation Platform - Platform Administrator'),
      durationMinutes: 20,
      type: {
        text: t('Platform'),
        color: 'grey',
      },
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJ1dWlkLTc3OWYyYTc5LTdiYzMtNDY1MS1hYTkwLWUwMTIwZTI1NWFlMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMzggMzgiPjxkZWZzPjxzdHlsZT4udXVpZC02OTk4ZmEyMi1lYzlhLTRlMmYtOWQwZC1mNGJjMzM2MWU4MGV7ZmlsbDojZTAwO30udXVpZC0yYTAxZDA0Yy04OWQ0LTQ4YmEtYTJkOC01MTAzNDIxNWRhOWJ7ZmlsbDojZmZmO30udXVpZC1hMTkyMjZlOC1iNzFmLTQ4MWMtODE1Zi0xZWQ2MGY0MzYzYTZ7ZmlsbDojNGQ0ZDRkO308L3N0eWxlPjwvZGVmcz48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHJ4PSI5IiByeT0iOSIvPjxwYXRoIGNsYXNzPSJ1dWlkLWExOTIyNmU4LWI3MWYtNDgxYy04MTVmLTFlZDYwZjQzNjNhNiIgZD0ibTI4LDIuMjVjNC4yNzMzOCwwLDcuNzUsMy40NzY2NCw3Ljc1LDcuNzV2MThjMCw0LjI3MzM2LTMuNDc2NjIsNy43NS03Ljc1LDcuNzVIMTBjLTQuMjczMzgsMC03Ljc1LTMuNDc2NjQtNy43NS03Ljc1VjEwYzAtNC4yNzMzNiwzLjQ3NjYyLTcuNzUsNy43NS03Ljc1aDE4bTAtMS4yNUgxMEM1LjAyOTQyLDEsMSw1LjAyOTQ0LDEsMTB2MThjMCw0Ljk3MDU3LDQuMDI5NDIsOSw5LDloMThjNC45NzA1OCwwLDktNC4wMjk0Myw5LTlWMTBjMC00Ljk3MDU2LTQuMDI5NDItOS05LTloMFoiLz48cGF0aCBjbGFzcz0idXVpZC0yYTAxZDA0Yy04OWQ0LTQ4YmEtYTJkOC01MTAzNDIxNWRhOWIiIGQ9Im0xNSwyMy42MjVjLS4wODU5NCwwLS4xNzM4My0uMDE3NTgtLjI1Njg0LS4wNTU2Ni0uMzE0NDUtLjE0MTYtLjQ1NTA4LS41MTE3Mi0uMzEyNS0uODI2MTdsMi4wMjA1MS00LjQ4MTQ1Yy4wMDI5My0uMDA1ODYuMDA1ODYtLjAxMTcyLjAwNzgxLS4wMTc1OGwxLjk3MTY4LTQuMzY5MTRjLjIwMTE3LS40NDkyMi45Mzc1LS40NDkyMiwxLjEzODY3LDBsNCw4Ljg2ODE2Yy4xMTgxNC4yNTk3Ny4wNDM5NS41NjY0MS0uMTc4NzEuNzQ1MTItLjIyMjY2LjE3NzczLS41MzYxMy4xODI2Mi0uNzY2Ni4wMTE3MmwtNS4zNDk2MS00LjAyMTQ4LTEuNzA1MDgsMy43NzgzMmMtLjEwMzUyLjIzMTQ1LS4zMzEwNS4zNjgxNi0uNTY5MzQuMzY4MTZabTIuODAwNzgtNS4zMTQ0NWwzLjYyODkxLDIuNzI3NTQtMi40Mjk2OS01LjM4NTc0LTEuMTk5MjIsMi42NTgyWiIvPjxwYXRoIGNsYXNzPSJ1dWlkLTY5OThmYTIyLWVjOWEtNGUyZi05ZDBkLWY0YmMzMzYxZTgwZSIgZD0ibTE5LDMwLjEyNWMtNi4xMzQ3NywwLTExLjEyNS00Ljk5MDIzLTExLjEyNS0xMS4xMjVzNC45OTAyMy0xMS4xMjUsMTEuMTI1LTExLjEyNSwxMS4xMjUsNC45OTAyMywxMS4xMjUsMTEuMTI1LTQuOTkwMjMsMTEuMTI1LTExLjEyNSwxMS4xMjVabTAtMjFjLTUuNDQ1MzEsMC05Ljg3NSw0LjQyOTY5LTkuODc1LDkuODc1czQuNDI5NjksOS44NzUsOS44NzUsOS44NzUsOS44NzUtNC40Mjk2OSw5Ljg3NS05Ljg3NS00LjQyOTY5LTkuODc1LTkuODc1LTkuODc1WiIvPjwvc3ZnPg==',
      prerequisites: [
        t('You have completed the Ansible Automation Platform installation.'),
        t('You have a valid Ansible Automation Platform subscription.'),
      ],
      description: t('Learn how to get started with Ansible Automation Platform'),
      introduction: t('Get started with Ansible Automation Platform as a platform administrator.'),
      tasks: [
        {
          title: t('Configure authentication'),
          description: t(
            "##To configure authentication:\n\nAfter you have logged in and configured your administrator credentials, you must configure authentication for your users. \nDepending on your organization's needs and resources, you can either:\n\n  - Add users and teams manually.\n  - Add users and teams through social authentication, using identity providers such as LDAP."
          ),
        },
        {
          title: t('Review roles'),
          description: t(
            '##To review roles:\n\nRoles are units of organization in the Ansible Automation Platform. \nWhen you assign a role to a team or user, you are granting access to use, read, or write credentials. \nBecause of the file structure associated with a role, roles become redistributable units that enable you to share behavior among resources, or with other users. All access that is granted to use, read, or write credentials is handled through roles, and roles are defined for a resource.\n\nRoles are separated out by service through automation controller, Event-Driven Ansible, and automation hub. \n\nFor more information, see the quick start **Review roles**.'
          ),
        },
        {
          title: t('Create an organization'),
          description: t(
            '##To create organizations:\n\nAnsible Automation Platform automatically creates a default organization. \nIf you have a Self-support level license, you have only the default organization available and must not delete it. \n\nYou can use the default organization as it is initially set up and edit it later. \n\n1. From the navigation panel, select **Access Management** > **Organizations**.\n2. Click **Create organization**.\n3. Enter the appropriate details into the required fields.\n4. Click **Create organization**.\nThe **Details** page opens, where you can review and edit your organization information.'
          ),
          review: {
            instructions: t(
              "#### To verify that you've added an organization:\nDid the **Details** page open after creating the organization?\nIs the organization listed on the **Organizations** list view?"
            ),
            failedTaskHelp: t(
              'Try the steps again. For more information, see [Organizations](https://docs.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.5/html-single/access_management_and_authentication/index#assembly-controller-organizations).'
            ),
          },
          summary: {
            success: t('You have viewed the details of your organization!'),
            failed: undefined,
          },
        },
        {
          title: t('Create teams'),
          description: t(
            '##To create teams:\n\nYou can create new teams and manage the users and organizations associated with each team. \nUsers associated with a team inherit the permissions associated with the team and any organization permissions to which the team has membership. \nTo add a user to a team, the user must have already been created.\n\n1. From the navigational panel, select **Access Management** > **Teams**.\n2. Click **Create team**.\n3. Enter the appropriate details into the required fields.\n4. Select an organization from the **Organization** list to which you want to associate this team.\n5. Select the users from the **Users** list that you want to include as members of this team.\n6. Click **Create team**. The **Details** page opens, where you can review and edit your team information.'
          ),
          review: {
            instructions: t(
              "#### To verify that you've added a team:\nDid the **Details** page open after creating the team?\nIs the team listed on the **Teams** list view?"
            ),
            failedTaskHelp: t('Try the steps again.'),
          },
          summary: {
            success: t('You have viewed the details of your user!'),
            failed: undefined,
          },
        },
        {
          title: t('Create users'),
          description: t(
            '##To create users:\n\n1. From the navigational panel, select **Access Management** > **Users**.\n2. Click **Create user**.\n3. Enter the appropriate details into the required fields.\n\n  [If you are modifying your own password, log out and log back in again for it to take effect.]{{admonition note}}\n\n4. Select the **User type**. You can select the following options:\n\n    - **Normal user**: Normal users have read and write access limited to the resources (such as inventory, projects, and job templates) for which that user has been granted the appropriate roles and privileges.\n    - **System administrator**: System administrators have full access to the system and can manage other users.\n\n5. Optional: Select the **Organizations** and **Teams** to be assigned for this user.\n6. Click **Create user**. \nThe **Details** page opens, where you can review and edit your user information.'
          ),
          review: {
            instructions: t(
              "#### To verify that you've added a user:\nDid the **Details** page open after creating the user?\nIs the user listed on the **Users** list view?"
            ),
            failedTaskHelp: t('Try the steps again.'),
          },
          summary: {
            success: t('You have viewed the details of your user!'),
            failed: undefined,
          },
        },
        {
          title: t('Add a user, administrator, or team to an organization'),
          description: t(
            '##To add a user, administrator, or team to an organization:\n\n1. From the **Organizations** list view, select the organization to which you want to add a user, administrator, or team. \n2. Click the **Users** tab to add users, click the **Administrators** tab to add administrators, or click the **Team** tab to add teams.\n3. Select one or more users, administrators, or teams from the list by clicking the checkbox next to the name to add them as members.\n4. Click **Next**.\n5. Select the role you want the selected user, administrator, or team to have. \n6. Click **Save** on the **Review** screen to apply the roles to the selected user, administrator, or team, and to add them as members. \nThe **Add Users**, **Add Administrators**, or **Add Teams** window displays the updated roles assigned for each user and team.\n\n[A user, administrator, or team with associated roles retains them if they are reassigned to another organization.]{{admonition note}}'
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
