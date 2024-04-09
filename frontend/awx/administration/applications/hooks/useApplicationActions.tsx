import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { Application } from '../../../interfaces/Application';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useDeleteApplications } from '../hooks/useDeleteApplications';

export function useApplicationActions(options: {
  onApplicationsDeleted: (applications: Application[]) => void;
}) {
  const { activeAwxUser } = useAwxActiveUser();
  const { onApplicationsDeleted } = options;
  const { t } = useTranslation();
  const deleteApplications = useDeleteApplications(onApplicationsDeleted);
  const pageNavigate = usePageNavigate();

  return useMemo<IPageAction<Application>[]>(() => {
    const itemActions: IPageAction<Application>[] = [
      {
        type: PageActionType.Button,
        isHidden: (application) => !application?.summary_fields.user_capabilities.edit,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit application'),
        ouiaId: 'application-detail-edit-button',
        onClick: (application) =>
          pageNavigate(AwxRoute.EditApplication, { params: { id: application.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        isHidden: (application) =>
          !application?.summary_fields.user_capabilities.delete || activeAwxUser?.is_system_auditor
            ? true
            : false,
        label: t('Delete application'),
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
  }, [t, pageNavigate, activeAwxUser?.is_system_auditor, deleteApplications]);
}
