import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { ExecutionEnvironmentImage } from '../ExecutionEnvironmentImage';
import { useImagesColumns } from './useImagesColumns';
import { hubAPI } from '../../../common/api/formatPath';
import { hubAPIDelete } from '../../../common/api/hub-api-utils';
import { useHubBulkConfirmation } from '../../../common/useHubBulkConfirmation';
import { idKeyFn } from '../../../../common/utils/nameKeyFn';

export function useDeleteImages({
  id,
  onComplete,
}: {
  id: string;
  onComplete?: (images: ExecutionEnvironmentImage[]) => void;
}) {
  const { t } = useTranslation();
  const confirmationColumns = useImagesColumns({ id, disableLinks: true });
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useHubBulkConfirmation<ExecutionEnvironmentImage>();
  return useCallback(
    (images: ExecutionEnvironmentImage[]) => {
      bulkAction({
        title: t('Permanently delete execution environment images', {
          count: images.length,
        }),
        confirmText: t(
          'Yes, I confirm that I want to delete these {{count}} execution environment images.',
          { count: images.length }
        ),
        actionButtonText: t('Delete execution environment images', { count: images.length }),
        items: images.sort((l, r) => compareStrings(l.digest, r.digest)),
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (image: ExecutionEnvironmentImage, signal: AbortSignal) =>
          deleteImage(id, image, signal),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t, id]
  );
}

async function deleteImage(id: string, image: ExecutionEnvironmentImage, signal: AbortSignal) {
  return await hubAPIDelete(
    hubAPI`/v3/plugin/execution-environments/repositories/${id}/_content/images/${image.digest}/`,
    signal
  );
}
