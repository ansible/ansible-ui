import { Button, Split, SplitItem } from '@patternfly/react-core';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
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

export function DateTimeCell(props: {
  value: string | number | undefined | null;
  author?: string;
  format?: 'since' | 'date-time';
  onClick?: () => void;
}) {
  const [translations] = useFrameworkTranslations();
  const { author, onClick } = props;
  const [dateTime, setDateTime] = useState<string | null>(null);
  useEffect(() => {
    if (props.format === 'date-time' && typeof props.value === 'string') {
      setDateTime(formatDateString(props.value));
      return;
    } else {
      if (typeof props.value === 'number') {
        setDateTime(DateTime.fromMillis(props.value).toRelative());
      } else if (props.value) {
        setDateTime(DateTime.fromISO(props.value).toRelative());
      }
      const timeout = setInterval(() => {
        if (typeof props.value === 'number') {
          setDateTime(DateTime.fromMillis(props.value).toRelative());
        } else if (props.value) {
          setDateTime(DateTime.fromISO(props.value).toRelative());
        }
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [props.format, props.value]);
  if (props.value === undefined) return <></>;
  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      {dateTime}
      {author && <span>&nbsp;{translations.by}&nbsp;</span>}
      {onClick ? (
        <Button variant="link" isInline onClick={onClick}>
          {author}
        </Button>
      ) : (
        <span>{author}</span>
      )}
    </span>
  );
}
