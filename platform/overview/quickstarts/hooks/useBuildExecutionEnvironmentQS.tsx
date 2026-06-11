import { QuickStart } from '@patternfly/quickstarts';
import { useTranslation } from 'react-i18next';

export function useBuildExecutionEnvironmentsQS() {
  const { t } = useTranslation();

  const qsData: QuickStart = {
    metadata: {
      name: 'build-execution-environment',
      instructional: true,
    },
    spec: {
      displayName: t('Building an automation execution environment'),
      durationMinutes: 10,
      type: {
        text: t('Automation Content'),
        color: 'grey',
      },
      icon: 'data:image/svg+xml;base64,PCEtLSBHZW5lcmF0ZWQgYnkgSWNvTW9vbi5pbyAtLT4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj4KPHRpdGxlPjwvdGl0bGU+CjxnIGlkPSJpY29tb29uLWlnbm9yZSI+CjwvZz4KPHBhdGggZD0iTTQ0OCA2NHY0MTZoLTMzNmMtMjYuNTEzIDAtNDgtMjEuNDktNDgtNDhzMjEuNDg3LTQ4IDQ4LTQ4aDMwNHYtMzg0aC0zMjBjLTM1LjE5OSAwLTY0IDI4LjgtNjQgNjR2Mzg0YzAgMzUuMiAyOC44MDEgNjQgNjQgNjRoMzg0di00NDhoLTMyeiI+PC9wYXRoPgo8cGF0aCBkPSJNMTEyLjAyOCA0MTZ2MGMtMC4wMDkgMC4wMDEtMC4wMTkgMC0wLjAyOCAwLTguODM2IDAtMTYgNy4xNjMtMTYgMTZzNy4xNjQgMTYgMTYgMTZjMC4wMDkgMCAwLjAxOS0wLjAwMSAwLjAyOC0wLjAwMXYwLjAwMWgzMDMuOTQ1di0zMmgtMzAzLjk0NXoiPjwvcGF0aD4KPC9zdmc+Cg==',
      description: t(
        'Build, view, and sync an environment.\n\nPersona: Platform administrator, Automation developer'
      ),
      introduction: t(
        'All automation in Red Hat Ansible Automation Platform runs on container images called automation execution environments. \nAutomation execution environments create a common language for communicating automation dependencies, and offer a standard way to build and distribute the automation environment.'
      ),
      tasks: [
        {
          title: t('Build an execution environment'),
          description: t(
            '##To build an execution environment:\n\nAn automation execution environment must contain the following:\n - Ansible Core 2.16 or later\n - Python 3.10 or later\n - Ansible Runner\n - Ansible content collections and their dependencies\n - System dependencies\n\nAnsible Builder is a command line tool that automates the process of building automation execution environments by using metadata defined in various Ansible Collections or created by the user.\n\nFor more information about Ansible Builder and execution environments, see: \n- [Using Ansible Builder](https://docs.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.5/html-single/creating_and_using_execution_environments/index#assembly-using-builder)\n- [Creating and Consuming Execution Environments](https://docs.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.5/html-single/creating_and_using_execution_environments/index)'
          ),
        },
        {
          title: t('View an execution environment'),
          description: t(
            '##To view an execution environment:\n\n1. From the navigation panel, select **Automation Execution** > **Infrastructure** > **Execution Environments**. \n2. Click an execution environment to view its details. \n  As part of the initial setup, a **Control Plane Execution Environment**, a **Default execution environment**, and a **Minimal execution environment** are created to help you get started, but you can also create your own.'
          ),
        },
        {
          title: t('Add an execution environment to a job template'),
          description: t(
            '##To add an execution environment to a job template:\n\n###Prerequisites:\n  - You have access to an execution environment created using ansible-builder as described in [Building an execution environment](https://docs.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.5/html-single/using_automation_execution/index#ref-controller-build-exec-envs). \n      Use the automation controller UI to specify the execution environment to use in your job templates.\n  - You have the appropriate permissions to use an execution environment in a job. \n  - For jobs or jobs template that use an execution environment with an assigned credential, ensure that the credential contains a username, host, and password.\n\n###Procedure:\n  1. From the navigation panel, select **Automation Execution** > **Infrastructure** > **Execution Environments**.\n  2. Click **Create execution environment**.\n  3. Enter the appropriate details into the required fields.\n  4. Click **Create execution environent**.\n  5. To add an execution environment to a job template, specify it in the **Execution environment** field of the job template.\n\n   When you have added an execution environment to a job template, those templates are listed in the **Templates tab** of the execution environment.\n\n   For more information, see [Execution environments](https://docs.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.5/html-single/using_automation_execution/index#assembly-controller-execution-environments).'
          ),
          review: {
            instructions: t(
              "#### To verify that you've added an execution environment:\nIs the execution environment listed on the **Execution Environments** list view?"
            ),
            failedTaskHelp: t('Try the steps again.'),
          },
          summary: {
            success: t('You have viewed the details of your environment!'),
          },
        },
      ],
      conclusion: t(
        'You successfully completed the building an execution environment steps! If you want to learn how to build a decision environment, take the **Building a decision environment** quick start.'
      ),
      nextQuickStart: ['build-decision-environment'],
    },
  };
  return qsData;
}
