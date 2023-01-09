/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageForm, PageFormSelectOption, useBulkActionDialog } from '../../../../framework';
import { PageFormCheckbox } from '../../../../framework/PageForm/Inputs/PageFormCheckbox';
import { PageFormHidden } from '../../../../framework/PageForm/Utils/PageFormHidden';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { requestPost } from '../../../Data';
import { User } from '../../interfaces/User';
import { PageFormCredentialSelect } from '../../resources/credentials/components/PageFormCredentialSelect';
import { PageFormInventorySelect } from '../../resources/inventories/components/PageFormInventorySelect';
import { PageFormProjectSelect } from '../../resources/projects/components/PageFormProjectSelect';
import { PageFormJobTemplateSelect } from '../../resources/templates/components/PageFormJobTemplateSelect';
import { PageFormOrganizationSelect } from '../organizations/components/PageFormOrganizationSelect';

interface UserRole {
  index: number;
  user: User;
  resource: { name: string };
  roleId: number;
  roleName: string;
}

export function AddRolesToUsersForm(props: { users: User[]; onClose?: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const openBulkActionDialog = useBulkActionDialog<UserRole>();
  return (
    <PageForm
      onSubmit={(
        input: Record<string, boolean> & {
          resource: { summary_fields: { object_roles: Record<string, { id: number }> } };
        }
      ) => {
        const userRoles: UserRole[] = [];
        let index = 0;
        for (const key in input) {
          if (!key.endsWith('_role')) continue;
          const enabled = (input as unknown as Record<string, boolean>)[key];
          if (!enabled === true) continue;
          for (const user of props.users)
            userRoles.push({
              index: index++,
              user,
              resource: input.resource as unknown as { name: string },
              roleId: input.resource.summary_fields.object_roles[key].id,
              roleName: key,
            });
        }

        openBulkActionDialog({
          title: t('Adding roles'),
          items: userRoles,
          keyFn: (userRole) => userRole.index,
          actionColumns: [
            { header: t('User'), cell: (userRole) => userRole.user.username },
            { header: t('Resource'), cell: (userRole) => userRole.resource.name },
            { header: t('Role'), cell: (userRole) => userRole.roleName },
          ],
          actionFn: (userRole) =>
            requestPost(`/api/v2/users/${userRole.user.id}/roles/`, {
              id: userRole.roleId,
            }),
          onClose: props.onClose,
        });

        return Promise.resolve();
      }}
      onCancel={() => navigate(-1)}
      submitText={t('Submit')}
    >
      <PageFormSelectOption
        name="role"
        label="Role"
        placeholderText="Select role"
        options={[
          { value: 'credential', label: t('Credential') },
          { value: 'job-template', label: t('Job template') },
          { value: 'workflow-job-template', label: t('Workflow job template') },
          { value: 'inventory', label: t('Inventory') },
          { value: 'project', label: t('Project') },
          { value: 'organization', label: t('Organization') },
        ]}
        isRequired
      />
      <UserCredentialRole />
      <UserJobTemplateRole />
      <UserWorkflowJobTemplateRole />
      <UserInventoryRole />
      <UserProjectRole />
      <UserOrganizationRole />
    </PageForm>
  );
}

function UserCredentialRole() {
  const { t } = useTranslation();
  return (
    <PageFormHidden watch="role" hidden={(type: string) => type !== 'credential'}>
      <PageFormCredentialSelect name="credentialName" credentialPath="resource" />
      <PageFormSection title={t('Permissions')}>
        <PageFormCheckbox
          name="admin_role"
          label={t('Admin')}
          description={t('Can manage all aspects of the credential')}
        />
        <PageFormCheckbox
          name="read_role"
          label={t('Read')}
          description={t('May view settings for the credential')}
        />
        <PageFormCheckbox
          name="use_role"
          label={t('Use')}
          description={t('Can use the credential in a job template')}
        />
      </PageFormSection>
    </PageFormHidden>
  );
}

function UserJobTemplateRole() {
  const { t } = useTranslation();
  return (
    <PageFormHidden watch="role" hidden={(type: string) => type !== 'job-template'}>
      <PageFormJobTemplateSelect name="jobTemplateName" jobTemplatePath="resource" />
      <PageFormSection title={t('Permissions')}>
        <PageFormCheckbox
          name="admin_role"
          label={t('Admin')}
          description={t('Can manage all aspects of the job template')}
        />
        <PageFormCheckbox
          name="read_role"
          label={t('Read')}
          description={t('May view settings for the job template')}
        />
        <PageFormCheckbox
          name="use_role"
          label={t('Use')}
          description={t('May run the job template')}
        />
      </PageFormSection>
    </PageFormHidden>
  );
}

function UserWorkflowJobTemplateRole() {
  const { t } = useTranslation();
  return (
    <PageFormHidden watch="role" hidden={(type: string) => type !== 'workflow-job-template'}>
      <PageFormJobTemplateSelect name="workflowJobTemplateName" jobTemplatePath="resource" />
      <PageFormSection title={t('Permissions')}>
        <PageFormCheckbox
          name="admin_role"
          label={t('Admin')}
          description={t('Can manage all aspects of the workflow job template')}
        />
        <PageFormCheckbox
          name="execute_role"
          label={t('Execute')}
          description={t('May run the workflow job template')}
        />
        <PageFormCheckbox
          name="read_role"
          label={t('Read')}
          description={t('May view settings for the workflow job template')}
        />
        <PageFormCheckbox
          name="approval_role"
          label={t('Approve')}
          description={t('Can approve or deny a workflow approval node')}
        />
      </PageFormSection>
    </PageFormHidden>
  );
}

function UserInventoryRole() {
  const { t } = useTranslation();
  return (
    <PageFormHidden watch="role" hidden={(type: string) => type !== 'inventory'}>
      <PageFormInventorySelect name="inventoryName" inventoryPath="resource" />
      <PageFormSection title={t('Permissions')}>
        <PageFormCheckbox
          name="admin_role"
          label={t('Admin')}
          description={t('Can manage all aspects of the inventory')}
        />
        <PageFormCheckbox
          name="update_role"
          label={t('Update')}
          description={t('May update the inventory')}
        />
        <PageFormCheckbox
          name="adhoc_role"
          label={t('Adhoc')}
          description={t('May run ad hoc commands on the inventory')}
        />
        <PageFormCheckbox
          name="use_role"
          label={t('Use')}
          description={t('Can use the inventory in a job template')}
        />
        <PageFormCheckbox
          name="read_role"
          label={t('Read')}
          description={t('May view settings for the inventory')}
        />
      </PageFormSection>
    </PageFormHidden>
  );
}

function UserProjectRole() {
  const { t } = useTranslation();
  return (
    <PageFormHidden watch="role" hidden={(type: string) => type !== 'project'}>
      <PageFormProjectSelect name="projectName" projectPath="resource" />
      <PageFormSection title={t('Permissions')}>
        <PageFormCheckbox
          name="admin_role"
          label={t('Admin')}
          description={t('Can manage all aspects of the project')}
        />
        <PageFormCheckbox
          name="read_role"
          label={t('Read')}
          description={t('May view settings for the project')}
        />
        <PageFormCheckbox
          name="update_role"
          label={t('Update')}
          description={t('May update the project')}
        />
        <PageFormCheckbox
          name="use_role"
          label={t('Use')}
          description={t('Can use the project in a job template')}
        />
      </PageFormSection>
    </PageFormHidden>
  );
}

function UserOrganizationRole() {
  const { t } = useTranslation();
  return (
    <PageFormHidden watch="role" hidden={(type: string) => type !== 'organization'}>
      <PageFormOrganizationSelect name="organizationName" organizationPath="resource" />
      <PageFormSection title={t('Permissions')}>
        <PageFormCheckbox
          name="admin_role"
          label={t('Admin')}
          description={t('Can manage all aspects of the organization')}
        />
        <PageFormCheckbox
          name="execute_role"
          label={t('Execute')}
          description={t('May run any executable resources in the organization')}
        />
        <PageFormCheckbox
          name="project_admin_role"
          label={t('Project Admin')}
          description={t('Can manage all projects of the organization')}
        />
        <PageFormCheckbox
          name="inventory_admin_role"
          label={t('Inventory Admin')}
          description={t('Can manage all inventories of the organization')}
        />
        <PageFormCheckbox
          name="credential_admin_role"
          label={t('Credential Admin')}
          description={t('Can manage all credentials of the organization')}
        />
        <PageFormCheckbox
          name="workflow_admin_role"
          label={t('Workflow Admin')}
          description={t('Can manage all workflows of the organization')}
        />
        <PageFormCheckbox
          name="notification_admin_role"
          label={t('Notification Admin')}
          description={t('Can manage all notifications of the organization')}
        />
        <PageFormCheckbox
          name="job_template_admin_role"
          label={t('Job Template Admin')}
          description={t('Can manage all job templates of the organization')}
        />
        <PageFormCheckbox
          name="execution_environment_admin_role"
          label={t('Execution Environment Admin')}
          description={t('Can manage all execution environments of the organization')}
        />
        <PageFormCheckbox
          name="auditor_role"
          label={t('Auditor')}
          description={t('Can view all aspects of the organization')}
        />
        <PageFormCheckbox
          name="member_role"
          label={t('Member')}
          description={t('User is a member of the organization')}
        />
        <PageFormCheckbox
          name="read_role"
          label={t('Read')}
          description={t('May view settings for the organization')}
        />
        <PageFormCheckbox
          name="approval_role"
          label={t('Approve')}
          description={t('Can approve or deny a workflow approval node')}
        />
      </PageFormSection>
    </PageFormHidden>
  );
}
