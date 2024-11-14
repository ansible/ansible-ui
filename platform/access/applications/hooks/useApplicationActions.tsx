import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlatformActiveUser } from '../../../main/PlatformActiveUserProvider';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useDeleteApplications } from './useDeleteApplications';

export function useApplicationActions(options: {
  onApplicationsDeleted: (applications: Application[]) => void;
}) {
  const { activePlatformUser } = usePlatformActiveUser();
  const { onApplicationsDeleted } = options;
  const { t } = useTranslation();
  const deleteApplications = useDeleteApplications(onApplicationsDeleted);
  const pageNavigate = usePageNavigate();

  return useMemo<IPageAction<Application>[]>(() => {
    const itemActions: IPageAction<Application>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        variant: ButtonVariant.primary,
        label: t('Edit OAuth application'),
        ouiaId: 'application-detail-edit-button',
        isHidden: (_application) => !activePlatformUser?.is_superuser,
        onClick: (application) =>
          pageNavigate(PlatformRoute.EditApplication, { params: { id: application.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete OAuth application'),
        isHidden: (_application) => !activePlatformUser?.is_superuser,
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
  }, [t, pageNavigate, activePlatformUser?.is_superuser, deleteApplications]);
}
