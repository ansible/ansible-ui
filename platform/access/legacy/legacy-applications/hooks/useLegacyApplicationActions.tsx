import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { useAwxActiveUser } from '@ansible/awx-ui/common/useAwxActiveUser';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PlatformRoute } from '../../../../main/PlatformRoutes';
import { useDeleteLegacyApplications } from './useDeleteLegacyApplications';

export function useLegacyApplicationActions(options: {
  onApplicationsDeleted: (applications: Application[]) => void;
}) {
  const { activeAwxUser } = useAwxActiveUser();
  const { onApplicationsDeleted } = options;
  const { t } = useTranslation();
  const deleteApplications = useDeleteLegacyApplications(onApplicationsDeleted);
  const pageNavigate = usePageNavigate();

  return useMemo<IPageAction<Application>[]>(() => {
    const itemActions: IPageAction<Application>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        variant: ButtonVariant.primary,
        label: t('Edit legacy application'),
        ouiaId: 'application-detail-edit-button',
        isHidden: (_application) => !activeAwxUser?.is_superuser,
        onClick: (application) =>
          pageNavigate(PlatformRoute.EditLegacyApplication, {
            params: { applicationId: application.id },
          }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete legacy application'),
        isHidden: (_application) => !activeAwxUser?.is_superuser,
        onClick: (application) => {
          if (!application) return;
          deleteApplications([application]);
        },
        ouiaId: 'application-detail-delete-button',
        isDanger: true,
        isPinned: false,
      },
    ];
    return itemActions;
  }, [t, pageNavigate, activeAwxUser?.is_superuser, deleteApplications]);
}
