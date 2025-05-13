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
        text: t('Platform administrator'),
        color: 'grey',
      },
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJ1dWlkLWFlMzcyZWFiLWE3YjktNDU4ZC04MzkwLWI5OWZiNzhmYzFlNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMzggMzgiPjxwYXRoIGQ9Im0yOCwxSDEwQzUuMDI5NDIsMSwxLDUuMDI5NDIsMSwxMHYxOGMwLDQuOTcwNTgsNC4wMjk0Miw5LDksOWgxOGM0Ljk3MDU4LDAsOS00LjAyOTQyLDktOVYxMGMwLTQuOTcwNTgtNC4wMjk0Mi05LTktOVptNy43NSwyN2MwLDQuMjczMzgtMy40NzY2OCw3Ljc1LTcuNzUsNy43NUgxMGMtNC4yNzMzMiwwLTcuNzUtMy40NzY2Mi03Ljc1LTcuNzVWMTBjMC00LjI3MzM4LDMuNDc2NjgtNy43NSw3Ljc1LTcuNzVoMThjNC4yNzMzMiwwLDcuNzUsMy40NzY2Miw3Ljc1LDcuNzV2MThaIi8+PHBhdGggZD0ibTE0LDEwLjQ3NTU5aC0zYy0uMzQ0NzMsMC0uNjI1LjI4MDI3LS42MjUuNjI1djNjMCwuMzQ0NzMuMjgwMjcuNjI1LjYyNS42MjVoM2MuMzQ0NzMsMCwuNjI1LS4yODAyNy42MjUtLjYyNXYtM2MwLS4zNDQ3My0uMjgwMjctLjYyNS0uNjI1LS42MjVabS0uNjI1LDNoLTEuNzV2LTEuNzVoMS43NXYxLjc1WiIvPjxwYXRoIGQ9Im0yNywxMC40NzU1OWgtM2MtLjM0NDczLDAtLjYyNS4yODAyNy0uNjI1LjYyNXYzYzAsLjM0NDczLjI4MDI3LjYyNS42MjUuNjI1aDNjLjM0NDczLDAsLjYyNS0uMjgwMjcuNjI1LS42MjV2LTNjMC0uMzQ0NzMtLjI4MDI3LS42MjUtLjYyNS0uNjI1Wm0tLjYyNSwzaC0xLjc1di0xLjc1aDEuNzV2MS43NVoiLz48cGF0aCBkPSJtMjcsMjMuNDc1NTloLTNjLS4zNDQ3MywwLS42MjUuMjgwMjctLjYyNS42MjV2M2MwLC4zNDQ3My4yODAyNy42MjUuNjI1LjYyNWgzYy4zNDQ3MywwLC42MjUtLjI4MDI3LjYyNS0uNjI1di0zYzAtLjM0NDczLS4yODAyNy0uNjI1LS42MjUtLjYyNVptLS42MjUsM2gtMS43NXYtMS43NWgxLjc1djEuNzVaIi8+PHBhdGggZD0ibTE0LDIzLjQ3NTU5aC0zYy0uMzQ0NzMsMC0uNjI1LjI4MDI3LS42MjUuNjI1djNjMCwuMzQ0NzMuMjgwMjcuNjI1LjYyNS42MjVoM2MuMzQ0NzMsMCwuNjI1LS4yODAyNy42MjUtLjYyNXYtM2MwLS4zNDQ3My0uMjgwMjctLjYyNS0uNjI1LS42MjVabS0uNjI1LDNoLTEuNzV2LTEuNzVoMS43NXYxLjc1WiIvPjxwYXRoIGQ9Im0yMS4xNTUyNywxMC43NDcwN2MtMS40MDQzLS4zNTkzOC0yLjkwNjI1LS4zNTkzOC00LjMxMDU1LDAtLjMzMzk4LjA4NTk0LS41MzYxMy40MjY3Ni0uNDUwMi43NjA3NC4wODQ5Ni4zMzMwMS40MjI4NS41MzkwNi43NjA3NC40NTAyLDEuMjAzMTItLjMwODU5LDIuNDg2MzMtLjMwODU5LDMuNjg5NDUsMCwuMDUxNzYuMDEzNjcuMTA0NDkuMDE5NTMuMTU1MjcuMDE5NTMuMjc5MywwLC41MzMyLS4xODc1LjYwNTQ3LS40Njk3My4wODU5NC0uMzMzOTgtLjExNjIxLS42NzQ4LS40NTAyLS43NjA3NFoiLz48cGF0aCBkPSJtMTEuNDA3MjMsMTYuNDk1MTJjLS4zMzY5MS0uMDg5ODQtLjY3NDguMTE3MTktLjc2MDc0LjQ1MDItLjE3OTY5LjcwMTE3LS4yNzE0OCwxLjQyNjc2LS4yNzE0OCwyLjE1NTI3LDAsLjcyNzU0LjA5MTgsMS40NTMxMi4yNzE0OCwyLjE1NTI3LjA3MjI3LjI4MjIzLjMyNjE3LjQ2OTczLjYwNTQ3LjQ2OTczLjA1MDc4LDAsLjEwMzUyLS4wMDU4Ni4xNTUyNy0uMDE5NTMuMzMzOTgtLjA4NTk0LjUzNjEzLS40MjY3Ni40NTAyLS43NjA3NC0uMTU0My0uNjAxNTYtLjIzMjQyLTEuMjIxNjgtLjIzMjQyLTEuODQ0NzMsMC0uNjI0MDIuMDc4MTItMS4yNDQxNC4yMzI0Mi0xLjg0NDczLjA4NTk0LS4zMzM5OC0uMTE1MjMtLjY3NDgtLjQ1MDItLjc2MDc0WiIvPjxwYXRoIGQ9Im0yMC44NDQ3MywyNi4yNDMxNmMtMS4yMDMxMi4zMDg1OS0yLjQ4NjMzLjMwODU5LTMuNjg5NDUsMC0uMzM2OTEtLjA4Nzg5LS42NzQ4LjExNjIxLS43NjA3NC40NTAycy4xMTYyMS42NzQ4LjQ1MDIuNzYwNzRjLjcwMjE1LjE3OTY5LDEuNDI3NzMuMjcxNDgsMi4xNTUyNy4yNzE0OHMxLjQ1MzEyLS4wOTE4LDIuMTU1MjctLjI3MTQ4Yy4zMzM5OC0uMDg1OTQuNTM2MTMtLjQyNjc2LjQ1MDItLjc2MDc0LS4wODQ5Ni0uMzMzOTgtLjQyMzgzLS41MzkwNi0uNzYwNzQtLjQ1MDJaIi8+PHBhdGggZD0ibTI2LjU5Mjc3LDE2LjQ5NTEyYy0uMzM0OTYuMDg1OTQtLjUzNjEzLjQyNjc2LS40NTAyLjc2MDc0LjE1NDMuNjAwNTkuMjMyNDIsMS4yMjA3LjIzMjQyLDEuODQ0NzMsMCwuNjIzMDUtLjA3ODEyLDEuMjQzMTYtLjIzMjQyLDEuODQ0NzMtLjA4NTk0LjMzMzk4LjExNjIxLjY3NDguNDUwMi43NjA3NC4wNTE3Ni4wMTM2Ny4xMDQ0OS4wMTk1My4xNTUyNy4wMTk1My4yNzkzLDAsLjUzMzItLjE4NzUuNjA1NDctLjQ2OTczLjE3OTY5LS43MDIxNS4yNzE0OC0xLjQyNzczLjI3MTQ4LTIuMTU1MjcsMC0uNzI4NTItLjA5MTgtMS40NTQxLS4yNzE0OC0yLjE1NTI3LS4wODU5NC0uMzMzMDEtLjQyMzgzLS41NDEwMi0uNzYwNzQtLjQ1MDJaIi8+PHBhdGggZD0ibTIwLjkxMTEzLDE3LjM4NTc0YzAtMS4wNTM3MS0uODU3NDItMS45MTAxNi0xLjkxMTEzLTEuOTEwMTZzLTEuOTExMTMuODU2NDUtMS45MTExMywxLjkxMDE2YzAsLjYyNzc1LjMwODM1LDEuMTgxMDMuNzc3MjIsMS41Mjk2NmwtLjc1ODY3LDMuMDMzODFjLS4wNDY4OC4xODY1Mi0uMDA0ODguMzg0NzcuMTE0MjYuNTM2MTMuMTE4MTYuMTUxMzcuMjk5OC4yNDAyMy40OTIxOS4yNDAyM2gyLjU3MjI3Yy4xOTIzOCwwLC4zNzQwMi0uMDg4ODcuNDkyMTktLjI0MDIzLjExOTE0LS4xNTEzNy4xNjExMy0uMzQ5NjEuMTE0MjYtLjUzNjEzbC0uNzU4NjctMy4wMzM4MWMuNDY4ODctLjM0ODYzLjc3NzIyLS45MDE5Mi43NzcyMi0xLjUyOTY2Wm0tMi4zOTY0OCw0LjA4OTg0bC40ODUzNS0xLjk0MTQxLjQ4NTM1LDEuOTQxNDFoLS45NzA3Wm0uNDg1MzUtMy40Mjg3MWMtLjM2NDI2LDAtLjY2MTEzLS4yOTY4OC0uNjYxMTMtLjY2MTEzcy4yOTY4OC0uNjYwMTYuNjYxMTMtLjY2MDE2LjY2MTEzLjI5NTkuNjYxMTMuNjYwMTYtLjI5Njg4LjY2MTEzLS42NjExMy42NjExM1oiLz48L3N2Zz4=',
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
          },
        },
        {
          title: t('Create teams'),
          description: t(
            '##To create teams:\n\nYou can create new teams and manage the users and organizations associated with each team. \nUsers associated with a team inherit the permissions associated with the team and any organization permissions to which the team has membership. \nTo add a user to a team, the user must have already been created.\n\n1. From the navigational panel, select **Access Management** > **Teams**.\n2. Click **Create team**.\n3. Enter the appropriate details into the required fields.\n4. Select an organization from the **Organization** list to which you want to associate this team.\n[Each team can only be assigned to one organization.]{{admonition note}}\n5. Click **Create team**. The **Details** page opens, where you can review and edit your team information.'
          ),
          review: {
            instructions: t(
              "#### To verify that you've added a team:\nDid the **Details** page open after creating the team?\nIs the team listed on the **Teams** list view?"
            ),
            failedTaskHelp: t('Try the steps again.'),
          },
          summary: {
            success: t('You have viewed the details of your user!'),
          },
        },
        {
          title: t('Create users'),
          description: t(
            '##To create users:\n\n1. From the navigational panel, select **Access Management** > **Users**.\n2. Click **Create user**.\n3. Enter the appropriate details into the required fields.\n\n  [If you are modifying your own password, log out and log back in again for it to take effect.]{{admonition note}}\n\n4. Select the **User type**. You can select the following options:\n\n    - **Ansible Automation Platform Administrator**: An Administrator has full access to services and can manage other users.\n    - **Ansible Automation Platform Auditor**: An Auditor has view-only permissions on all objects.\n\n5. Optional: Select the **Organizations** to be assigned for this user.\n6. Click **Create user**. \nWhen the user is successfully created, the User dialog opens. \nFrom here, you can review and modify the user’s **Teams**, **Roles** and other membership details.\n\n[If the user is not newly-created, the details screen displays the last login activity of that user.]{{admonition note}}'
          ),
          review: {
            instructions: t(
              "#### To verify that you've added a user:\nDid the **Details** page open after creating the user?\nIs the user listed on the **Users** list view?"
            ),
            failedTaskHelp: t('Try the steps again.'),
          },
          summary: {
            success: t('You have viewed the details of your user!'),
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
