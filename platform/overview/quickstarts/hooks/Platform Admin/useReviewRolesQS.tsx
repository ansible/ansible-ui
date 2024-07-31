import { QuickStart } from '@patternfly/quickstarts';
import { useTranslation } from 'react-i18next';

export function useReviewRolesQS() {
  const { t } = useTranslation();

  const qsData: QuickStart = {
    metadata: {
      name: 'review-roles',
      instructional: true,
    },
    spec: {
      displayName: t('Review roles'),
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
        'Review roles and create new roles as needed by your organization.\n\nPersona: Platform Administrator'
      ),
      introduction: t(
        'Roles are units of organization in the Ansible Automation Platform. When you assign a role to a team or user, you are granting access to use, read, or write credentials. Because of the file structure associated with a role, roles become redistributable units that enable you to share behavior among resources, or with other users. All access that is granted to use, read, or write credentials is handled through roles, and roles are defined for a resource.'
      ),
      tasks: [
        {
          title: t('Review an Automation Execution role'),
          description: t(
            '##To review Automation Execution roles:\n \n You can display the set of roles assigned for automation execution resources by using **Access Management**. \n From here, you can also sort or search the roles list, and create, edit, or delete automation execution roles. \n\n 1. From the navigation panel, select **Access Management** > **Roles**.\n 2. Select the **Automation Execution** tab. \n 3. From the table header, you can sort the list of roles by using the arrows for **Name**, **Description**, **Created** and **Editable** or by making sort selections in the Sort list.\n 4. You can filter the list of roles by selecting **Name** or **Editable** from the filter list and clicking the arrow.  '
          ),
        },
        {
          title: t('Review an Automation Decision role'),
          description: t(
            '##To review an Automation Decision role:\n\nYou can display the set of roles assigned for automation decision resources by using **Access Management**. \nFrom here, you can also sort or search the roles list, and create, edit, or delete automation decision roles.\n\n1. From the navigation panel, select **Access Management** > **Roles**.\n2. Select the **Automation Decisions** tab.\n3. From the table header, you can sort the list of roles by using the arrows for **Name**, **Description**, **Created** and **Editable** or by making sort selections in the Sort list.\n4. You can filter the list of roles by selecting **Name** or **Editable** from the filter list and clicking the arrow.  '
          ),
        },
        {
          title: t('Review an Automation Content role'),
          description: t(
            '##To review an Automation Content role:\n\nYou can display the set of roles assigned for automation decision resources by using **Access Management**. \nFrom here, you can also sort or search the roles list, and create, edit, or delete automation content roles.\n\n1. From the navigation panel, select **Access Management** > **Roles**.\n2. Select the **Automation Content** tab.\n3. From the table header, you can sort the list of roles by using the arrows for **Name**, **Description**, **Created** and **Editable** or by making sort selections in the Sort list.\n4. You can filter the list of roles by selecting **Name** or **Editable** from the filter list and clicking the arrow.  \n**Role type** can be filtered for Galaxy-only roles or All roles.'
          ),
        },
        {
          title: t('Create an Automation Execution role'),
          description: t(
            '##To create Automation Execution roles:\n\nAutomation controller provides a set of predefined roles with permissions sufficient for standard automation execution tasks. \nIt is also possible to configure custom roles, and assign one or more permission filters to them. \nPermission filters define the actions allowed for a specific resource type.\n\n1. From the navigation panel, select Access Management > Roles.\n2. Select the **Automation Execution** tab and click **Create role**.\n3. Provide a name and optionally include a description for the role.\n4. Select a **Content** type. \n5. Select the **Permissions** you want assigned to this role.\n6. Click **Create role**.'
          ),
          review: {
            instructions: t(
              "#### To verify that you've added an Automation Execution role:\nIs the role listed on the **Roles** list view?"
            ),
            failedTaskHelp: t('Try the steps again.'),
          },
          summary: {
            success: t('You have viewed the details of your role!'),
            failed: undefined,
          },
        },
        {
          title: t('Create an Automation Decision role'),
          description: t(
            '##To create Automation Decision roles:\n\nEvent-Driven Ansible provides a set of predefined roles with permissions sufficient for standard automation decision tasks. \nIt is also possible to configure custom roles, and assign one or more permission filters to them. \nPermission filters define the actions allowed for a specific resource type.\n\n1. From the navigation panel, select **Access Management** > **Roles**.\n2. Select the **Automation Decisions** tab and click **Create role**.\n3. Provide a name and optionally include a description for the role.\n4. Select a **Content** type. \n5. Select the **Permissions** you want assigned to this role.\n6. Click **Create role**.'
          ),
          review: {
            instructions: t(
              "#### To verify that you've added an Automation Decision role:\nIs the role listed on the **Roles** list view?"
            ),
            failedTaskHelp: t('Try the steps again.'),
          },
          summary: {
            success: t('You have viewed the details of your role!'),
            failed: undefined,
          },
        },
        {
          title: t('Create an Automation Content role'),
          description: t(
            '##To create Automation Content roles:\n\nAutomation hub provides a set of predefined roles with permissions enough for standard automation decision tasks. \nIt is also possible to configure custom roles, and assign one or more permission filters to them. \nPermission filters define the actions allowed for a specific resource type.\n\n1. From the navigation panel, select **Access Management** > **Roles**.\n2. Select the **Automation Content** tab and click **Create role**.\n3. Give a name and optionally include a description for the role.\n4. Select a **Content** type. \n5. Select the **Permissions** you want assigned to this role.\n6. Click **Create role**.'
          ),
          review: {
            instructions: t(
              "#### To verify that you've added an Automation Content role:\nIs the role listed on the **Roles** list view?"
            ),
            failedTaskHelp: t('Try the steps again.'),
          },
          summary: {
            success: t('You have viewed the details of your role!'),
            failed: undefined,
          },
        },
      ],
      conclusion: t(
        'You successfully completed the review roles steps for Ansible Automation Platform!'
      ),
    },
  };
  return qsData;
}
