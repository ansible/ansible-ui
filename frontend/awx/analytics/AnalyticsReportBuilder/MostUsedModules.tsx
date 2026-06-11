/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { Flex, FlexItem } from '@patternfly/react-core';
import { ExpandableRowContent } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { Breakdown } from '../components/Chart/Breakdown';
import { AnyType } from './AnalyticsReportBuilder';
import { categoryColor } from './constants';

export const TableExpandedRow: React.ReactElement = (props: { item: AnyType }) => {
  const { t } = useTranslation();
  const item = props.item;
  const totalTaskCount = item
    ? {
        ok: item?.host_task_ok_count ?? 0,
        changed: item?.host_task_changed_count ?? 0,
        failed: item?.host_task_failed_count ?? 0,
        skipped: item?.host_task_skipped_count ?? 0,
        unreachable: item?.host_task_unreachable_count ?? 0,
      }
    : null;

  return (
    <ExpandableRowContent>
      <Flex>
        <FlexItem>
          <strong>{t('All Task status')}</strong>
        </FlexItem>
        <FlexItem align={{ default: 'alignRight' }}>
          <strong>{t('Tasks')}</strong>
          {'  '}
          {item?.host_task_count ?? 0}
        </FlexItem>
      </Flex>
      <Breakdown categoryCount={totalTaskCount} categoryColor={categoryColor} showPercent />
    </ExpandableRowContent>
  );
};
