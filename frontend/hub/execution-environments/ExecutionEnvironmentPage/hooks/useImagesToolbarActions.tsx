import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrashIcon } from '@patternfly/react-icons';
import { IPageAction, PageActionType, PageActionSelection } from '../../../../../framework';
import { Image } from '../ExecutionEnvironmentImages';

export function useImagesToolbarActions() {
  const { t } = useTranslation();
  return useMemo<IPageAction<Image>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        label: t('Manage tags'),
        onClick: () => {},
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
        onClick: () => {},
      },
    ],
    [t]
  );
}
