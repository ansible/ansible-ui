/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';

export type IRoles = Record<string, { id: string; label: string; description: string }>;

export function useRolesMetadata(): {
  credential: IRoles;
  job_template: IRoles;
  workflow_job_template: IRoles;
  inventory: IRoles;
  project: IRoles;
  organization: IRoles;
  team: IRoles;
} {
  const { t } = useTranslation();
  return {
    credential: {
      admin_role: {
        id: 'Admin',
        label: t('Admin'),
        description: t('Can manage all aspects of the credential'),
      },
      read_role: {
        id: 'Read',
        label: t('Read'),
        description: t('May view settings for the credential'),
      },
      use_role: {
        id: 'Use',
        label: t('Use'),
        description: t('Can use the credential in a job template'),
      },
    },

    job_template: {
      admin_role: {
        id: 'Admin',
        label: t('Admin'),
        description: t('Can manage all aspects of the job template'),
      },
      read_role: {
        id: 'Read',
        label: t('Read'),
        description: t('May view settings for the job template'),
      },
      use_role: {
        id: 'Execute',
        label: t('Execute'),
        description: t('May run the job template'),
      },
    },

    workflow_job_template: {
      admin_role: {
        id: 'Admin',
        label: t('Admin'),
        description: t('Can manage all aspects of the workflow job template'),
      },
      execute_role: {
        id: 'Execute',
        label: t('Execute'),
        description: t('May run the workflow job template'),
      },
      read_role: {
        id: 'Read',
        label: t('Read'),
        description: t('May view settings for the job template'),
      },
      approval_role: {
        id: 'Approve',
        label: t('Approve'),
        description: t('Can approve or deny a workflow approval node'),
      },
    },

    inventory: {
      admin_role: {
        id: 'Admin',
        label: t('Admin'),
        description: t('Can manage all aspects of the inventory'),
      },
      update_role: {
        id: 'Update',
        label: t('Update'),
        description: t('May update the inventory'),
      },
      adhoc_role: {
        id: 'Ad Hoc',
        label: t('Ad Hoc'),
        description: t('May run ad hoc commands on the inventory'),
      },
      use_role: {
        id: 'Use',
        label: t('Use'),
        description: t('Can use the inventory in a job template'),
      },
      read_role: {
        id: 'Read',
        label: t('Read'),
        description: t('May view settings for the inventory'),
      },
    },

    project: {
      admin_role: {
        id: 'Admin',
        label: t('Admin'),
        description: t('Can manage all aspects of the project'),
      },
      read_role: {
        id: 'Read',
        label: t('Read'),
        description: t('May view settings for the project'),
      },
      update_role: { id: 'Update', label: t('Update'), description: t('May update the project') },
      use_role: {
        id: 'Use',
        label: t('Use'),
        description: t('Can use the project in a job template'),
      },
    },

    organization: {
      admin_role: {
        id: 'Admin',
        label: t('Admin'),
        description: t('Can manage all aspects of the organization'),
      },
      execute_role: {
        id: 'Execute',
        label: t('Execute'),
        description: t('May run any executable resources in the organization'),
      },
      project_admin_role: {
        id: 'Project admin',
        label: t('Project admin'),
        description: t('Can manage all projects of the organization'),
      },
      inventory_admin_role: {
        id: 'Inventory admin',
        label: t('Inventory admin'),
        description: t('Can manage all inventories of the organization'),
      },
      credential_admin_role: {
        id: 'Credential admin',
        label: t('Credential admin'),
        description: t('Can manage all credentials of the organization'),
      },
      workflow_admin_role: {
        id: 'Workflow admin',
        label: t('Workflow admin'),
        description: t('Can manage all workflows of the organization'),
      },
      notification_admin_role: {
        id: 'Notification admin',
        label: t('Notification admin'),
        description: t('Can manage all notifications of the organization'),
      },
      job_template_admin_role: {
        id: 'Job template admin',
        label: t('Job template admin'),
        description: t('Can manage all job templates of the organization'),
      },
      execution_environment_admin_role: {
        id: 'Execution environment admin',
        label: t('Execution environment admin'),
        description: t('Can manage all execution environments of the organization'),
      },
      auditor_role: {
        id: 'Auditor',
        label: t('Auditor'),
        description: t('Can view all aspects of the organization'),
      },
      member_role: {
        id: 'Member',
        label: t('Member'),
        description: t('User is a member of the organization'),
      },
      read_role: {
        id: 'Read',
        label: t('Read'),
        description: t('May view settings for the organization'),
      },
      approval_role: {
        id: 'Approve',
        label: t('Approve'),
        description: t('Can approve or deny a workflow approval node'),
      },
    },

    team: {
      member_role: {
        id: 'Member',
        label: t('Member'),
        description: t('Has all the permissons of the team'),
      },
    },
  };
}
