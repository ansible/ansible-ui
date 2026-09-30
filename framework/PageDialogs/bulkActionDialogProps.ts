import { ReactNode } from 'react';
import { ErrorAdapter } from '../PageForm/typesErrorAdapter';
import { ITableColumn } from '../PageTable/PageTableColumn';
import { StatusWithMessageAndUrl } from './bulkActionDialogTypes';

export interface BulkActionDialogProps<T extends object> {
  title: string;
  description?: ReactNode | string;
  items: T[];
  keyFn: (item: T) => string | number;
  actionColumns: ITableColumn<T>[];
  actionFn: (item: T, signal: AbortSignal) => Promise<unknown>;
  onComplete?: (successfulItems: T[]) => void;
  onClose?: (
    status: 'success' | 'failures' | 'canceled',
    successfulItems: T[],
    failedItems: T[],
    canceledItems: T[]
  ) => void;
  processingText?: string;
  isDanger?: boolean;
  errorAdapter?: ErrorAdapter;
  statusParser?: (response: unknown) => null | StatusWithMessageAndUrl;
}
