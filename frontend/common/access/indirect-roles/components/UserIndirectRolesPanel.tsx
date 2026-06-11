import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIndirectTeamRolesView } from '../hooks/useIndirectTeamRolesView';
import { IndirectRolesAlert } from './IndirectRolesAlert';
import { IndirectRolesModal } from './IndirectRolesModal';

interface IndirectRolesPlatformContext {
  userId: string;
  username?: string;
}

export function UserIndirectRolesPanel({ userId, username }: IndirectRolesPlatformContext) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { view, tableColumns } = useIndirectTeamRolesView(userId);

  const count = view.itemCount ?? view.pageItems?.length ?? 0;
  const isLoaded = view.itemCount !== undefined || view.pageItems !== undefined;
  const hasIndirectRoles = count > 0;

  return (
    <>
      {isLoaded && hasIndirectRoles && (
        <IndirectRolesAlert
          title={t(
            `The list below includes all of this user's direct role assignments. Indirectly assigned roles, which are inherited through a team assignment, for {{username}} cannot be managed here.`,
            { username: username ?? 'user' }
          )}
          description={t(
            `To view these indirectly assigned roles click the button below. To modify indirect role assignments, manage the team's assignments.`
          )}
          onOpen={() => setIsOpen(true)}
          style={{
            marginInline: 'var(--pf-t--global--spacer--md)',
            marginBlock: 'var(--pf-t--global--spacer--md)',
          }}
        />
      )}
      <IndirectRolesModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        username={username}
        view={view}
        tableColumns={tableColumns}
        modalDescription={t(
          `Below is a list of roles indirectly assigned to this user through a team assignment. To modify roles assigned to the user from a team assignment manage the team's assignments.`
        )}
      />
    </>
  );
}
