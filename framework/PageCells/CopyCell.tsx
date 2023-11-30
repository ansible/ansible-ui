import { ClipboardCopy, Truncate } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useClipboard } from '../hooks/useClipboard';

export function CopyCell(props: { text?: string; minWidth?: number }) {
  const { writeToClipboard } = useClipboard();
  const { t } = useTranslation();

  if (!props.text) return <></>;
  return (
    <ClipboardCopy
      hoverTip={t('Copy to clipboard')}
      clickTip={t('Successfully copied to clipboard!')}
      variant="inline-compact"
      textAriaLabel={t('Copyable input')}
      toggleAriaLabel={t('Show content')}
      style={{ display: 'flex', flexWrap: 'nowrap', borderRadius: 4 }}
      onCopy={() => {
        writeToClipboard(props.text ?? '');
      }}
    >
      <Truncate content={props.text} style={{ minWidth: props.minWidth }} />
    </ClipboardCopy>
  );
}
