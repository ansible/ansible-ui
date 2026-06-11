import { DateTimeCell, PageDetail } from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';

export function LastModifiedPageDetail(props: {
  value: string | number | undefined | null;
  author?: string;
  onClick?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <PageDetail label={t('Last modified')}>
      <DateTimeCell value={props.value} author={props?.author} onClick={props?.onClick} />
    </PageDetail>
  );
}
