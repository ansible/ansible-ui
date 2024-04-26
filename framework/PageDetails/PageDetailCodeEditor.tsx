import {
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
} from '@patternfly/react-core';
import React, { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useClipboard } from '../hooks/useClipboard';
import { PageDetail } from './PageDetail';

export function PageDetailCodeEditor(props: {
  label?: string;
  value: string;
  helpText?: string | ReactNode;
  showCopyToClipboard?: boolean;
  toggleLanguage?: boolean;
  isEmpty?: boolean;
  fullWidth?: boolean;
}) {
  const { value, label, helpText } = props;
  const { id } = useParams();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const { copySuccess, writeToClipboard } = useClipboard();

  const onClick = (event: React.MouseEvent<Element, MouseEvent>, text: string) => {
    writeToClipboard(text);
    setCopied(copySuccess);
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
    <PageDetail
      label={label ?? t('Variables')}
      helpText={helpText}
      isEmpty={props?.isEmpty}
      fullWidth={props?.fullWidth}
    >
      <CodeBlock id={id} actions={actions}>
        <CodeBlockCode data-cy={'code-block-value'}>{value}</CodeBlockCode>
      </CodeBlock>
    </PageDetail>
  );
}
