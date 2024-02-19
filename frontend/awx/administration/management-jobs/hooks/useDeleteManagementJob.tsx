import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { getJobsAPIUrl, isJobRunning } from '../jobUtils';
import { useJobsColumns } from './useJobsColumns';

export default function useDeleteManagementJob() {
    const { t } = useTranslation();
    
}
