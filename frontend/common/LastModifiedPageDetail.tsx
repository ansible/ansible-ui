import { t } from 'i18next';
import { PageDetail, DateTimeCell } from '../../framework/';

export function LastModifiedPageDetail(props: {
  value: string | number | undefined | null;
  author?: string;
  format?: 'since' | 'date-time';
  onClick?: () => void;
}) {
  return (
    <PageDetail label={t('Last modified')}>
      <DateTimeCell
        format={props.format ? props.format : 'date-time'}
        value={props.value}
        author={props?.author}
        onClick={props?.onClick}
      />
    </PageDetail>
  );
}
