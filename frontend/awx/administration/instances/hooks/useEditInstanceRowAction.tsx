import { PencilAltIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { useGet } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { Instance } from '../../../interfaces/Instance';
import { Settings } from '../../../interfaces/Settings';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useEditInstanceRowAction() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const { activeAwxUser } = useAwxActiveUser();
  const { data } = useGet<Settings>(awxAPI`/settings/system/`);
  const userAccess = activeAwxUser?.is_superuser || activeAwxUser?.is_system_auditor;
  const isK8s = data?.IS_K8S;

  return useMemo<IPageAction<Instance>>(
    () => ({
      type: PageActionType.Button,
      selection: PageActionSelection.Single,
      icon: PencilAltIcon,
      isPinned: true,
      label: t('Edit instance'),
      onClick: (instance) => pageNavigate(AwxRoute.EditInstance, { params: { id: instance.id } }),
      isDisabled: (instance) =>
        !userAccess ||
        !isK8s ||
        (instance?.node_type !== 'execution' && instance?.node_type !== 'hop')
          ? t(
              'You do not have permission to edit instances. Please contact your organization administrator if there is an issue with your access.'
            )
          : undefined,
    }),
    [t, pageNavigate, isK8s, userAccess]
  );
}
