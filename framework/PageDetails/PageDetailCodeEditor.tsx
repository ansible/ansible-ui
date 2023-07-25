import { useParams } from 'react-router-dom';
import {
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageDetail } from './PageDetail';
import React, { useState } from 'react';

export function PageDetailCodeEditor(props: {
  label?: string;
  value: string;
  helpText?: string;
  showCopyToClipboard?: boolean;
}) {
  const { value, label, helpText } = props;
  const { id } = useParams();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const clipboardCopyFunc = (event: React.MouseEvent<Element, MouseEvent>, text: string) => {
    void navigator.clipboard.writeText(text);
  };

  const onClick = (event: React.MouseEvent<Element, MouseEvent>, text: string) => {
    clipboardCopyFunc(event, text);
    setCopied(true);
  };

  const actions = props?.showCopyToClipboard ? (
    <React.Fragment>
      <CodeBlockAction>
        <ClipboardCopyButton
          id="basic-copy-button"
          textId="code-content"
          aria-label="Copy to clipboard"
          onClick={(e) => onClick(e, value)}
          exitDelay={copied ? 1500 : 600}
          maxWidth="110px"
          variant="plain"
          onTooltipHidden={() => setCopied(false)}
        >
          {copied ? t('Successfully copied to clipboard!') : t('Copy to clipboard')}
        </ClipboardCopyButton>
      </CodeBlockAction>
    </React.Fragment>
  ) : null;
  return (
    <PageDetail label={label ?? t('Variables')} helpText={helpText}>
      <CodeBlock id={id} actions={actions}>
        <CodeBlockCode>{value}</CodeBlockCode>
      </CodeBlock>
    </PageDetail>
  );
}
