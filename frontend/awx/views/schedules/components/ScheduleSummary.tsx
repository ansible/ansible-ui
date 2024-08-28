import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { postRequest } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { Flex, FlexItem, Label } from '@patternfly/react-core';
import { DateTime } from 'luxon';
import { LabelGroupWrapper } from '../../../../common/label-group-wrapper';

/**
 *
 * @param {string} rrule - RRule, or exrule as a string
 * @param {boolean}[hideColumnTitle] - A boolean used to determine whether we should the text
 * `Summary schedule` as this component is used by the RuleList.tsx, and by ScheduleDetails.tsx
 *
 */
export function ScheduleSummary(props: {
  rrule: string;
  isLocal: boolean;
  hideColumnTitle?: boolean;
}) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<{ local: string[]; utc: string[] }>();
  useEffect(() => {
    async function fetchPreview() {
      const { local, utc } = await postRequest<{ local: string[]; utc: string[] }>(
        awxAPI`/schedules/preview/`,
        {
          rrule: props.rrule,
        }
      );
      setPreview({ local, utc });
    }
    if (props.rrule) {
      void fetchPreview();
    }
  }, [props.rrule]);
  const timesArray = !props.isLocal ? preview?.utc : preview?.local;

  return (
    <Flex>
      {!props.hideColumnTitle && <FlexItem>{t('Schedule summary')}</FlexItem>}
      <FlexItem>
        <LabelGroupWrapper numLabels={5}>
          {timesArray?.map((value, i) => {
            return (
              <Label key={i}>
                {DateTime.fromISO(value, { setZone: true }).toLocaleString(
                  DateTime.DATETIME_SHORT_WITH_SECONDS
                )}
              </Label>
            );
          })}
        </LabelGroupWrapper>
      </FlexItem>
    </Flex>
  );
}
