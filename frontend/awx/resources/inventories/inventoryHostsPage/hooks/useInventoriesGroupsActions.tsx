import { PencilAltIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../../framework';
import { cannotEditResource } from '../../../../../common/utils/RBAChelpers';
import { AwxRoute } from '../../../../main/AwxRoutes';
import { InventoryGroup } from '../../../../interfaces/InventoryGroup';

export function useInventoriesGroupsActions() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();

  return useMemo<IPageAction<InventoryGroup>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit group'),
        // Need to update routing to go to inventory group edit form when that will be implemented AAP-19476
        onClick: (host) => pageNavigate(AwxRoute.EditHost, { params: { id: host.id } }),
        isDisabled: (host) => cannotEditResource(host, t),
      },
    ],
    [t, pageNavigate]
  );
}
