import { Alert, Button, Content, ContentVariants } from '@patternfly/react-core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ViewIndirectlyAssignedRolesModal } from '../users/components/ViewIndirectlyAssignedRolesModal';

interface IndirectlyAssignedRolesAlertProps {
  userId: string;
  username?: string;
  resourceName?: string;
  isUsersRoles?: boolean; // Optional prop to indicate if this is for user roles
}

export function IndirectlyAssignedRolesAlert({
  userId,
  username,
  resourceName,
  isUsersRoles = false,
}: IndirectlyAssignedRolesAlertProps) {
  const { t } = useTranslation();
  const [isIndirectRolesModalOpen, setIsIndirectRolesModalOpen] = useState(false);
  const IndirectAssignmentsButton = styled(Button)`
    margin-left: calc(var(--pf-v6-c-button--PaddingBlockStart) * -1);
  `;

  return (
    <>
      <Alert
        isInline
        variant="info"
        style={{
          marginLeft: 24,
          marginRight: 24,
          marginTop: 24,
          paddingBottom: 0,
          marginBottom: 0,
        }}
        title={
          isUsersRoles
            ? t(
                `The list below includes all of this user's direct role assignments. Indirectly assigned roles, which are inherited through a team assignment, for {{username}} cannot be managed here.`,
                { username: username }
              )
            : t(
                `Indirectly assigned roles, which are inherited through a team assignment, and organization roles that give {{username}} access to {{resourceName}} cannot be managed here.`,
                { username: username || 'user', resourceName: resourceName || 'this resource' }
              )
        }
      >
        <Content component={ContentVariants.p} style={{ paddingBottom: 0, marginBottom: 0 }}>
          {t`To view these indirectly assigned roles click the button below. To modify indirect assignments manage the team's assignments.`}
        </Content>
        <Content component={ContentVariants.p}>
          <IndirectAssignmentsButton
            variant="link"
            onClick={() => setIsIndirectRolesModalOpen(true)}
          >
            {t`View indirectly assigned roles`}
          </IndirectAssignmentsButton>
        </Content>
      </Alert>

      <ViewIndirectlyAssignedRolesModal
        isOpen={isIndirectRolesModalOpen}
        onClose={() => setIsIndirectRolesModalOpen(false)}
        userId={userId}
        username={username}
      />
    </>
  );
}
