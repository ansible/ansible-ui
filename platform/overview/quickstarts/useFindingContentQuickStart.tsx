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
        text: t('Automation Content'),
      },
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJ1dWlkLTIyNWVkNGIzLTE1OWUtNGQ0Yy05ZDMzLTBkYjdmNzk2MmEzMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMzggMzgiPjxkZWZzPjxzdHlsZT4udXVpZC1lZWI5NWE5Mi1jMzc2LTQxNzYtOThjNy0wZTg4NjdhZGU3ODh7ZmlsbDojZTAwO30udXVpZC03ZDFkMjllMi1mNWYwLTQwMGItYjA0OS00MDI2YjkyMDFhZmZ7ZmlsbDojZmZmO30udXVpZC0xMTkwMzRjNC04YWE4LTRlOGUtOGY1MS03MTFiZDgwNGYyN2V7ZmlsbDojZTBlMGUwO308L3N0eWxlPjwvZGVmcz48cGF0aCBjbGFzcz0idXVpZC03ZDFkMjllMi1mNWYwLTQwMGItYjA0OS00MDI2YjkyMDFhZmYiIGQ9Im0xMCwxYy00Ljk3MDU2LDAtOSw0LjAyOTQ0LTksOXYxOGMwLDQuOTcwNTcsNC4wMjk0NCw5LDksOWgxOGM0Ljk3MDU2LDAsOS00LjAyOTQzLDktOVYxMGMwLTQuOTcwNTYtNC4wMjk0NC05LTktOUgxMFoiLz48cGF0aCBjbGFzcz0idXVpZC0xMTkwMzRjNC04YWE4LTRlOGUtOGY1MS03MTFiZDgwNGYyN2UiIGQ9Im0yOCwyLjI1YzQuMjczMzIsMCw3Ljc1LDMuNDc2NjIsNy43NSw3Ljc1djE4YzAsNC4yNzMzOC0zLjQ3NjY4LDcuNzUtNy43NSw3Ljc1SDEwYy00LjI3MzMyLDAtNy43NS0zLjQ3NjYyLTcuNzUtNy43NVYxMGMwLTQuMjczMzgsMy40NzY2OC03Ljc1LDcuNzUtNy43NWgxOG0wLTEuMjVIMTBDNS4wMjk0MiwxLDEsNS4wMjk0MiwxLDEwdjE4YzAsNC45NzA1OCw0LjAyOTQyLDksOSw5aDE4YzQuOTcwNTgsMCw5LTQuMDI5NDIsOS05VjEwYzAtNC45NzA1OC00LjAyOTQyLTktOS05aDBaIi8+PHBhdGggY2xhc3M9InV1aWQtZWViOTVhOTItYzM3Ni00MTc2LTk4YzctMGU4ODY3YWRlNzg4IiBkPSJtMTQsMTAuNDc1NTloLTNjLS4zNDQ3MywwLS42MjUuMjgwMjctLjYyNS42MjV2M2MwLC4zNDQ3My4yODAyNy42MjUuNjI1LjYyNWgzYy4zNDQ3MywwLC42MjUtLjI4MDI3LjYyNS0uNjI1di0zYzAtLjM0NDczLS4yODAyNy0uNjI1LS42MjUtLjYyNVptLS42MjUsM2gtMS43NXYtMS43NWgxLjc1djEuNzVaIi8+PHBhdGggY2xhc3M9InV1aWQtZWViOTVhOTItYzM3Ni00MTc2LTk4YzctMGU4ODY3YWRlNzg4IiBkPSJtMjcsMTAuNDc1NTloLTNjLS4zNDQ3MywwLS42MjUuMjgwMjctLjYyNS42MjV2M2MwLC4zNDQ3My4yODAyNy42MjUuNjI1LjYyNWgzYy4zNDQ3MywwLC42MjUtLjI4MDI3LjYyNS0uNjI1di0zYzAtLjM0NDczLS4yODAyNy0uNjI1LS42MjUtLjYyNVptLS42MjUsM2gtMS43NXYtMS43NWgxLjc1djEuNzVaIi8+PHBhdGggY2xhc3M9InV1aWQtZWViOTVhOTItYzM3Ni00MTc2LTk4YzctMGU4ODY3YWRlNzg4IiBkPSJtMjcsMjMuNDc1NTloLTNjLS4zNDQ3MywwLS42MjUuMjgwMjctLjYyNS42MjV2M2MwLC4zNDQ3My4yODAyNy42MjUuNjI1LjYyNWgzYy4zNDQ3MywwLC42MjUtLjI4MDI3LjYyNS0uNjI1di0zYzAtLjM0NDczLS4yODAyNy0uNjI1LS42MjUtLjYyNVptLS42MjUsM2gtMS43NXYtMS43NWgxLjc1djEuNzVaIi8+PHBhdGggY2xhc3M9InV1aWQtZWViOTVhOTItYzM3Ni00MTc2LTk4YzctMGU4ODY3YWRlNzg4IiBkPSJtMTQsMjMuNDc1NTloLTNjLS4zNDQ3MywwLS42MjUuMjgwMjctLjYyNS42MjV2M2MwLC4zNDQ3My4yODAyNy42MjUuNjI1LjYyNWgzYy4zNDQ3MywwLC42MjUtLjI4MDI3LjYyNS0uNjI1di0zYzAtLjM0NDczLS4yODAyNy0uNjI1LS42MjUtLjYyNVptLS42MjUsM2gtMS43NXYtMS43NWgxLjc1djEuNzVaIi8+PHBhdGggZD0ibTIxLjE1NTI3LDEwLjc0NzA3Yy0xLjQwNDMtLjM1OTM4LTIuOTA2MjUtLjM1OTM4LTQuMzEwNTUsMC0uMzMzOTguMDg1OTQtLjUzNjEzLjQyNjc2LS40NTAyLjc2MDc0LjA4NDk2LjMzMzAxLjQyMjg1LjUzOTA2Ljc2MDc0LjQ1MDIsMS4yMDMxMi0uMzA4NTksMi40ODYzMy0uMzA4NTksMy42ODk0NSwwLC4wNTE3Ni4wMTM2Ny4xMDQ0OS4wMTk1My4xNTUyNy4wMTk1My4yNzkzLDAsLjUzMzItLjE4NzUuNjA1NDctLjQ2OTczLjA4NTk0LS4zMzM5OC0uMTE2MjEtLjY3NDgtLjQ1MDItLjc2MDc0WiIvPjxwYXRoIGQ9Im0xMS40MDcyMywxNi40OTUxMmMtLjMzNjkxLS4wODk4NC0uNjc0OC4xMTcxOS0uNzYwNzQuNDUwMi0uMTc5NjkuNzAxMTctLjI3MTQ4LDEuNDI2NzYtLjI3MTQ4LDIuMTU1MjcsMCwuNzI3NTQuMDkxOCwxLjQ1MzEyLjI3MTQ4LDIuMTU1MjcuMDcyMjcuMjgyMjMuMzI2MTcuNDY5NzMuNjA1NDcuNDY5NzMuMDUwNzgsMCwuMTAzNTItLjAwNTg2LjE1NTI3LS4wMTk1My4zMzM5OC0uMDg1OTQuNTM2MTMtLjQyNjc2LjQ1MDItLjc2MDc0LS4xNTQzLS42MDE1Ni0uMjMyNDItMS4yMjE2OC0uMjMyNDItMS44NDQ3MywwLS42MjQwMi4wNzgxMi0xLjI0NDE0LjIzMjQyLTEuODQ0NzMuMDg1OTQtLjMzMzk4LS4xMTUyMy0uNjc0OC0uNDUwMi0uNzYwNzRaIi8+PHBhdGggZD0ibTIwLjg0NDczLDI2LjI0MzE2Yy0xLjIwMzEyLjMwODU5LTIuNDg2MzMuMzA4NTktMy42ODk0NSwwLS4zMzY5MS0uMDg3ODktLjY3NDguMTE2MjEtLjc2MDc0LjQ1MDJzLjExNjIxLjY3NDguNDUwMi43NjA3NGMuNzAyMTUuMTc5NjksMS40Mjc3My4yNzE0OCwyLjE1NTI3LjI3MTQ4czEuNDUzMTItLjA5MTgsMi4xNTUyNy0uMjcxNDhjLjMzMzk4LS4wODU5NC41MzYxMy0uNDI2NzYuNDUwMi0uNzYwNzQtLjA4NDk2LS4zMzM5OC0uNDIzODMtLjUzOTA2LS43NjA3NC0uNDUwMloiLz48cGF0aCBkPSJtMjcuMzUzNTIsMTYuOTQ1MzFjLS4wODU5NC0uMzMzMDEtLjQyMzgzLS41NDEwMi0uNzYwNzQtLjQ1MDItLjMzNDk2LjA4NTk0LS41MzYxMy40MjY3Ni0uNDUwMi43NjA3NC4xNTQzLjYwMDU5LjIzMjQyLDEuMjIwNy4yMzI0MiwxLjg0NDczLDAsLjYyMzA1LS4wNzgxMiwxLjI0MzE2LS4yMzI0MiwxLjg0NDczLS4wODU5NC4zMzM5OC4xMTYyMS42NzQ4LjQ1MDIuNzYwNzQuMDUxNzYuMDEzNjcuMTA0NDkuMDE5NTMuMTU1MjcuMDE5NTMuMjc5MywwLC41MzMyLS4xODc1LjYwNTQ3LS40Njk3My4xNzk2OS0uNzAyMTUuMjcxNDgtMS40Mjc3My4yNzE0OC0yLjE1NTI3LDAtLjcyODUyLS4wOTE4LTEuNDU0MS0uMjcxNDgtMi4xNTUyN1oiLz48cGF0aCBkPSJtMjAuOTExMTMsMTcuMzg1NzRjMC0xLjA1MzcxLS44NTc0Mi0xLjkxMDE2LTEuOTExMTMtMS45MTAxNnMtMS45MTExMy44NTY0NS0xLjkxMTEzLDEuOTEwMTZjMCwuNjI3NzUuMzA4MzUsMS4xODEwMy43NzcyMiwxLjUyOTY2bC0uNzU4NjcsMy4wMzM4MWMtLjA0Njg4LjE4NjUyLS4wMDQ4OC4zODQ3Ny4xMTQyNi41MzYxMy4xMTgxNi4xNTEzNy4yOTk4LjI0MDIzLjQ5MjE5LjI0MDIzaDIuNTcyMjdjLjE5MjM4LDAsLjM3NDAyLS4wODg4Ny40OTIxOS0uMjQwMjMuMTE5MTQtLjE1MTM3LjE2MTEzLS4zNDk2MS4xMTQyNi0uNTM2MTNsLS43NTg2Ny0zLjAzMzgxYy40Njg4Ny0uMzQ4NjMuNzc3MjItLjkwMTkyLjc3NzIyLTEuNTI5NjZabS0yLjM5NjQ4LDQuMDg5ODRsLjQ4NTM1LTEuOTQxNDEuNDg1MzUsMS45NDE0MWgtLjk3MDdabS40ODUzNS0zLjQyODcxYy0uMzY0MjYsMC0uNjYxMTMtLjI5Njg4LS42NjExMy0uNjYxMTNzLjI5Njg4LS42NjAxNi42NjExMy0uNjYwMTYuNjYxMTMuMjk1OS42NjExMy42NjAxNi0uMjk2ODguNjYxMTMtLjY2MTEzLjY2MTEzWiIvPjwvc3ZnPg==',
      prerequisites: ['You have a valid Ansible Automation Platform subscription.'],
      description: t(
        'Browse automation hub collections to find the content that you need.\n\nPersona: All'
      ),
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
