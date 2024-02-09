import { t } from 'i18next';
import { DateTimeCell, PageDetail } from '../../framework/';

export function LastModifiedPageDetail(props: {
  value: string | number | undefined | null;
  author?: string;
  onClick?: () => void;
}) {
  return (
    <PageDetail label={t('Last modified')}>
      <DateTimeCell value={props.value} author={props?.author} onClick={props?.onClick} />
    </PageDetail>
  );
}
