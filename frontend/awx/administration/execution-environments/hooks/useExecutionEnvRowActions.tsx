import { CopyIcon, PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  usePageNavigate,
  IPageAction,
  PageActionType,
  PageActionSelection,
  usePageAlertToaster,
} from '../../../../../framework';
import {
  cannotEditResource,
  cannotDeleteResource,
  cannotCopyResource,
} from '../../../../common/utils/RBAChelpers';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useDeleteExecutionEnvironments } from './useDeleteExecutionEnvironments';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { AlertProps, ButtonVariant } from '@patternfly/react-core';

type ExecutionEnvironmentActionOptions = {
  onDelete: (executionEnvironments: ExecutionEnvironment[]) => void;
  onCopy: (() => Promise<void>) | ((ee: ExecutionEnvironment) => void);
};

export function useExecutionEnvRowActions({ onDelete, onCopy }: ExecutionEnvironmentActionOptions) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments(onDelete);
  const alertToaster = usePageAlertToaster();
  const postRequest = usePostRequest();
  return useMemo<IPageAction<ExecutionEnvironment>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        variant: ButtonVariant.primary,
        isPinned: true,
        label: t('Edit execution environment'),
        isDisabled: (executionEnvironment) => cannotEditResource(executionEnvironment, t),
        onClick: (executionEnvironment) =>
          pageNavigate(AwxRoute.EditExecutionEnvironment, {
            params: { id: executionEnvironment.id },
          }),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: CopyIcon,
        isPinned: false,
        label: t('Copy execution environment'),
        isDisabled: (executionEnvironment) => cannotCopyResource(executionEnvironment, t),
        onClick: (ee) => {
          const alert: AlertProps = {
            variant: 'success',
            title: t(`${ee.name} copied.`),
            timeout: 2000,
          };
          postRequest(awxAPI`/execution_environments/${ee?.id.toString() ?? ''}/copy/`, {
            name: `${ee.name} @ ${new Date().toTimeString()}`,
          })
            .then(async (res) => {
              alertToaster.addAlert(alert);
              await onCopy(res as ExecutionEnvironment);
            })
            .catch((error) => {
              alertToaster.replaceAlert(alert, {
                variant: 'danger',
                title: t('Failed to copy execution environment'),
                children: error instanceof Error && error.message,
              });
            });
        },
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete execution environment'),
        isHidden: (executionEnvironment) => executionEnvironment.managed,
        isDisabled: (executionEnvironment) => cannotDeleteResource(executionEnvironment, t),
        onClick: (executionEnvironment) => deleteExecutionEnvironments([executionEnvironment]),
        isDanger: true,
      },
    ],
    [pageNavigate, deleteExecutionEnvironments, alertToaster, postRequest, onCopy, t]
  );
}
