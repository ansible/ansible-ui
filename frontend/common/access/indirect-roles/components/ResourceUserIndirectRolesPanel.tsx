import { useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useIndirectTeamRolesOnResourceView } from '../hooks/useIndirectTeamRolesOnResourceView';
import { IndirectRolesAlert } from './IndirectRolesAlert';
import { IndirectRolesModal } from './IndirectRolesModal';

interface ResourceIndirectRolesResourceContext {
  resourceType: string;
  resourceId: string;
  ansibleUserId: string;
  username?: string;
  resourceName?: string;
}

interface ResourceIndirectRolesContentConfig {
  alertTitle: string | ReactNode;
  alertDescription: string | ReactNode;
  alertLink?: string;
  modalTitle?: string | ReactNode;
  modalDescription: string | ReactNode;
}

export function ResourceUserIndirectRolesPanel({
  context,
  content,
}: {
  context: ResourceIndirectRolesResourceContext;
  content: ResourceIndirectRolesContentConfig;
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { view, tableColumns } = useIndirectTeamRolesOnResourceView(
    context.resourceType,
    context.resourceId,
    context.ansibleUserId
  );

  const count = view.itemCount ?? view.pageItems?.length ?? 0;
  const isLoaded = view.itemCount !== undefined || view.pageItems !== undefined;
  const hasIndirectRoles = count > 0;

  const defaultModalTitle = t('Indirectly assigned roles for {{username}}', {
    username: context.username ?? 'user',
  });

  return (
    <>
      {isLoaded && hasIndirectRoles && (
        <IndirectRolesAlert
          actionLabel={content?.alertLink}
          title={content.alertTitle}
          description={content.alertDescription}
          onOpen={() => setIsOpen(true)}
          style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
        />
      )}
      <IndirectRolesModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        view={view}
        tableColumns={tableColumns}
        modalDescription={content.modalDescription}
        modalTitle={content?.modalTitle ?? defaultModalTitle}
      />
    </>
  );
}
