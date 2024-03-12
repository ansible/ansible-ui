import { Button, Split, SplitItem } from '@patternfly/react-core';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { usePageSettings } from '../PageSettings/PageSettingsProvider';
import { useFrameworkTranslations } from '../useFrameworkTranslations';
import { formatDateString } from '../utils/formatDateString';

export function DateCell(props: { value: number | string }) {
  const date = new Date(props.value);
  return (
    <Split hasGutter>
      <SplitItem>{date.toLocaleDateString()}</SplitItem>
      <SplitItem>{date.toLocaleTimeString()}</SplitItem>
    </Split>
  );
}

const DateCellSpan = styled.span`
  white-space: nowrap;
`;

export function DateTimeCell(props: {
  value: string | number | undefined | null;
  author?: string;
  onClick?: () => void;
}) {
  const { t } = useTranslation();
  const [translations] = useFrameworkTranslations();
  const { author, onClick } = props;
  const [dateTime, setDateTime] = useState<string | null>(null);
  const settings = usePageSettings();
  const format = settings.dateFormat ? settings.dateFormat : 'date-time';

  const updateTime = useCallback(
    (value: string | number | undefined | null, format?: 'since' | 'date-time') => {
      let date: DateTime;
      if (typeof value === 'number') {
        date = DateTime.fromMillis(value);
      } else {
        date = DateTime.fromISO(value as string);
      }
      switch (format) {
        case 'since': {
          if (DateTime.now().toMillis() - date.toMillis() < 60 * 1000) {
            setDateTime(t('Less than a minute ago'));
          } else {
            setDateTime(date.toRelative());
          }
          break;
        }
        default:
          setDateTime(formatDateString(date.toJSDate()));
          break;
      }
    },
    [t]
  );

  useEffect(() => {
    updateTime(props.value, format);
    if (format === 'since') {
      const timeout = setInterval(() => updateTime(props.value, format), 1000);
      return () => clearTimeout(timeout);
    }
  }, [format, props.value, updateTime]);

  if (!props.value) return <></>;

  return (
    <DateCellSpan className="date-time">
      {dateTime}
      {author && <span>&nbsp;{translations.by}&nbsp;</span>}
      {onClick ? (
        <Button variant="link" isInline onClick={onClick}>
          {author}
        </Button>
      ) : (
        <span>{author}</span>
      )}
    </DateCellSpan>
  );
}
