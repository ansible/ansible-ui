import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrashIcon } from '@patternfly/react-icons';
import { IPageAction, PageActionType, PageActionSelection } from '../../../../../framework';
import { ExecutionEnvironmentImage as Image } from '../ExecutionEnvironmentImage';
import { useDeleteImages } from './useDeleteImages';

export function useImagesToolbarActions({
  id,
  refresh,
}: {
  id: string;
  refresh?: () => Promise<void>;
}) {
  const deleteImages = useDeleteImages({
    id,
    onComplete: () => {
      void refresh?.();
    },
  });

export function useImagesToolbarActions() {
  const { t } = useTranslation();
  const executionEnvironmentManageTags = useExecutionEnvironmentManageTags();

  return useMemo<IPageAction<Image>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        label: t('Manage tags'),
        onClick: (image) => {
          executionEnvironmentManageTags(ee, image);
        },
        isHidden: () => !!ee.pulp?.repository?.remote,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        label: t('Use in Controller'),
        onClick: () => {},
      },
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
    [t, deleteImages, executionEnvironmentManageTags]
  );
}
