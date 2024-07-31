import { QuickStart } from '@patternfly/quickstarts';
import { useTranslation } from 'react-i18next';

export function useAutomationMeshQS() {
  const { t } = useTranslation();

  const qsData: QuickStart = {
    metadata: {
      name: 'automation-mesh',
      instructional: true,
    },
    spec: {
      displayName: t('Setting up automation mesh'),
      durationMinutes: 5,
      type: {
        text: t('Platform'),
        color: 'grey',
      },
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJ1dWlkLTY0NTIyZjI1LTkyOTEtNGE0Ny04MzUyLWUwMjI3YjBhMmE3MyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMzggMzgiPjxkZWZzPjxzdHlsZT4udXVpZC1hNWE1MWU0OC01OGJiLTQwN2QtYWM2ZC1kOGNiMzcwNmU2NTF7ZmlsbDojZTAwO30udXVpZC0wZDUyMDQ3Zi1mN2U3LTQ5MjYtYjkyOS00N2U4YWY1NDkzNDV7ZmlsbDojZmZmO30udXVpZC1iNjBjN2VmZi0yMGUzLTQwYzItYmZmZC05Y2M5Nzg0ZTYwMjN7ZmlsbDojZTBlMGUwO308L3N0eWxlPjwvZGVmcz48cGF0aCBjbGFzcz0idXVpZC0wZDUyMDQ3Zi1mN2U3LTQ5MjYtYjkyOS00N2U4YWY1NDkzNDUiIGQ9Im0yOCwxSDEwQzUuMDI5NDQsMSwxLDUuMDI5NDQsMSwxMHYxOGMwLDQuOTcwNTcsNC4wMjk0NCw5LDksOWgxOGM0Ljk3MDU2LDAsOS00LjAyOTQzLDktOVYxMGMwLTQuOTcwNTYtNC4wMjk0NC05LTktOWgwWiIvPjxwYXRoIGNsYXNzPSJ1dWlkLWI2MGM3ZWZmLTIwZTMtNDBjMi1iZmZkLTljYzk3ODRlNjAyMyIgZD0ibTI4LDIuMjVjNC4yNzMzMiwwLDcuNzUsMy40NzY2NSw3Ljc1LDcuNzV2MThjMCw0LjI3MzM1LTMuNDc2NjgsNy43NS03Ljc1LDcuNzVIMTBjLTQuMjczMzIsMC03Ljc1LTMuNDc2NjUtNy43NS03Ljc1VjEwYzAtNC4yNzMzNSwzLjQ3NjY4LTcuNzUsNy43NS03Ljc1aDE4bTAtMS4yNUgxMEM1LjAyOTQyLDEsMSw1LjAyOTQ1LDEsMTB2MThjMCw0Ljk3MDU4LDQuMDI5NDIsOSw5LDloMThjNC45NzA1OCwwLDktNC4wMjk0Miw5LTlWMTBjMC00Ljk3MDU1LTQuMDI5NDItOS05LTloMFoiLz48cGF0aCBkPSJtMTMsMjUuNjI1Yy0uMTYwMTYsMC0uMzIwMzEtLjA2MDU1LS40NDIzOC0uMTgyNjItLjI0MzE2LS4yNDQxNC0uMjQzMTYtLjY0MDYyLDAtLjg4NDc3bDEyLTEyYy4yNDQxNC0uMjQ0MTQuNjQwNjItLjI0NDE0Ljg4NDc3LDAsLjI0MzE2LjI0NDE0LjI0MzE2LjY0MDYyLDAsLjg4NDc3bC0xMiwxMmMtLjEyMjA3LjEyMjA3LS4yODIyMy4xODI2Mi0uNDQyMzguMTgyNjJaIi8+PHBhdGggY2xhc3M9InV1aWQtYTVhNTFlNDgtNThiYi00MDdkLWFjNmQtZDhjYjM3MDZlNjUxIiBkPSJtMjksMjEuNjI1Yy0uMTYwMTYsMC0uMzIwMzEtLjA2MDU1LS40NDIzOC0uMTgyNjJsLTEyLTEyYy0uMjQzMTYtLjI0NDE0LS4yNDMxNi0uNjQwNjIsMC0uODg0NzcuMjQ0MTQtLjI0NDE0LjY0MDYyLS4yNDQxNC44ODQ3NywwbDEyLDEyYy4yNDMxNi4yNDQxNC4yNDMxNi42NDA2MiwwLC44ODQ3Ny0uMTIyMDcuMTIyMDctLjI4MjIzLjE4MjYyLS40NDIzOC4xODI2MloiLz48cGF0aCBjbGFzcz0idXVpZC1hNWE1MWU0OC01OGJiLTQwN2QtYWM2ZC1kOGNiMzcwNmU2NTEiIGQ9Im0yMSwyOS42MjVjLS4xNjAxNiwwLS4zMjAzMS0uMDYwNTUtLjQ0MjM4LS4xODI2MmwtMTItMTJjLS4yNDMxNi0uMjQ0MTQtLjI0MzE2LS42NDA2MiwwLS44ODQ3Ny4yNDQxNC0uMjQ0MTQuNjQwNjItLjI0NDE0Ljg4NDc3LDBsMTIsMTJjLjI0MzE2LjI0NDE0LjI0MzE2LjY0MDYyLDAsLjg4NDc3LS4xMjIwNy4xMjIwNy0uMjgyMjMuMTgyNjItLjQ0MjM4LjE4MjYyWiIvPjxwYXRoIGQ9Im0xNywyOS42MjVjLS4xNjAxNiwwLS4zMjAzMS0uMDYwNTUtLjQ0MjM4LS4xODI2Mi0uMjQzMTYtLjI0NDE0LS4yNDMxNi0uNjQwNjIsMC0uODg0NzdsMTItMTJjLjI0NDE0LS4yNDQxNC42NDA2Mi0uMjQ0MTQuODg0NzcsMCwuMjQzMTYuMjQ0MTQuMjQzMTYuNjQwNjIsMCwuODg0NzdsLTEyLDEyYy0uMTIyMDcuMTIyMDctLjI4MjIzLjE4MjYyLS40NDIzOC4xODI2MloiLz48cGF0aCBkPSJtOSwyMS42MjVjLS4xNjAxNiwwLS4zMjAzMS0uMDYwNTUtLjQ0MjM4LS4xODI2Mi0uMjQzMTYtLjI0NDE0LS4yNDMxNi0uNjQwNjIsMC0uODg0NzdsMTItMTJjLjI0NDE0LS4yNDQxNC42NDA2Mi0uMjQ0MTQuODg0NzcsMCwuMjQzMTYuMjQ0MTQuMjQzMTYuNjQwNjIsMCwuODg0NzdsLTEyLDEyYy0uMTIyMDcuMTIyMDctLjI4MjIzLjE4MjYyLS40NDIzOC4xODI2MloiLz48cGF0aCBjbGFzcz0idXVpZC1hNWE1MWU0OC01OGJiLTQwN2QtYWM2ZC1kOGNiMzcwNmU2NTEiIGQ9Im0yNSwyNS42MjVjLS4xNjAxNiwwLS4zMjAzMS0uMDYwNTUtLjQ0MjM4LS4xODI2MmwtMTItMTJjLS4yNDMxNi0uMjQ0MTQtLjI0MzE2LS42NDA2MiwwLS44ODQ3Ny4yNDQxNC0uMjQ0MTQuNjQwNjItLjI0NDE0Ljg4NDc3LDBsMTIsMTJjLjI0MzE2LjI0NDE0LjI0MzE2LjY0MDYyLDAsLjg4NDc3LS4xMjIwNy4xMjIwNy0uMjgyMjMuMTgyNjItLjQ0MjM4LjE4MjYyWiIvPjxwYXRoIGQ9Im0xOCwyMC42MjVjLS4xNjAxNiwwLS4zMjAzMS0uMDYwNTUtLjQ0MjM4LS4xODI2Mi0uMjQzMTYtLjI0NDE0LS4yNDMxNi0uNjQwNjIsMC0uODg0NzdsMi0yYy4yNDQxNC0uMjQ0MTQuNjQwNjItLjI0NDE0Ljg4NDc3LDAsLjI0MzE2LjI0NDE0LjI0MzE2LjY0MDYyLDAsLjg4NDc3bC0yLDJjLS4xMjIwNy4xMjIwNy0uMjgyMjMuMTgyNjItLjQ0MjM4LjE4MjYyWiIvPjwvc3ZnPg==',
      description: t('Automate at scale in a cloud-native way\n\nPersona: All'),
      introduction: t(
        'Deploy automation mesh as part of your operator or VM-based Ansible Automation Platform environment.'
      ),
      tasks: [
        {
          title: t('Set up automation mesh'),
          description: t(
            '##To set up automation mesh:\n\nSee the installation guide that matches your installation type:\n\n- [Red Hat Ansible Automation Platform Automation Mesh for operator-based installations](https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html/automation_mesh_for_managed_cloud_or_operator_environments)\n- [Red Hat Ansible Automation Platform Automation Mesh Guide for VM-based installations](https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html/automation_mesh_for_vm_environments)'
          ),
        },
      ],
      conclusion: t('You successfully completed the set up of automation mesh!'),
    },
  };
  return qsData;
}
