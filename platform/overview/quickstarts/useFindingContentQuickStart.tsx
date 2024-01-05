import { QuickStart } from '@patternfly/quickstarts';
import { useTranslation } from 'react-i18next';

export function useFindingContentQuickStart() {
  const { t } = useTranslation();
  const quickStart: QuickStart = {
    metadata: {
      name: t('finding-content-in-ansible-automation-platform'),
      instructional: true,
    },
    spec: {
      displayName: t('Finding content in Ansible Automation Platform'),
      durationMinutes: 5,
      type: {
        text: t('automation hub'),
      },
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJ1dWlkLWFlMzcyZWFiLWE3YjktNDU4ZC04MzkwLWI5OWZiNzhmYzFlNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMzggMzgiPjxwYXRoIGQ9Im0yOCwxSDEwQzUuMDI5NDIsMSwxLDUuMDI5NDIsMSwxMHYxOGMwLDQuOTcwNTgsNC4wMjk0Miw5LDksOWgxOGM0Ljk3MDU4LDAsOS00LjAyOTQyLDktOVYxMGMwLTQuOTcwNTgtNC4wMjk0Mi05LTktOVptNy43NSwyN2MwLDQuMjczMzgtMy40NzY2OCw3Ljc1LTcuNzUsNy43NUgxMGMtNC4yNzMzMiwwLTcuNzUtMy40NzY2Mi03Ljc1LTcuNzVWMTBjMC00LjI3MzM4LDMuNDc2NjgtNy43NSw3Ljc1LTcuNzVoMThjNC4yNzMzMiwwLDcuNzUsMy40NzY2Miw3Ljc1LDcuNzV2MThaIi8+PHBhdGggZD0ibTE0LDEwLjQ3NTU5aC0zYy0uMzQ0NzMsMC0uNjI1LjI4MDI3LS42MjUuNjI1djNjMCwuMzQ0NzMuMjgwMjcuNjI1LjYyNS42MjVoM2MuMzQ0NzMsMCwuNjI1LS4yODAyNy42MjUtLjYyNXYtM2MwLS4zNDQ3My0uMjgwMjctLjYyNS0uNjI1LS42MjVabS0uNjI1LDNoLTEuNzV2LTEuNzVoMS43NXYxLjc1WiIvPjxwYXRoIGQ9Im0yNywxMC40NzU1OWgtM2MtLjM0NDczLDAtLjYyNS4yODAyNy0uNjI1LjYyNXYzYzAsLjM0NDczLjI4MDI3LjYyNS42MjUuNjI1aDNjLjM0NDczLDAsLjYyNS0uMjgwMjcuNjI1LS42MjV2LTNjMC0uMzQ0NzMtLjI4MDI3LS42MjUtLjYyNS0uNjI1Wm0tLjYyNSwzaC0xLjc1di0xLjc1aDEuNzV2MS43NVoiLz48cGF0aCBkPSJtMjcsMjMuNDc1NTloLTNjLS4zNDQ3MywwLS42MjUuMjgwMjctLjYyNS42MjV2M2MwLC4zNDQ3My4yODAyNy42MjUuNjI1LjYyNWgzYy4zNDQ3MywwLC42MjUtLjI4MDI3LjYyNS0uNjI1di0zYzAtLjM0NDczLS4yODAyNy0uNjI1LS42MjUtLjYyNVptLS42MjUsM2gtMS43NXYtMS43NWgxLjc1djEuNzVaIi8+PHBhdGggZD0ibTE0LDIzLjQ3NTU5aC0zYy0uMzQ0NzMsMC0uNjI1LjI4MDI3LS42MjUuNjI1djNjMCwuMzQ0NzMuMjgwMjcuNjI1LjYyNS42MjVoM2MuMzQ0NzMsMCwuNjI1LS4yODAyNy42MjUtLjYyNXYtM2MwLS4zNDQ3My0uMjgwMjctLjYyNS0uNjI1LS42MjVabS0uNjI1LDNoLTEuNzV2LTEuNzVoMS43NXYxLjc1WiIvPjxwYXRoIGQ9Im0yMS4xNTUyNywxMC43NDcwN2MtMS40MDQzLS4zNTkzOC0yLjkwNjI1LS4zNTkzOC00LjMxMDU1LDAtLjMzMzk4LjA4NTk0LS41MzYxMy40MjY3Ni0uNDUwMi43NjA3NC4wODQ5Ni4zMzMwMS40MjI4NS41MzkwNi43NjA3NC40NTAyLDEuMjAzMTItLjMwODU5LDIuNDg2MzMtLjMwODU5LDMuNjg5NDUsMCwuMDUxNzYuMDEzNjcuMTA0NDkuMDE5NTMuMTU1MjcuMDE5NTMuMjc5MywwLC41MzMyLS4xODc1LjYwNTQ3LS40Njk3My4wODU5NC0uMzMzOTgtLjExNjIxLS42NzQ4LS40NTAyLS43NjA3NFoiLz48cGF0aCBkPSJtMTEuNDA3MjMsMTYuNDk1MTJjLS4zMzY5MS0uMDg5ODQtLjY3NDguMTE3MTktLjc2MDc0LjQ1MDItLjE3OTY5LjcwMTE3LS4yNzE0OCwxLjQyNjc2LS4yNzE0OCwyLjE1NTI3LDAsLjcyNzU0LjA5MTgsMS40NTMxMi4yNzE0OCwyLjE1NTI3LjA3MjI3LjI4MjIzLjMyNjE3LjQ2OTczLjYwNTQ3LjQ2OTczLjA1MDc4LDAsLjEwMzUyLS4wMDU4Ni4xNTUyNy0uMDE5NTMuMzMzOTgtLjA4NTk0LjUzNjEzLS40MjY3Ni40NTAyLS43NjA3NC0uMTU0My0uNjAxNTYtLjIzMjQyLTEuMjIxNjgtLjIzMjQyLTEuODQ0NzMsMC0uNjI0MDIuMDc4MTItMS4yNDQxNC4yMzI0Mi0xLjg0NDczLjA4NTk0LS4zMzM5OC0uMTE1MjMtLjY3NDgtLjQ1MDItLjc2MDc0WiIvPjxwYXRoIGQ9Im0yMC44NDQ3MywyNi4yNDMxNmMtMS4yMDMxMi4zMDg1OS0yLjQ4NjMzLjMwODU5LTMuNjg5NDUsMC0uMzM2OTEtLjA4Nzg5LS42NzQ4LjExNjIxLS43NjA3NC40NTAycy4xMTYyMS42NzQ4LjQ1MDIuNzYwNzRjLjcwMjE1LjE3OTY5LDEuNDI3NzMuMjcxNDgsMi4xNTUyNy4yNzE0OHMxLjQ1MzEyLS4wOTE4LDIuMTU1MjctLjI3MTQ4Yy4zMzM5OC0uMDg1OTQuNTM2MTMtLjQyNjc2LjQ1MDItLjc2MDc0LS4wODQ5Ni0uMzMzOTgtLjQyMzgzLS41MzkwNi0uNzYwNzQtLjQ1MDJaIi8+PHBhdGggZD0ibTI2LjU5Mjc3LDE2LjQ5NTEyYy0uMzM0OTYuMDg1OTQtLjUzNjEzLjQyNjc2LS40NTAyLjc2MDc0LjE1NDMuNjAwNTkuMjMyNDIsMS4yMjA3LjIzMjQyLDEuODQ0NzMsMCwuNjIzMDUtLjA3ODEyLDEuMjQzMTYtLjIzMjQyLDEuODQ0NzMtLjA4NTk0LjMzMzk4LjExNjIxLjY3NDguNDUwMi43NjA3NC4wNTE3Ni4wMTM2Ny4xMDQ0OS4wMTk1My4xNTUyNy4wMTk1My4yNzkzLDAsLjUzMzItLjE4NzUuNjA1NDctLjQ2OTczLjE3OTY5LS43MDIxNS4yNzE0OC0xLjQyNzczLjI3MTQ4LTIuMTU1MjcsMC0uNzI4NTItLjA5MTgtMS40NTQxLS4yNzE0OC0yLjE1NTI3LS4wODU5NC0uMzMzMDEtLjQyMzgzLS41NDEwMi0uNzYwNzQtLjQ1MDJaIi8+PHBhdGggZD0ibTIwLjkxMTEzLDE3LjM4NTc0YzAtMS4wNTM3MS0uODU3NDItMS45MTAxNi0xLjkxMTEzLTEuOTEwMTZzLTEuOTExMTMuODU2NDUtMS45MTExMywxLjkxMDE2YzAsLjYyNzc1LjMwODM1LDEuMTgxMDMuNzc3MjIsMS41Mjk2NmwtLjc1ODY3LDMuMDMzODFjLS4wNDY4OC4xODY1Mi0uMDA0ODguMzg0NzcuMTE0MjYuNTM2MTMuMTE4MTYuMTUxMzcuMjk5OC4yNDAyMy40OTIxOS4yNDAyM2gyLjU3MjI3Yy4xOTIzOCwwLC4zNzQwMi0uMDg4ODcuNDkyMTktLjI0MDIzLjExOTE0LS4xNTEzNy4xNjExMy0uMzQ5NjEuMTE0MjYtLjUzNjEzbC0uNzU4NjctMy4wMzM4MWMuNDY4ODctLjM0ODYzLjc3NzIyLS45MDE5Mi43NzcyMi0xLjUyOTY2Wm0tMi4zOTY0OCw0LjA4OTg0bC40ODUzNS0xLjk0MTQxLjQ4NTM1LDEuOTQxNDFoLS45NzA3Wm0uNDg1MzUtMy40Mjg3MWMtLjM2NDI2LDAtLjY2MTEzLS4yOTY4OC0uNjYxMTMtLjY2MTEzcy4yOTY4OC0uNjYwMTYuNjYxMTMtLjY2MDE2LjY2MTEzLjI5NTkuNjYxMTMuNjYwMTYtLjI5Njg4LjY2MTEzLS42NjExMy42NjExM1oiLz48L3N2Zz4=',
      prerequisites: ['You have a valid Ansible Automation Platform subscription.'],
      description: t('Browse automation hub collections to find the content that you need.'),
      introduction: t(
        '**In this Quick Start, you will use the filtering options in the search bar to browse content in automation hub.**\n- Browse content by repository\n- Browse content by namespace\n- Browse content by tag\n- Browse content by keyword'
      ),
      tasks: [
        {
          title: t('Filter content by repository type in the Collections view'),
          description: t(
            '## To filter and browse content by repository type:\n1. From the navigation panel, select Automation Content > **Collections**.\n2. From the dropdown menu next to the search field, select **Repository**.\n3. Next to Repository, select the checkbox corresponding to the repository type that you want.\n4. Scroll through the filtered results and select the collection you want. \n[The repository options refer to the type of content contained in the repository. **Rh-certified** refers to collections that are maintained and supported by Red Hat; **validated** refers to content that is maintained but not supported by Red Hat; **community** refers to content originating from Red Hat’s upstream community; and **published** refers to content that is available on automation hub but not maintained or supported by Red Hat.]{{admonition tip}}'
          ),
          review: {
            instructions: t('- Did you complete the task successfully?'),
            failedTaskHelp: "This task isn't verified yet. Try the task again.",
          },
          summary: {
            success: t('Shows a success message in the task header'),
            failed: t('Shows a failed message in the task header'),
          },
        },
        {
          title: t('Filter content by tag in the Collections view'),
          description: t(
            '##To filter and browse content by tag:\n1. From the navigation panel, select Automation Content > **Collections**.\n2. From the dropdown menu next to the search field, select **Tag**.\n3. Next to Tag, select the checkbox corresponding to the tag that you want to browse.\n[Collections are tagged with descriptive terms that correspond to the collection topic. Usually, the tags describe what the collection automates (for example, infrastructure or security.)]{{admonition tip}}\n4. Scroll through the filtered results and select the collection you want.'
          ),
          review: {
            instructions: t(
              '- Do you see a list of collection titles that correspond to the tag you selected?'
            ),
            failedTaskHelp: "This task isn't verified yet. Try the task again.",
          },
          summary: {
            success: t('Shows a success message in the task header'),
            failed: t('Shows a failed message in the task header'),
          },
        },
        {
          title: t('Filter content by Namespace in the Collections view'),
          description: t(
            '##To filter and browse content by namespace:\n1. From the navigation panel, select Automation Content > **Collections**.\n2. From the dropdown menu next to the search field, select **Namespace**.\n3. Enter the namespace you want to search for.\n[A namespace is a unique location where a provider hosts their content. A namespace will generally refer to a provider name, though a provider may have more than one namespace. Try searching for a provider name (such as Microsoft or Red Hat) first to narrow your search.)]{{admonition tip}}\n4. Scroll through the filtered results and select the collection you want.'
          ),
          review: {
            instructions: t(
              '- Do you see a list of collection titles that correspond to the namespace you searched for?'
            ),
            failedTaskHelp: "This task isn't verified yet. Try the task again.",
          },
          summary: {
            success: t('Shows a success message in the task header'),
            failed: t('Shows a failed message in the task header'),
          },
        },
        {
          title: t('Filter content by keyword in the Collections view'),
          description: t(
            '##To filter and browse content by keyword:\n1. From the navigation panel, select Automation Content > **Collections**.\n2. From the dropdown menu next to the search field, select **Keywords**.\n3. Enter your keyword in the search field and click the magnifying glass icon. \n[A keyword can refer to a topic (for example, security or infrastructure), a platform (for example, Delinea or Cisco Intersight), or a provider (for example, IBM or Dell).)]{{admonition tip}}\n4. Scroll through the filtered results and select the collection you want.'
          ),
          review: {
            instructions: t(
              '- Do you see a list of collection titles that correspond to your search term?'
            ),
            failedTaskHelp: "This task isn't verified yet. Try the task again.",
          },
          summary: {
            success: t('Shows a success message in the task header'),
            failed: t('Shows a failed message in the task header'),
          },
        },
      ],
      conclusion: t(
        "Congratulations! You've completed the Finding content in Ansible Automation Platform Quick Start."
      ),
    },
  };
  return quickStart;
}
