import { QuickStart } from '@patternfly/quickstarts';
import { useTranslation } from 'react-i18next';

export function useCreateOrganizationQS() {
  const { t } = useTranslation();

  const qsData: QuickStart = {
    metadata: {
      name: 'create-organization',
      instructional: true,
    },
    spec: {
      displayName: t('Create organization'),
      durationMinutes: 5,
      type: {
        text: t('Platform administrator'),
        color: 'grey',
      },
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJ1dWlkLWFlMzcyZWFiLWE3YjktNDU4ZC04MzkwLWI5OWZiNzhmYzFlNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMzggMzgiPjxwYXRoIGQ9Im0yOCwxSDEwQzUuMDI5NDIsMSwxLDUuMDI5NDIsMSwxMHYxOGMwLDQuOTcwNTgsNC4wMjk0Miw5LDksOWgxOGM0Ljk3MDU4LDAsOS00LjAyOTQyLDktOVYxMGMwLTQuOTcwNTgtNC4wMjk0Mi05LTktOVptNy43NSwyN2MwLDQuMjczMzgtMy40NzY2OCw3Ljc1LTcuNzUsNy43NUgxMGMtNC4yNzMzMiwwLTcuNzUtMy40NzY2Mi03Ljc1LTcuNzVWMTBjMC00LjI3MzM4LDMuNDc2NjgtNy43NSw3Ljc1LTcuNzVoMThjNC4yNzMzMiwwLDcuNzUsMy40NzY2Miw3Ljc1LDcuNzV2MThaIi8+PHBhdGggZD0ibTE0LDEwLjQ3NTU5aC0zYy0uMzQ0NzMsMC0uNjI1LjI4MDI3LS42MjUuNjI1djNjMCwuMzQ0NzMuMjgwMjcuNjI1LjYyNS42MjVoM2MuMzQ0NzMsMCwuNjI1LS4yODAyNy42MjUtLjYyNXYtM2MwLS4zNDQ3My0uMjgwMjctLjYyNS0uNjI1LS42MjVabS0uNjI1LDNoLTEuNzV2LTEuNzVoMS43NXYxLjc1WiIvPjxwYXRoIGQ9Im0yNywxMC40NzU1OWgtM2MtLjM0NDczLDAtLjYyNS4yODAyNy0uNjI1LjYyNXYzYzAsLjM0NDczLjI4MDI3LjYyNS42MjUuNjI1aDNjLjM0NDczLDAsLjYyNS0uMjgwMjcuNjI1LS42MjV2LTNjMC0uMzQ0NzMtLjI4MDI3LS42MjUtLjYyNS0uNjI1Wm0tLjYyNSwzaC0xLjc1di0xLjc1aDEuNzV2MS43NVoiLz48cGF0aCBkPSJtMjcsMjMuNDc1NTloLTNjLS4zNDQ3MywwLS42MjUuMjgwMjctLjYyNS42MjV2M2MwLC4zNDQ3My4yODAyNy42MjUuNjI1LjYyNWgzYy4zNDQ3MywwLC42MjUtLjI4MDI3LjYyNS0uNjI1di0zYzAtLjM0NDczLS4yODAyNy0uNjI1LS42MjUtLjYyNVptLS42MjUsM2gtMS43NXYtMS43NWgxLjc1djEuNzVaIi8+PHBhdGggZD0ibTE0LDIzLjQ3NTU5aC0zYy0uMzQ0NzMsMC0uNjI1LjI4MDI3LS42MjUuNjI1djNjMCwuMzQ0NzMuMjgwMjcuNjI1LjYyNS42MjVoM2MuMzQ0NzMsMCwuNjI1LS4yODAyNy42MjUtLjYyNXYtM2MwLS4zNDQ3My0uMjgwMjctLjYyNS0uNjI1LS42MjVabS0uNjI1LDNoLTEuNzV2LTEuNzVoMS43NXYxLjc1WiIvPjxwYXRoIGQ9Im0yMS4xNTUyNywxMC43NDcwN2MtMS40MDQzLS4zNTkzOC0yLjkwNjI1LS4zNTkzOC00LjMxMDU1LDAtLjMzMzk4LjA4NTk0LS41MzYxMy40MjY3Ni0uNDUwMi43NjA3NC4wODQ5Ni4zMzMwMS40MjI4NS41MzkwNi43NjA3NC40NTAyLDEuMjAzMTItLjMwODU5LDIuNDg2MzMtLjMwODU5LDMuNjg5NDUsMCwuMDUxNzYuMDEzNjcuMTA0NDkuMDE5NTMuMTU1MjcuMDE5NTMuMjc5MywwLC41MzMyLS4xODc1LjYwNTQ3LS40Njk3My4wODU5NC0uMzMzOTgtLjExNjIxLS42NzQ4LS40NTAyLS43NjA3NFoiLz48cGF0aCBkPSJtMTEuNDA3MjMsMTYuNDk1MTJjLS4zMzY5MS0uMDg5ODQtLjY3NDguMTE3MTktLjc2MDc0LjQ1MDItLjE3OTY5LjcwMTE3LS4yNzE0OCwxLjQyNjc2LS4yNzE0OCwyLjE1NTI3LDAsLjcyNzU0LjA5MTgsMS40NTMxMi4yNzE0OCwyLjE1NTI3LjA3MjI3LjI4MjIzLjMyNjE3LjQ2OTczLjYwNTQ3LjQ2OTczLjA1MDc4LDAsLjEwMzUyLS4wMDU4Ni4xNTUyNy0uMDE5NTMuMzMzOTgtLjA4NTk0LjUzNjEzLS40MjY3Ni40NTAyLS43NjA3NC0uMTU0My0uNjAxNTYtLjIzMjQyLTEuMjIxNjgtLjIzMjQyLTEuODQ0NzMsMC0uNjI0MDIuMDc4MTItMS4yNDQxNC4yMzI0Mi0xLjg0NDczLjA4NTk0LS4zMzM5OC0uMTE1MjMtLjY3NDgtLjQ1MDItLjc2MDc0WiIvPjxwYXRoIGQ9Im0yMC44NDQ3MywyNi4yNDMxNmMtMS4yMDMxMi4zMDg1OS0yLjQ4NjMzLjMwODU5LTMuNjg5NDUsMC0uMzM2OTEtLjA4Nzg5LS42NzQ4LjExNjIxLS43NjA3NC40NTAycy4xMTYyMS42NzQ4LjQ1MDIuNzYwNzRjLjcwMjE1LjE3OTY5LDEuNDI3NzMuMjcxNDgsMi4xNTUyNy4yNzE0OHMxLjQ1MzEyLS4wOTE4LDIuMTU1MjctLjI3MTQ4Yy4zMzM5OC0uMDg1OTQuNTM2MTMtLjQyNjc2LjQ1MDItLjc2MDc0LS4wODQ5Ni0uMzMzOTgtLjQyMzgzLS41MzkwNi0uNzYwNzQtLjQ1MDJaIi8+PHBhdGggZD0ibTI2LjU5Mjc3LDE2LjQ5NTEyYy0uMzM0OTYuMDg1OTQtLjUzNjEzLjQyNjc2LS40NTAyLjc2MDc0LjE1NDMuNjAwNTkuMjMyNDIsMS4yMjA3LjIzMjQyLDEuODQ0NzMsMCwuNjIzMDUtLjA3ODEyLDEuMjQzMTYtLjIzMjQyLDEuODQ0NzMtLjA4NTk0LjMzMzk4LjExNjIxLjY3NDguNDUwMi43NjA3NC4wNTE3Ni4wMTM2Ny4xMDQ0OS4wMTk1My4xNTUyNy4wMTk1My4yNzkzLDAsLjUzMzItLjE4NzUuNjA1NDctLjQ2OTczLjE3OTY5LS43MDIxNS4yNzE0OC0xLjQyNzczLjI3MTQ4LTIuMTU1MjcsMC0uNzI4NTItLjA5MTgtMS40NTQxLS4yNzE0OC0yLjE1NTI3LS4wODU5NC0uMzMzMDEtLjQyMzgzLS41NDEwMi0uNzYwNzQtLjQ1MDJaIi8+PHBhdGggZD0ibTIwLjkxMTEzLDE3LjM4NTc0YzAtMS4wNTM3MS0uODU3NDItMS45MTAxNi0xLjkxMTEzLTEuOTEwMTZzLTEuOTExMTMuODU2NDUtMS45MTExMywxLjkxMDE2YzAsLjYyNzc1LjMwODM1LDEuMTgxMDMuNzc3MjIsMS41Mjk2NmwtLjc1ODY3LDMuMDMzODFjLS4wNDY4OC4xODY1Mi0uMDA0ODguMzg0NzcuMTE0MjYuNTM2MTMuMTE4MTYuMTUxMzcuMjk5OC4yNDAyMy40OTIxOS4yNDAyM2gyLjU3MjI3Yy4xOTIzOCwwLC4zNzQwMi0uMDg4ODcuNDkyMTktLjI0MDIzLjExOTE0LS4xNTEzNy4xNjExMy0uMzQ5NjEuMTE0MjYtLjUzNjEzbC0uNzU4NjctMy4wMzM4MWMuNDY4ODctLjM0ODYzLjc3NzIyLS45MDE5Mi43NzcyMi0xLjUyOTY2Wm0tMi4zOTY0OCw0LjA4OTg0bC40ODUzNS0xLjk0MTQxLjQ4NTM1LDEuOTQxNDFoLS45NzA3Wm0uNDg1MzUtMy40Mjg3MWMtLjM2NDI2LDAtLjY2MTEzLS4yOTY4OC0uNjYxMTMtLjY2MTEzcy4yOTY4OC0uNjYwMTYuNjYxMTMtLjY2MDE2LjY2MTEzLjI5NTkuNjYxMTMuNjYwMTYtLjI5Njg4LjY2MTEzLS42NjExMy42NjExM1oiLz48L3N2Zz4=',
      description: t('Create an organization.'),
      introduction: t("You'll learn how to create an organization in this quick start."),
      tasks: [
        {
          title: t('Create an organization'),
          description: t(
            '##To create organizations:\n\nAnsible Automation Platform automatically creates a default organization.\nIf you have a Self-support level license, you have only the default organization available and must not delete it. \n\nYou can use the default organization as it is initially set up and edit it later. \n\n1. From the navigation panel, select **Access Management** > **Organizations**.\n2. Click **Create organization**.\n3. Enter the **Name** and optionally provide a **Description** for your organization.\n[If automation controller is enabled on the platform, continue with Step 4. Otherwise, proceed to Step 6.]{{admonition note}}\n4. Select the name of the **Execution environment** or search for one that exists that members of this team can run automation. \n5. Select the the **Instance Groups** on which to run this organization.\n6. Select the **Galaxy credentials** or search from a list of existing ones.\n7. Enter the **Max hosts** for this organization. \nThe default is 0.\n8. Click **Next**.\n9. If you include more than one instance group, you can manage the instance group order by dragging and dropping the instance group up or down in the list. \n[The execution precedence is determined by the order in which the instance groups are listed.]{{admonition note}} \n10. Click **Next** and verify the organization settings.\n11. Click **Finish**.'
          ),
          review: {
            instructions: t(
              "#### To verify that you've added an organization:\nDid the **Details** page open after creating the organization?\nIs the organization listed on the **Organizations** list view?"
            ),
            failedTaskHelp: t(
              'Try the steps again. For more information, see [Organizations](https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html-single/automation_controller_user_guide/index#assembly-controller-organizations).'
            ),
          },
          summary: {
            success: t('You have viewed the details of your organization!'),
            failed: undefined,
          },
        },
      ],
      conclusion: t(
        'You successfully completed the creating an organization steps! If you want to learn how to create a team, take the **Create teams** quick start.'
      ),
      nextQuickStart: ['creating-a-team'],
    },
  };
  return qsData;
}
