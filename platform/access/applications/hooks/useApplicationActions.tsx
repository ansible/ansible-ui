import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../framework';
import { Application } from '../../../../frontend/awx/interfaces/Application';
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
        label: t('Edit application'),
        ouiaId: 'application-detail-edit-button',
        isHidden: (_application) => !activePlatformUser?.is_superuser ?? false,
        onClick: (application) =>
          pageNavigate(PlatformRoute.EditApplication, { params: { id: application.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete application'),
        isHidden: (_application) => !activePlatformUser?.is_superuser ?? false,
        onClick: (application) => {
          if (!application) return;
          deleteApplications([application]);
        },
        ouiaId: 'application-detail-delete-button',
        isDanger: true,
        isPinned: true,
      },
    ];
    return itemActions;
  }, [t, pageNavigate, activePlatformUser?.is_superuser, deleteApplications]);
}
