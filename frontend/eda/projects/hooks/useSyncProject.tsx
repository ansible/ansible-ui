import { postRequest, requestGet } from '@ansible/common-ui/crud/Data';
import { useCallback, useMemo } from 'react';
import { EdaProject } from '../../interfaces/EdaProject';
import { edaAPI } from '../../common/eda-utils';
import { useTranslation } from 'react-i18next';
import { useProjectColumns } from './useProjectColumns';
import { useEdaBulkConfirmation } from '../../common/useEdaBulkConfirmation';
import { EdaItemsResponse } from '../../common/EdaItemsResponse';
import { compareStrings, usePageAlertToaster } from '@ansible/ansible-ui-framework';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';

export function useSyncProject(onComplete: (projects: EdaProject[]) => void) {
  const bulkAction = useEdaBulkConfirmation<EdaProject>();
  const confirmationColumns = useProjectColumns({ disableLinks: true });
  const alertToast = usePageAlertToaster();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const { t } = useTranslation();

  const rulebookActivationsWarnings = useCallback(
    async (project: EdaProject) => {
      const { results } = await requestGet<EdaItemsResponse<EdaRulebookActivation>>(
        edaAPI`/activations/?project_id=${project.id}`
      );
      const activations = results
        .filter((result) => result.restart_on_project_update === true)
        .sort((l, r) => compareStrings(l.name, r.name))
        .map((rb) => rb.name);
      if (activations.length < 1) {
        return '';
      }
      const message = t(
        'The following Rulebook Activations are configured to restart on project sync. \n {{activations}}',
        {
          activations: activations.join(', '),
        }
      );
      return message;
    },
    [t]
  );

  return useCallback(
    async (projects: EdaProject[]) => {
      try {
        const activationsWarning = await rulebookActivationsWarnings(projects[0]);
        bulkAction({
          title: t('Sync project {{name}}', { name: projects[0].name }),
          confirmText: t('Yes, I confirm that I want to sync these {{count}} projects.', {
            count: projects.length,
          }),
          actionButtonText: t('Sync projects', { count: projects.length }),
          items: projects,
          keyFn: (item: EdaProject) => item?.id,
          isDanger: true,
          confirmationColumns,
          actionColumns,
          onComplete,
          actionFn: (item: EdaProject, _signal: AbortSignal) =>
            postRequest(edaAPI`/projects/${item.id.toString()}/sync/`, undefined),
          ...(activationsWarning.length && {
            alertPrompts: [activationsWarning],
          }),
        });
      } catch (err) {
        alertToast.addAlert({
          variant: 'danger',
          title: t('Something went wrong.'),
          children: err instanceof Error && err.message,
        });
      }
    },
    [
      actionColumns,
      bulkAction,
      confirmationColumns,
      t,
      onComplete,
      alertToast,
      rulebookActivationsWarnings,
    ]
  );
}
