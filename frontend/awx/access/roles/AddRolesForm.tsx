/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageFormSelect } from '../../../../framework';
import { PageFormCheckbox } from '../../../../framework/PageForm/Inputs/PageFormCheckbox';
import { PageFormHidden } from '../../../../framework/PageForm/Utils/PageFormHidden';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { AwxPageForm } from '../../common/AwxPageForm';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxBulkActionDialog } from '../../common/useAwxBulkActionDialog';
import { Team } from '../../interfaces/Team';
import { AwxUser } from '../../interfaces/User';
import { PageFormInventorySelect } from '../../resources/inventories/components/PageFormInventorySelect';
import { PageFormProjectSelect } from '../../resources/projects/components/PageFormProjectSelect';
import { PageFormJobTemplateSelect } from '../../resources/templates/components/PageFormJobTemplateSelect';
import { PageFormWorkflowJobTemplateSelect } from '../../resources/templates/components/PageFormWorkflowJobTemplateSelect';
import { PageFormCredentialSelect } from '../credentials/components/PageFormCredentialSelect';
import { PageFormSelectOrganization } from '../organizations/components/PageFormOrganizationSelect';
import { AwxResourceTypeRoles, useAwxRoles } from './useAwxRoles';

interface UserRole {
  index: number;
  user: AwxUser;
  resource: { name: string };
  roleId: number;
  roleName: string;
}

interface TeamRole {
  index: number;
  team: Team;
  resource: { name: string };
  roleId: number;
  roleName: string;
}

type AddRole = UserRole | TeamRole;

export function AddRolesForm(props: { users?: AwxUser[]; teams?: Team[]; onClose?: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const openBulkActionDialog = useAwxBulkActionDialog<AddRole>();
  const postRequest = usePostRequest();
  return (
    <AwxPageForm
      onSubmit={(
        input: Record<string, boolean> & {
          resource: { summary_fields: { object_roles: Record<string, { id: number }> } };
        }
      ) => {
        const addRoles: AddRole[] = [];
        let index = 0;
        for (const key in input) {
          if (!key.endsWith('_role')) continue;
          const enabled = (input as unknown as Record<string, boolean>)[key];
          if (!enabled === true) continue;
          for (const user of props.users ?? []) {
            addRoles.push({
              index: index++,
              user,
              resource: input.resource as unknown as { name: string },
              roleId: input.resource.summary_fields.object_roles[key].id,
              roleName: key,
            });
          }
          for (const team of props.teams ?? []) {
            addRoles.push({
              index: index++,
              team,
              resource: input.resource as unknown as { name: string },
              roleId: input.resource.summary_fields.object_roles[key].id,
              roleName: key,
            });
          }
        }

        openBulkActionDialog({
          title: t('Adding roles'),
          items: addRoles,
          keyFn: (userRole) => userRole.index,
          actionColumns: [
            {
              header: props.users ? (props.teams ? t('User/Team') : t('User')) : t('Team'),
              cell: (addRole) => ('user' in addRole ? addRole.user.username : addRole.team.name),
            },
            { header: t('Resource'), cell: (addRole) => addRole.resource.name },
            { header: t('Role'), cell: (addRole) => addRole.roleName },
          ],
          actionFn: async (addRole, signal: AbortSignal) => {
            return 'user' in addRole
              ? await postRequest(
                  awxAPI`/users/${addRole.user.id.toString()}/roles/`,
                  { id: addRole.roleId },
                  signal
                )
              : await postRequest(
                  awxAPI`/teams/${addRole.team.id.toString()}/roles/`,
                  {
                    id: addRole.roleId,
                  },
                  signal
                );
          },
          onClose: props.onClose,
        });

        return Promise.resolve();
      }}
      onCancel={() => navigate(-1)}
      submitText={t('Submit')}
    >
      <PageFormSelect
        name="role"
        label={t('Role')}
        placeholderText={t('Select role')}
        options={[
          { value: 'credential', label: t('Credential') },
          { value: 'job_template', label: t('Job template') },
          { value: 'workflow_job_template', label: t('Workflow job template') },
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
    </AwxPageForm>
  );
}

function UserCredentialRole() {
  const rolesMetadata = useAwxRoles();
  const { t } = useTranslation();
  return (
    <PageFormHidden watch="role" hidden={(type: string) => type !== 'credential'}>
      <PageFormCredentialSelect
        name="credentialName"
        credentialPath="resource"
        label={t('Credentials')}
        labelHelpTitle={t('Credentials')}
        labelHelp={t('Choose credentials that will be receiving new roles.')}
        isMultiple
      />
      <Permissions resourceTypeRoles={rolesMetadata.credential} />
    </PageFormHidden>
  );
}

function UserJobTemplateRole() {
  const rolesMetadata = useAwxRoles();
  return (
    <PageFormHidden watch="role" hidden={(type: string) => type !== 'job_template'}>
      <PageFormJobTemplateSelect name="resource" />
      <Permissions resourceTypeRoles={rolesMetadata.job_template} />
    </PageFormHidden>
  );
}

function UserWorkflowJobTemplateRole() {
  const rolesMetadata = useAwxRoles();
  return (
    <PageFormHidden watch="role" hidden={(type: string) => type !== 'workflow_job_template'}>
      <PageFormWorkflowJobTemplateSelect name="resource" />
      <Permissions resourceTypeRoles={rolesMetadata.workflow_job_template} />
    </PageFormHidden>
  );
}

function UserInventoryRole() {
  const rolesMetadata = useAwxRoles();
  return (
    <PageFormHidden watch="role" hidden={(type: string) => type !== 'inventory'}>
      <PageFormInventorySelect name="inventoryName" />
      <Permissions resourceTypeRoles={rolesMetadata.inventory} />
    </PageFormHidden>
  );
}

function UserProjectRole() {
  const rolesMetadata = useAwxRoles();
  return (
    <PageFormHidden watch="role" hidden={(type: string) => type !== 'project'}>
      <PageFormProjectSelect name="resource" />
      <Permissions resourceTypeRoles={rolesMetadata.project} />
    </PageFormHidden>
  );
}

function UserOrganizationRole() {
  const rolesMetadata = useAwxRoles();
  return (
    <PageFormHidden watch="role" hidden={(type: string) => type !== 'organization'}>
      <PageFormSelectOrganization name="resource" isRequired />
      <Permissions resourceTypeRoles={rolesMetadata.organization} />
    </PageFormHidden>
  );
}

function Permissions(props: { resourceTypeRoles: AwxResourceTypeRoles }) {
  const { resourceTypeRoles } = props;
  const { t } = useTranslation();
  return (
    <PageFormSection title={t('Permissions')}>
      {Object.keys(resourceTypeRoles.roles).map((role) => {
        return (
          <PageFormCheckbox
            key={role}
            name={role}
            label={resourceTypeRoles.roles[role].description}
            description={resourceTypeRoles.roles[role].description}
          />
        );
      })}
    </PageFormSection>
  );
}
