import {
  Button,
  Progress,
  ProgressSize,
  ProgressVariant,
  Modal,
  ModalVariant,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon, PendingIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { PageTable } from '../PageTable/PageTable';
import { useVisibleModalColumns } from '../PageTable/PageTableColumn';
import { usePaged } from '../PageTable/useTableItems';
import { pfDanger, pfInfo, pfSuccess } from '../components/pfcolors';
import { StatusWithMessageAndUrl } from './bulkActionDialogTypes';
import { BulkActionDialogViewProps } from './useBulkActionDialogLogic';

export function BulkActionDialogView<T extends object>(props: BulkActionDialogViewProps<T>) {
  const {
    items,
    keyFn,
    actionColumns,
    title,
    description,
    isDanger,
    isProcessing,
    error,
    isCanceled,
    progress,
    statuses,
    progressTitle,
    translations,
    t,
    onCancelClicked,
    onCloseClicked,
    onRetryClicked,
  } = props;

  const pagination = usePaged(items);
  const modalColumns = useVisibleModalColumns(actionColumns);

  const progressVariant = useMemo(() => {
    if (error || isCanceled) return ProgressVariant.danger;
    if (progress === items.length) return ProgressVariant.success;
    return undefined;
  }, [error, isCanceled, items.length, progress]);

  const modalActions = useMemo(() => {
    if (isProcessing) {
      return [
        <Button key="cancel" variant="link" onClick={onCancelClicked}>
          {t('Cancel')}
        </Button>,
      ];
    }
    if (error) {
      return [
        <Button key="retry" variant="primary" onClick={onRetryClicked}>
          {t('Retry')}
        </Button>,
        <Button key="close" variant="secondary" onClick={onCloseClicked}>
          {t('Close')}
        </Button>,
      ];
    }
    return [];
  }, [error, isProcessing, onCancelClicked, onCloseClicked, onRetryClicked, t]);

  return (
    <Modal
      ouiaId={title}
      variant={ModalVariant.medium}
      isOpen
      onClose={() => {
        onCancelClicked();
        onCloseClicked();
      }}
      aria-label={title}
    >
      <ModalHeader
        title={title}
        titleIconVariant={isDanger ? 'warning' : undefined}
        description={description}
      />
      <ModalBody style={{ paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 560,
            overflow: 'hidden',
            borderTop: 'var(--pf-t--global--border--color--default)',
          }}
        >
          <PageTable<T>
            key="status"
            pageItems={[...pagination.paged]}
            itemCount={items.length}
            tableColumns={[
              ...modalColumns,
              {
                header: t(`Status`),
                cell: (item) => {
                  const key = keyFn(item);
                  const status = statuses?.[key];
                  if (status === undefined) {
                    return (
                      <span style={{ color: pfInfo }}>
                        {<PendingIcon />}&nbsp; {translations.pendingText}
                      </span>
                    );
                  }
                  if (status === null) {
                    return (
                      <span style={{ color: pfSuccess }}>
                        {<CheckCircleIcon />}&nbsp; {translations.successText}
                      </span>
                    );
                  }
                  if (
                    (status as StatusWithMessageAndUrl).message &&
                    (status as StatusWithMessageAndUrl).url
                  ) {
                    return (
                      <a href={(status as StatusWithMessageAndUrl).url}>
                        {(status as StatusWithMessageAndUrl).message}
                      </a>
                    );
                  }
                  return (
                    <span style={{ color: pfDanger }}>
                      {<ExclamationCircleIcon />}&nbsp; {statuses?.[key] as string}
                    </span>
                  );
                },
              },
            ]}
            keyFn={keyFn}
            compact
            errorStateTitle=""
            emptyStateTitle={t('No items')}
            autoHidePagination={true}
            disableBodyPadding
            {...pagination}
          />
        </div>
      </ModalBody>
      <ModalBody style={{ paddingTop: 0 }}>
        <Progress
          data-cy="progress"
          data-testid="progress"
          value={(progress / items.length) * 100}
          title={progressTitle}
          size={ProgressSize.lg}
          variant={progressVariant}
        />
      </ModalBody>
      <ModalFooter>{modalActions}</ModalFooter>
    </Modal>
  );
}
