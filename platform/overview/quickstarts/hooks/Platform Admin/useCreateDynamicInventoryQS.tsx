import { QuickStart } from '@patternfly/quickstarts';
import { useTranslation } from 'react-i18next';

export function useCreateDynamicInventoryQS() {
  const { t } = useTranslation();

  const qsData: QuickStart = {
    metadata: {
      name: 'dynamic-inventory',
      instructional: true,
    },
    spec: {
      displayName: t('Creating a dynamic inventory'),
      durationMinutes: 10,
      type: {
        text: t('Automation Execution'),
        color: 'grey',
      },
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJ1dWlkLWFlOWM1NjUwLTFhYTAtNDBhYi04M2EyLTEzODgxMTEyNDE4OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMzggMzgiPjxkZWZzPjxzdHlsZT4udXVpZC0zNzU1MDdkZS1lMmQ3LTQzNmQtYjQ3ZC1mYmNkZWI4MTIzNmZ7ZmlsbDojZTAwO30udXVpZC1lYjcyNzUxYy1mZTVlLTQ1NGMtOGQwZi02MWE2ZGM0MGUyYmF7ZmlsbDojZmZmO30udXVpZC1iZDJiZTdjNS04NmY2LTRkMWUtOGIxMi01NGZiM2Y5MDE4YTB7ZmlsbDojZTBlMGUwO308L3N0eWxlPjwvZGVmcz48cGF0aCBjbGFzcz0idXVpZC1lYjcyNzUxYy1mZTVlLTQ1NGMtOGQwZi02MWE2ZGM0MGUyYmEiIGQ9Im0yOCwxSDEwQzUuMDI5NDQsMSwxLDUuMDI5NDQsMSwxMHYxOGMwLDQuOTcwNTcsNC4wMjk0NCw5LDksOWgxOGM0Ljk3MDU2LDAsOS00LjAyOTQzLDktOVYxMGMwLTQuOTcwNTYtNC4wMjk0NC05LTktOWgwWiIvPjxwYXRoIGNsYXNzPSJ1dWlkLWJkMmJlN2M1LTg2ZjYtNGQxZS04YjEyLTU0ZmIzZjkwMThhMCIgZD0ibTI4LDIuMjVjNC4yNzMzMiwwLDcuNzUsMy40NzY2NCw3Ljc1LDcuNzV2MThjMCw0LjI3MzM2LTMuNDc2NjgsNy43NS03Ljc1LDcuNzVIMTBjLTQuMjczMzIsMC03Ljc1LTMuNDc2NjQtNy43NS03Ljc1VjEwYzAtNC4yNzMzNiwzLjQ3NjY4LTcuNzUsNy43NS03Ljc1aDE4bTAtMS4yNUgxMEM1LjAyOTQyLDEsMSw1LjAyOTQzLDEsMTB2MThjMCw0Ljk3MDU3LDQuMDI5NDIsOSw5LDloMThjNC45NzA1OCwwLDktNC4wMjk0Myw5LTlWMTBjMC00Ljk3MDU3LTQuMDI5NDItOS05LTloMFoiLz48cGF0aCBjbGFzcz0idXVpZC0zNzU1MDdkZS1lMmQ3LTQzNmQtYjQ3ZC1mYmNkZWI4MTIzNmYiIGQ9Im0yMywxMi4zNzVoLS43NzEyNGMtLjA4NTY5LS40NDMzLS4yNTczMi0uODU2MTQtLjUwMTk1LTEuMjE3MWwuNTQzNy0uNTQzNjRjLjI0MzE2LS4yNDQxNC4yNDMxNi0uNjQwNjIsMC0uODg0NzctLjI0NDE0LS4yNDQxNC0uNjQwNjItLjI0NDE0LS44ODQ3NywwbC0uNTQzNy41NDM2NGMtLjM2MDg0LS4yNDQ1Ny0uNzczNjgtLjQxNjItMS4yMTcwNC0uNTAxODl2LS43NzEyNGMwLS4zNDQ3My0uMjgwMjctLjYyNS0uNjI1LS42MjVzLS42MjUuMjgwMjctLjYyNS42MjV2Ljc3MTI0Yy0uNDQzMzYuMDg1NjktLjg1NjIuMjU3MzItMS4yMTcwNC41MDE4OWwtLjU0MzctLjU0MzY0Yy0uMjQ0MTQtLjI0NDE0LS42NDA2Mi0uMjQ0MTQtLjg4NDc3LDAtLjI0MzE2LjI0NDE0LS4yNDMxNi42NDA2MiwwLC44ODQ3N2wuNTQzNy41NDM2NGMtLjI0NDYzLjM2MDk2LS40MTYyNi43NzM4LS41MDE5NSwxLjIxNzFoLS43NzEyNGMtLjM0NDczLDAtLjYyNS4yODAyNy0uNjI1LjYyNXMuMjgwMjcuNjI1LjYyNS42MjVoLjc3MTI0Yy4wODU2OS40NDMzLjI1NzMyLjg1NjE0LjUwMTk1LDEuMjE3MWwtLjU0MzcuNTQzNjRjLS4yNDMxNi4yNDQxNC0uMjQzMTYuNjQwNjIsMCwuODg0NzcuMTIyMDcuMTIyMDcuMjgyMjMuMTgyNjIuNDQyMzguMTgyNjJzLjMyMDMxLS4wNjA1NS40NDIzOC0uMTgyNjJsLjU0MzctLjU0MzY0Yy4zNjA4NC4yNDQ1Ny43NzM2OC40MTYyLDEuMjE3MDQuNTAxODl2Ljc3MTI0YzAsLjM0NDczLjI4MDI3LjYyNS42MjUuNjI1cy42MjUtLjI4MDI3LjYyNS0uNjI1di0uNzcxMjRjLjQ0MzM2LS4wODU2OS44NTYyLS4yNTczMiwxLjIxNzA0LS41MDE4OWwuNTQzNy41NDM2NGMuMTIyMDcuMTIyMDcuMjgyMjMuMTgyNjIuNDQyMzguMTgyNjJzLjMyMDMxLS4wNjA1NS40NDIzOC0uMTgyNjJjLjI0MzE2LS4yNDQxNC4yNDMxNi0uNjQwNjIsMC0uODg0NzdsLS41NDM3LS41NDM2NGMuMjQ0NjMtLjM2MDk2LjQxNjI2LS43NzM4LjUwMTk1LTEuMjE3MWguNzcxMjRjLjM0NDczLDAsLjYyNS0uMjgwMjcuNjI1LS42MjVzLS4yODAyNy0uNjI1LS42MjUtLjYyNVptLTQsMi42NjY5OWMtMS4xMjU5OCwwLTIuMDQxOTktLjkxNjAyLTIuMDQxOTktMi4wNDE5OXMuOTE2MDItMi4wNDE5OSwyLjA0MTk5LTIuMDQxOTksMi4wNDE5OS45MTYwMiwyLjA0MTk5LDIuMDQxOTktLjkxNjAyLDIuMDQxOTktMi4wNDE5OSwyLjA0MTk5WiIvPjxwYXRoIGNsYXNzPSJ1dWlkLTM3NTUwN2RlLWUyZDctNDM2ZC1iNDdkLWZiY2RlYjgxMjM2ZiIgZD0ibTI4LDI4LjYyNWgtNGMtLjM0NDczLDAtLjYyNS0uMjgwMjctLjYyNS0uNjI1di00YzAtLjM0NDczLjI4MDI3LS42MjUuNjI1LS42MjVoNGMuMzQ0NzMsMCwuNjI1LjI4MDI3LjYyNS42MjV2NGMwLC4zNDQ3My0uMjgwMjcuNjI1LS42MjUuNjI1Wm0tMy4zNzUtMS4yNWgyLjc1di0yLjc1aC0yLjc1djIuNzVaIi8+PHBhdGggY2xhc3M9InV1aWQtMzc1NTA3ZGUtZTJkNy00MzZkLWI0N2QtZmJjZGViODEyMzZmIiBkPSJtMjEsMjguNjI1aC00Yy0uMzQ0NzMsMC0uNjI1LS4yODAyNy0uNjI1LS42MjV2LTRjMC0uMzQ0NzMuMjgwMjctLjYyNS42MjUtLjYyNWg0Yy4zNDQ3MywwLC42MjUuMjgwMjcuNjI1LjYyNXY0YzAsLjM0NDczLS4yODAyNy42MjUtLjYyNS42MjVabS0zLjM3NS0xLjI1aDIuNzV2LTIuNzVoLTIuNzV2Mi43NVoiLz48cGF0aCBjbGFzcz0idXVpZC0zNzU1MDdkZS1lMmQ3LTQzNmQtYjQ3ZC1mYmNkZWI4MTIzNmYiIGQ9Im0xNCwyOC42MjVoLTRjLS4zNDQ3MywwLS42MjUtLjI4MDI3LS42MjUtLjYyNXYtNGMwLS4zNDQ3My4yODAyNy0uNjI1LjYyNS0uNjI1aDRjLjM0NDczLDAsLjYyNS4yODAyNy42MjUuNjI1djRjMCwuMzQ0NzMtLjI4MDI3LjYyNS0uNjI1LjYyNVptLTMuMzc1LTEuMjVoMi43NXYtMi43NWgtMi43NXYyLjc1WiIvPjxwYXRoIGQ9Im0yNiwyMC4zNzVoLTYuMzc1di0xLjM3NWMwLS4zNDQ3My0uMjgwMjctLjYyNS0uNjI1LS42MjVzLS42MjUuMjgwMjctLjYyNS42MjV2MS4zNzVoLTYuMzc1Yy0uMzQ0NzMsMC0uNjI1LjI4MDI3LS42MjUuNjI1cy4yODAyNy42MjUuNjI1LjYyNWgxNGMuMzQ0NzMsMCwuNjI1LS4yODAyNy42MjUtLjYyNXMtLjI4MDI3LS42MjUtLjYyNS0uNjI1WiIvPjwvc3ZnPg==',
      prerequisites: [
        t('You have completed the initial setup of Ansible Automation Platform.'),
        t('You have a valid Ansible Automation Platform subscription.'),
      ],
      description: t('Create or view a dynamic inventory\n\nPersona: Platform administrator'),
      introduction: t(
        '\nUse built-in Automation Execution inventory plugins to source your existing resource, or Amazon Web Services (AWS), Microsoft Azure, and Google Compute Engine (GCP) resources into a dynamic inventory and get to automation quickly.'
      ),
      tasks: [
        {
          title: t('Create a credential to connect your resources to Automation Execution'),
          description: t(
            '##To create a credential to connect your resources to Automation Execution (Automation controller):\n\n1. From the navigation panel, select **Automation Execution** > **Infrastructure** > **Credentials**.\n2. Click **Create credential**. \n3. Enter the appropriate details into the following fields:\n    - **Name**: Give your credential a unique name.\n    - Optional: **Description**\n    - Optional: **Organization**\n    - **Credential type**: Select your chosen source.\n    - Enter the relevant information for your chosen source.\n    For more information on your chosen credential type, see [Credential types](https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html-single/using_automation execution/index#ref-controller-credential-types).\n4. Click **Create credential**.'
          ),
          review: {
            instructions: t(
              "#### To verify that you've created a credential:\nDoes your credential appear in the **Credentials** list view?"
            ),
            failedTaskHelp: t(
              'Try the steps again or read more about this topic at [Creating new credentials](https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html-single/using_automation_execution/index#creating-credentials).'
            ),
          },
          summary: {
            success: t('You have viewed the details of your credential!'),
            failed: undefined,
          },
        },
        {
          title: t('Set up an inventory source under a newly created inventory'),
          description: t(
            "##To set up an inventory source under a newly created inventory:\n\nAfter you've created your credential, you're ready to create your dynamic inventory.\n\n1. From the navigation panel, select **Automation Execution** > **Infrastructure** > **Inventories**. \nThe **Inventories** window displays a list of the inventories that are currently available.\n2. Click **Create inventory**, and select **Create inventory** from the list.\n3. Enter the appropriate details into the following fields:\n    - **Name**: Give a unique name for your inventory.\n    - **Description**: Optionally, write a description for your inventory.\n    - **Organization**: Select an organization to associate with the inventory.\n    - **Instance Groups**: Optionally, select the instance groups for this inventory to run on.\n    - **Labels**: Optional labels that describe this inventory, such as 'dev' or 'test'. \n    Use labels to group and filter inventories and completed jobs.\n    - **Variables**: Optionally, enter variables. They must be in JSON or YAML syntax. Use the radio button to toggle between the two.\n4. Click **Create inventory**. \n5. In your newly created inventory, click the **Sources** tab.\n6. Click **Add source**.\n7. In the **Add new source** form, complete the required fields:\n    - **Name**: Give a unique name for your source.\n    - **Source**: Select your existing source, an [Amazon EC2](https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html-single/automation_controller_user_guide/index#ref-controller-inventory-sources), [Google Compute Engine](https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html-single/automation_controller_user_guide/index#ref-controller-inventory-sources), or a [Microsoft Azure Resource Manager](https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html-single/automation_controller_user_guide/index#proc-controller-azure-resource-manager) source.\n    - **Credential**: Select the credential you created in task 1.\n    - **Source Variables**: The source for your resources have additional parameters you can add to the **Source Variables** section. \n    See your source documentation for more information.    \n8. Click **Save**.\n9. Click **Launch inventory update** in the inventory **Details** tab to sync your instances into this inventory."
          ),
          review: {
            instructions: t(
              '#### To verify that your inventory has synced correctly:\nCheck the status of your inventory sync in the **Inventores list** view. \nDoes the status say **Success**?'
            ),
            failedTaskHelp: t(
              'Try the steps again or read more about this topic at [Add a new inventory](https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html-single/automation_controller_user_guide/index#proc-controller-adding-new-inventory).'
            ),
          },
          summary: {
            success: t('You have viewed the details of your inventory!'),
            failed: undefined,
          },
        },
      ],
      conclusion: t(
        'You successfully completed the creating a dynamic inventory steps for Ansible Automation Platform!'
      ),
    },
  };
  return qsData;
}
