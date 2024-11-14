import { IPageAction, PageActionSelection, PageActionType } from '@ansible/ansible-ui-framework';
import { TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ExecutionEnvironment } from '../../ExecutionEnvironment';
import { useController } from '../../hooks/useController';
import { ExecutionEnvironmentImage as Image } from '../ExecutionEnvironmentImage';
import { useDeleteImages } from './useDeleteImages';
import { useExecutionEnvironmentManageTags } from './useExecutionEnvironmentManageTags';

export function useImagesToolbarActions({
  id,
  executionEnvironment,
  refresh,
}: {
  id: string;
  executionEnvironment: ExecutionEnvironment;
  refresh?: () => Promise<void>;
}) {
  const deleteImages = useDeleteImages({
    id,
    onComplete: () => {
      void refresh?.();
    },
  });
  const { t } = useTranslation();
  const executionEnvironmentManageTags = useExecutionEnvironmentManageTags(() => {
    void refresh?.();
  });
  const useInController = useController(executionEnvironment, /* isImage: */ true);

  return useMemo<IPageAction<Image>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        label: t('Manage tags'),
        onClick: (image) => {
          executionEnvironmentManageTags(executionEnvironment, image);
        },
        isHidden: () => !!executionEnvironment.pulp?.repository?.remote,
      },
      useInController,
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        isDanger: true,
        label: t('Delete'),
        onClick: (image) => {
          deleteImages([image]);
        },
      },
    ],
    [t, executionEnvironment, deleteImages, executionEnvironmentManageTags, useInController]
  );
}
