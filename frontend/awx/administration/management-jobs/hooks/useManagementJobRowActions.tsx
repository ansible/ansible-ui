import { ButtonVariant } from '@patternfly/react-core';
import { RocketIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
import { useManagementJobsRetainDataModal } from '../components/ManagementJobsRetainDataModal';

export function useManagementJobRowActions() {
  const { t } = useTranslation();

  const openManagementJobsModal = useManagementJobsRetainDataModal();

  return useMemo<IPageAction<SystemJobTemplate>[]>(() => {
    const actions: IPageAction<SystemJobTemplate>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.secondary,
        isPinned: true,
        icon: RocketIcon,
        label: t(`Launch Management Job`),
        onClick: (managementJob: SystemJobTemplate) =>
          openManagementJobsModal({ id: managementJob.id }),
      },
    ];
    return actions;
  }, [t, openManagementJobsModal]);
}
