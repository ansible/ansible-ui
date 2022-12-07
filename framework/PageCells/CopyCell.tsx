import { ClipboardCopy, Truncate } from '@patternfly/react-core';

export function CopyCell(props: { text?: string; minWidth?: number }) {
  if (!props.text) return <></>;
  return (
    <ClipboardCopy
      hoverTip="Copy"
      clickTip="Copied"
      variant="inline-compact"
      style={{ display: 'flex', flexWrap: 'nowrap', borderRadius: 4 }}
      onCopy={() => {
        void navigator.clipboard.writeText(props.text ?? '');
      }}
    >
      <Truncate content={props.text} style={{ minWidth: props.minWidth }} />
    </ClipboardCopy>
  );
}
