import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
} from '../../../../../framework';
import { Application } from '../../../interfaces/Application';
import { useDeleteApplications } from '../hooks/useDeleteApplications';
import { AwxRoute } from '../../../AwxRoutes';
import { useActiveUser } from '../../../../common/useActiveUser';

export function useApplicationActions(options: {
  onApplicationsDeleted: (applications: Application[]) => void;
}) {
  const activeUser = useActiveUser();
  const { onApplicationsDeleted } = options;
  const { t } = useTranslation();
  const deleteApplications = useDeleteApplications(onApplicationsDeleted);
  const getPageUrl = useGetPageUrl();

  return useMemo<IPageAction<Application>[]>(() => {
    const itemActions: IPageAction<Application>[] = [
      {
        type: PageActionType.Link,
        isHidden: (application) => !application?.summary_fields.user_capabilities.edit,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit application'),
        ouiaId: 'application-detail-edit-button',
        href: () => getPageUrl(AwxRoute.Applications),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        isHidden: (application) =>
          !application?.summary_fields.user_capabilities.delete || activeUser?.is_system_auditor
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
  }, [deleteApplications, getPageUrl, activeUser?.is_system_auditor, t]);
}
